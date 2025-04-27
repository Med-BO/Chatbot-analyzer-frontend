import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';
import { AddQuestionDialogComponent } from './add-question-dialog/add-question-dialog.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  questions: string[] = [];
  questionBeingEdited: string = ""
  newQuestion: string = ""
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.apiService.getAdminQuestions().subscribe({
      next: (response) => {
        this.questions = response.questions;
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Failed to load questions');
        this.isLoading = false;
      }
    });
  }

  isEditing(questionToCheck: string): boolean {
    return questionToCheck == this.questionBeingEdited
  }

  toggleEdit(question: string): void {
    if (this.isEditing(question)) {
      this.updateQuestion(this.newQuestion)
    } else {
      this.newQuestion = question
      this.questionBeingEdited = question
    }
  }

  updateQuestion(newQuestion: string): void {
    this.apiService.updateQuestion(this.questionBeingEdited, newQuestion)
      .subscribe({
        next: () => {
          this.snackBar.open('Question updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.questionBeingEdited = ""
        },
        error: (error) => {
          this.snackBar.open('Failed to update question', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Error updating question:', error);
        }
      });
  }

  deleteQuestion(question: string): void {
    this.apiService.deleteQuestion(
      question
    ).subscribe((data) => {
      this.questions = this.questions.filter(q => q !== question);
      this.snackBar.open('Question deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, (error) => {
      console.log('Could not delete question ', error)
      this.snackBar.open('Question cloud not be deleted', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    })
    
  }

  openAddQuestionDialog(): void {
    const dialogRef = this.dialog.open(AddQuestionDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        this.apiService.addQuestion(
          result
        ).subscribe((data) => {
          this.questions.push(result);
          this.snackBar.open('Question added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        })
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
} 