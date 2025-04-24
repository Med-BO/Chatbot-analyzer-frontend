import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  results: {
    hotel: string;
    question: string;
    response: string;
    status: string;
  }[];
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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
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
    this.analysisResults = null;

    this.http.post<AnalysisResponse>(`${environment.apiUrl}/ask`, {
      questions: this.selectedQuestions.map(q => q.text),
      hotels: this.selectedHotels.map(h => h.name)
    }).subscribe({
      next: (response) => {
        this.analysisResults = response;
      },
      error: (err) => {
        this.error = 'Failed to run analysis';
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
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
}
