import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-question-dialog',
  templateUrl: './add-question-dialog.component.html',
  styleUrls: ['./add-question-dialog.component.scss']
})
export class AddQuestionDialogComponent {
  questionForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddQuestionDialogComponent>,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      question: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      this.dialogRef.close(this.questionForm.value.question);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 