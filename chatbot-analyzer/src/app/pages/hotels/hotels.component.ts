import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddHotelDialogComponent } from './add-hotel-dialog/add-hotel-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService, Hotel } from 'src/app/services/api.service';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  editingHotels: Set<string> = new Set();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.apiService.getAdminHotels().subscribe({
      next: (response) => {
        this.hotels = response.hotels.map(hotel => ({
          ...hotel,
          payload: typeof hotel.payload === 'string' ? hotel.payload : JSON.stringify(hotel.payload, null, 2)
        }));
      },
      error: (error) => {
        this.showError('Failed to load hotels');
      }
    });
  }

  isEditing(hotel: Hotel): boolean {
    return this.editingHotels.has(hotel.name);
  }

  toggleEdit(hotel: Hotel): void {
    if (this.isEditing(hotel)) {
      this.updateHotel(hotel);
      this.editingHotels.delete(hotel.name);
    } else {
      this.editingHotels.add(hotel.name);
    }
  }

  updateHotel(hotel: Hotel): void {
    if (!this.validateHotel(hotel)) {
      return;
    }

    // Ensure payload is a valid JSON string before sending
    try {
      const payloadObj = JSON.parse(hotel.payload);
      const hotelToUpdate = {
        ...hotel,
        payload: payloadObj
      };

      this.apiService.updateHotel(hotel.name, hotelToUpdate).subscribe({
        next: () => {
          this.loadHotels();
          this.showSuccess('Hotel updated successfully');
        },
        error: (error) => {
          this.showError('Failed to update hotel');
        }
      });
    } catch (e) {
      this.showError('Invalid JSON payload');
    }
  }

  deleteHotel(hotelName: string): void {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.apiService.deleteHotel(hotelName).subscribe({
        next: () => {
          this.loadHotels();
          this.showSuccess('Hotel deleted successfully');
        },
        error: (error) => {
          this.showError('Failed to delete hotel');
        }
      });
    }
  }

  openAddHotelDialog(): void {
    const dialogRef = this.dialog.open(AddHotelDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hotels.push(result);
        this.snackBar.open('Hotel added successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  private validateHotel(hotel: Partial<Hotel>): boolean {
    if (!hotel.name?.trim()) {
      this.showError('Hotel name is required');
      return false;
    }
    if (!hotel.company_id?.trim()) {
      this.showError('Company ID is required');
      return false;
    }
    if (!hotel.payload) {
      this.showError('Payload is required');
      return false;
    }
    try {
      JSON.parse(hotel.payload);
      return true;
    } catch (e) {
      this.showError('Invalid JSON payload');
      return false;
    }
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

  formatJson(event: string, hotel: any): void {
    try {
      // Try to parse the JSON to validate it
      const parsedJson = JSON.parse(event);
      // If valid, format it nicely
      hotel.payload = JSON.stringify(parsedJson, null, 2);
    } catch (e) {
      // If invalid JSON, keep the original text
      // The error will be caught when saving
    }
  }

  isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }
} 