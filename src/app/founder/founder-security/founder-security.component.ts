import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../_services/profile.service';
import { Observable, lastValueFrom } from 'rxjs';
import { AuthService } from '../../_services/auth.service';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string;
  accountStatus: string;
}

class ChangePassword {
  constructor(
    public email: string,
    public currentPassword: string,
    public newPassword: string,
    public confirmNewPassword: string
  ) {}
}




class Response<T> {
  constructor(
    public data: T,
    public isSuccess: boolean,
    public message: string,
    public statusCode: number
  ) {}
}

@Component({
  selector: 'app-founder-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './founder-security.component.html',
  styleUrls: ['./founder-security.component.css']
})
export class FounderSecurityComponent implements OnInit {
  @Input() securitySettings!: SecuritySettings;
  @Input() userEmail!: string;
  @Output() securitySettingsChange = new EventEmitter<SecuritySettings>();

  private toastr = inject(ToastrService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  isSaving = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError = '';

  ngOnInit(): void {
    // Get email from AuthService when component initializes
    const userData = this.authService.getUserData();
    if (userData && userData.email) {
      this.userEmail = userData.email;
    } else {
      this.toastr.error('Could not retrieve user email', 'Authentication Error');
    }
  }

  displayMessage = '';
  isSuccessMessage = false;
  messageTimeout: any;

  clearMessage(): void {
  this.displayMessage = '';
  if (this.messageTimeout) {
    clearTimeout(this.messageTimeout);
    this.messageTimeout = null;
  }
  }

  showMessage(message: string, isSuccess: boolean): void {
  this.clearMessage(); // Clear any existing messages
  this.displayMessage = message;
  this.isSuccessMessage = isSuccess;
  
  // Auto-hide after 5 seconds
  this.messageTimeout = setTimeout(() => {
    this.clearMessage();
  }, 5000);
}

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
  switch (field) {
    case 'current':
      this.showCurrentPassword = !this.showCurrentPassword;
      break;
    case 'new':
      this.showNewPassword = !this.showNewPassword;
      break;
    case 'confirm':
      this.showConfirmPassword = !this.showConfirmPassword;
      break;
  }
  }


  isPasswordFormValid(): boolean {
    return !!(
      this.passwordForm.currentPassword.trim() &&
      this.passwordForm.newPassword.trim() &&
      this.passwordForm.confirmPassword.trim() &&
      this.passwordForm.newPassword.length >= 8 &&
      this.passwordForm.newPassword === this.passwordForm.confirmPassword &&
      this.isPasswordStrong(this.passwordForm.newPassword)
    );
  }

  private isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\"{}|<>]).*$/;
    return passwordRegex.test(password) && password.length >= 8;
  }

  async onPasswordSubmit(): Promise<void> {
    this.passwordError = '';

    if (!this.validatePasswordForm()) {
      return;
    }

    this.isSaving = true;

    const passwordData = new ChangePassword(
      this.userEmail,
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword,
      this.passwordForm.confirmPassword
    );

    try {
      console.log(passwordData)
      const response = await lastValueFrom(this.profileService.changePassword(passwordData));
      console.log(response)
      if (response.isSuccess) {
        this.handleSuccessResponse(response);
      } else {
        this.handleApiError(response);
      }
    } catch (error: any) {
      this.handleHttpError(error);
    } finally {
      this.isSaving = false;
    }
  }

  private validatePasswordForm(): boolean {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      this.toastr.error('New passwords do not match', 'Validation Error');
      return false;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      this.toastr.error('Password must be at least 8 characters long', 'Validation Error');
      return false;
    }

    if (!this.isPasswordStrong(this.passwordForm.newPassword)) {
      this.passwordError = 'Password must contain at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character';
      this.toastr.error('Password must meet strength requirements', 'Validation Error');
      return false;
    }

    return true;
  }

private handleSuccessResponse(response: Response<string>): void {
  this.securitySettings.lastPasswordChange = new Date().toISOString();
  this.securitySettingsChange.emit(this.securitySettings);
  
  this.passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  this.showMessage(response.message, true);
}

  private handleApiError(response: Response<string>): void {
    switch (response.statusCode) {
      case 400:
        // Handle both validation errors and incorrect password as 400
        if (response.message.includes('Current password is incorrect')) {
          this.passwordError = 'Current password is incorrect';
          this.showMessage('Current password is incorrect. Please check and try again.', false);
        } else {
          this.handleValidationErrors(response);
        }
        break;
      case 404:
        this.passwordError = 'User not found';
        this.showMessage('User account not found. Please contact support.', false);
        break;
      case 500:
        this.passwordError = 'Server error occurred. Please try again later.';
        this.showMessage('Server error occurred. Please try again later.', false);
        break;
      default:
        this.passwordError = response.message || 'An unexpected error occurred';
        this.showMessage(response.message || 'An unexpected error occurred', false);
    }
  }

  private handleValidationErrors(response: Response<string>): void {
    if (response.message.includes('Password must contain')) {
      this.passwordError = response.message;
      this.showMessage(response.message, false);
    } else if (response.message.includes('Passwords do not match')) {
      this.passwordError = 'Passwords do not match';
      this.showMessage('Passwords do not match', false);
    } else {
      this.passwordError = response.message;
      this.showMessage(response.message, false);
    }
  }

private handleHttpError(error: any): void {
  if (!error.status) {
    this.passwordError = 'An unexpected error occurred. Please try again.';
    this.showMessage('An unexpected error occurred. Please try again.', false);
    return;
  }

  if (error.error && error.error.statusCode) {
    // Handle our custom error response format
    switch (error.error.statusCode) {
      case 400:
        if (error.error.message.includes('Current password is incorrect')) {
          this.passwordError = 'Current password is incorrect';
          this.showMessage('Current password is incorrect. Please check and try again.', false);
        } else {
          const errorMessage = error.error?.message || 'Invalid request data';
          this.passwordError = errorMessage;
          this.showMessage(errorMessage, false);
        }
        break;
      case 404:
        this.passwordError = error.error.message || 'User not found';
        this.showMessage(error.error.message || 'User account not found. Please contact support.', false);
        break;
      case 500:
        this.passwordError = error.error.message || 'Server error occurred. Please try again later.';
        this.showMessage(error.error.message || 'Server error occurred. Please try again later.', false);
        break;
      default:
        this.passwordError = error.error.message || 'An unexpected error occurred';
        this.showMessage(error.error.message || 'An unexpected error occurred', false);
    }
  } else {
    // Fallback to standard HTTP status code handling
    switch (error.status) {
      case 400:
        const errorMessage = error.error?.message || 'Invalid request data';
        this.passwordError = errorMessage;
        this.showMessage(errorMessage, false);
        break;
      case 404:
        this.passwordError = 'User not found';
        this.showMessage('User account not found. Please contact support.', false);
        break;
      case 500:
        this.passwordError = 'Server error occurred. Please try again later.';
        this.showMessage('Server error occurred. Please try again later.', false);
        break;
      case 0:
        this.passwordError = 'Unable to connect to server. Please check your internet connection.';
        this.showMessage('Unable to connect to server. Please check your internet connection.', false);
        break;
      default:
        this.passwordError = 'Network error occurred. Please check your connection and try again.';
        this.showMessage('Network error occurred. Please check your connection and try again.', false);
    }
  }
}



  // Password requirement helper methods
  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordForm.newPassword);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordForm.newPassword);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordForm.newPassword);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?\"{}|<>]/.test(this.passwordForm.newPassword);
  }

  getLastPasswordChange(): string {
    if (!this.securitySettings.lastPasswordChange) {
      return 'Never';
    }
    try {
      return new Date(this.securitySettings.lastPasswordChange).toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  }
}