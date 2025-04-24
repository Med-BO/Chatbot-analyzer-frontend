import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Hotel {
  name: string;
  company_id: string;
  payload: string;
}

@Component({
  selector: 'app-add-hotel-dialog',
  templateUrl: './add-hotel-dialog.component.html',
  styleUrls: ['./add-hotel-dialog.component.scss']
})
export class AddHotelDialogComponent {
  hotelForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddHotelDialogComponent>,
    private fb: FormBuilder
  ) {
    this.hotelForm = this.fb.group({
      name: ['', Validators.required],
      company_id: ['', Validators.required],
      payload: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.hotelForm.valid) {
      this.dialogRef.close(this.hotelForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 