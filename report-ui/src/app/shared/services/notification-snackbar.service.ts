import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationSnackbarService {
  config: MatSnackBarConfig = {
    duration: 5000,
  };

  constructor(private readonly snackBar: MatSnackBar) {}

  public success(message: string): void {
    this.config.panelClass = 'snackbar-success';
    this.snackBar.open(message, 'OK', this.config);
  }

  public error(message: string): void {
    this.config.panelClass = 'snackbar-error';
    this.snackBar.open(message, 'OK', this.config);
  }
}
