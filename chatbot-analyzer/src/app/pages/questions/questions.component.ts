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
  editingQuestions: Set<string> = new Set();
  editedQuestion: string = '';

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.apiService.getAdminQuestions().subscribe({
      next: (response) => {
        this.questions = response.questions;
      },
      error: (error) => {
        this.showError('Failed to load questions');
      }
    });
  }

  isEditing(question: string): boolean {
    return this.editingQuestions.has(question);
  }

  toggleEdit(question: string): void {
    if (this.isEditing(question)) {
      this.updateQuestion(this.editedQuestion);
      this.editingQuestions.delete(question);
    } else {
      this.editedQuestion = question;
      this.editingQuestions.add(question);
    }
  }

  updateQuestion(question: string): void {
    // TODO: Implement API call to update question
    this.snackBar.open('Question updated successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  deleteQuestion(question: string): void {
    // TODO: Implement API call to delete question
    this.questions = this.questions.filter(q => q !== question);
    this.snackBar.open('Question deleted successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  openAddQuestionDialog(): void {
    const dialogRef = this.dialog.open(AddQuestionDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.questions.push(result);
        this.snackBar.open('Question added successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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