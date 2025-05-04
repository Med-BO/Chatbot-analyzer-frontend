import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { forkJoin, Observable, of, timeout } from 'rxjs';

interface Question {
  text: string;
  selected: boolean;
}

interface Hotel {
  name: string;
  company_id: string;
  selected: boolean;
}

interface AnalysisResponse {
  timestamp: string;
  results: AnalysisResult[];
}

interface AnalysisResult {
  hotel: string;
  question: string;
  response: string;
  status: string;
}

interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-chatbot-details',
  templateUrl: './chatbot-details.component.html',
  styleUrls: ['./chatbot-details.component.scss'],
})
export class ChatbotDetailsComponent implements OnInit {
  chatbotId: string = '';
  questions: Question[] = [];
  hotels: Hotel[] = [];
  selectedQuestions: Question[] = [];
  selectedHotels: Hotel[] = [];
  loading: boolean = false;
  analysisResults: AnalysisResponse | null = null;
  error: string | null = null;
  displayedColumns: string[] = ['hotel', 'question', 'response', 'status'];
  
  // Batch processing properties
  batchSize: number = 80;
  batchProgress: BatchProgress = {
    currentBatch: 0,
    totalBatches: 0,
    processedCount: 0,
    totalCount: 0
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.loadQuestions();
    this.loadHotels();
  }

  loadQuestions() {
    this.http.get<{ questions: string[] }>(`${environment.apiUrl}/questions`)
      .subscribe({
        next: (response) => {
          this.questions = response.questions.map(q => ({
            text: q,
            selected: false
          }));
        },
        error: (err) => {
          this.error = 'Failed to load questions';
          console.error(err);
        }
      });
  }

  loadHotels() {
    this.http.get<{ hotels: Hotel[] }>(`${environment.apiUrl}/hotels`)
      .subscribe({
        next: (response) => {
          this.hotels = response.hotels.map(h => ({
            ...h,
            selected: false
          }));
        },
        error: (err) => {
          this.error = 'Failed to load hotels';
          console.error(err);
        }
      });
  }

  runAnalysis() {
    if (this.selectedQuestions.length === 0 || this.selectedHotels.length === 0) {
      this.error = 'Please select at least one question and one hotel';
      return;
    }

    this.loading = true;
    this.error = null;
    
    // Initialize new results with timestamp
    this.analysisResults = {
      timestamp: new Date().toISOString(),
      results: []
    };

    const selectedQuestions = this.selectedQuestions.map(q => q.text);
    const selectedHotels = this.selectedHotels.map(h => h.name);
    
    // Calculate total combinations and batch count
    const totalCombinations = selectedQuestions.length * selectedHotels.length;
    const totalBatches = Math.ceil(totalCombinations / this.batchSize);
    
    // Setup batch progress tracking
    this.batchProgress = {
      currentBatch: 1,
      totalBatches: totalBatches,
      processedCount: 0,
      totalCount: totalCombinations
    };

    // Process batches sequentially
    this.processBatches(selectedQuestions, selectedHotels, 0);
  }

  processBatches(questions: string[], hotels: string[], startIndex: number) {
    const totalCombinations = questions.length * hotels.length;
    
    // If we've processed all combinations, we're done
    if (startIndex >= totalCombinations) {
      this.loading = false;
      this.snackBar.open('Analysis complete!', 'Close', { duration: 3000 });
      return;
    }
    
    // Prepare batch combinations
    const batchItems = this.prepareBatchItems(questions, hotels, startIndex);
    
    // Update progress
    this.batchProgress.currentBatch = Math.floor(startIndex / this.batchSize) + 1;
    
    // Send batch request
    this.sendBatchRequest(batchItems).subscribe({
      next: (response) => {
        if (!this.analysisResults) return;
        
        // Append new results
        this.analysisResults.results = [
          ...this.analysisResults.results,
          ...response.results
        ];
        
        // Update processed count
        this.batchProgress.processedCount += response.results.length;
        
        // Process next batch
        this.processBatches(questions, hotels, startIndex + this.batchSize);
      },
      error: (err) => {
        if (err.name === 'TimeoutError') {
          this.error = `Batch ${this.batchProgress.currentBatch} timed out after 30 minutes`;
        } else {
          this.error = `Failed to run analysis batch ${this.batchProgress.currentBatch}`;
        }
        console.error(err);
        this.loading = false;
      }
    });
  }

  prepareBatchItems(questions: string[], hotels: string[], startIndex: number): { questions: string[], hotels: string[] } {
    const batchCombinations: { question: string, hotel: string }[] = [];
    const totalCombinations = questions.length * hotels.length;
    
    // Generate all combinations
    for (let i = 0; i < hotels.length; i++) {
      for (let j = 0; j < questions.length; j++) {
        const index = i * questions.length + j;
        batchCombinations.push({
          question: questions[j],
          hotel: hotels[i]
        });
      }
    }
    
    // Get batch slice
    const slicedCombinations = batchCombinations.slice(startIndex, startIndex + this.batchSize);
    
    // Extract unique questions and hotels for this batch
    const batchQuestions = Array.from(new Set(slicedCombinations.map(item => item.question)));
    const batchHotels = Array.from(new Set(slicedCombinations.map(item => item.hotel)));
    
    return {
      questions: batchQuestions,
      hotels: batchHotels
    };
  }

  sendBatchRequest(batchItems: { questions: string[], hotels: string[] }): Observable<AnalysisResponse> {
    return this.http.post<AnalysisResponse>(`${environment.apiUrl}/ask`, {
      questions: batchItems.questions,
      hotels: batchItems.hotels
    }).pipe(
      timeout(1800000) // 30 minutes in milliseconds
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'no_response':
        return 'text-warning';
      default:
        return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'primary';
      case 'error':
        return 'warn';
      case 'no_response':
        return 'accent';
      default:
        return '';
    }
  }

  copyResponse(response: string) {
    navigator.clipboard.writeText(response).then(() => {
      this.snackBar.open('Response copied to clipboard!', 'Close', {
        duration: 2000,
      });
    });
  }

  copyAllResponses() {
    if (!this.analysisResults) return;
    
    const allResponses = this.analysisResults.results
      .map((result, index) => {
        return `Hotel: ${result.hotel}\nQuestion: ${result.question}\nResponse: ${result.response}\n\n`;
      })
      .join('');

    navigator.clipboard.writeText(allResponses).then(() => {
      this.snackBar.open('All responses copied to clipboard!', 'Close', {
        duration: 2000,
      });
    });
  }

  generateExcelReport() {
    if (!this.analysisResults) return;

    this.apiService.generateExcelReport(this.analysisResults)
      .subscribe({
        next: (blob: Blob) => {
          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);
          
          // Create a link element
          const link = document.createElement('a');
          link.href = url;
          
          // Extract filename from the response headers or use a default
          const timestamp = this.analysisResults?.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `chatbot_analysis_${timestamp}.xlsx`;
          
          // Append to body, click and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the URL
          window.URL.revokeObjectURL(url);
          
          this.snackBar.open('Excel report downloaded successfully!', 'Close', {
            duration: 2000,
          });
        },
        error: (error) => {
          this.snackBar.open('Error generating Excel report', 'Close', {
            duration: 2000,
          });
          console.error('Error generating Excel report:', error);
        }
      });
  }

  toggleSelectAllQuestions() {
    if (this.selectedQuestions.length === this.questions.length) {
      this.selectedQuestions = []
    } else {
      this.selectedQuestions = [...this.questions];
    }
  }
  
  toggleSelectAllHotels() {
    if (this.selectedHotels.length === this.hotels.length) {
      this.selectedHotels = []
    } else {
      this.selectedHotels = [...this.hotels];
    }
  }
}