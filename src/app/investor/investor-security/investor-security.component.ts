import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../_services/profile.service';
import { AuthService } from '../../_services/auth.service';
import { Response } from '../../_models/response';
import { lastValueFrom } from 'rxjs';
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
@Component({
  selector: 'app-investor-security',
  imports: [CommonModule,FormsModule],
  templateUrl: './investor-security.component.html',
  styleUrl: './investor-security.component.css'
})
export class InvestorSecurityComponent {
@Input() securitySettings!: SecuritySettings;
  @Input() userEmail!: string;
  @Output() securitySettingsChange = new EventEmitter<SecuritySettings>();
  isSaving = false;
  saveMessage = '';
 
   constructor(
    private toastr:ToastrService,
    private ProfileService: ProfileService,
 private authService:AuthService
  ) {}
 
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
      const response = await lastValueFrom(this.ProfileService.changePassword(passwordData));
      console.log(response)
      if (response.isSuccess) {
        this.handleSuccessResponse(response);
      } else {
        this.handleApiError({
          statusCode: response.statusCode,
          message: response.message
        });
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
    
      return false;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      
      return false;
    }

    if (!this.isPasswordStrong(this.passwordForm.newPassword)) {
      this.passwordError = 'Password must include uppercase, lowercase, number, and special character';
    
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

    this.saveMessage = 'Password updated successfully!';
  
    setTimeout(() => this.saveMessage = '', 3000);
  }

  private handleApiError(response: { statusCode: number, message: string }): void {
    switch (response.statusCode) {
      case 400:
        this.passwordError = response.message.includes('incorrect')
          ? 'Current password is incorrect'
          : response.message;
        break;
      case 404:
        this.passwordError = 'User not found';
        break;
      case 500:
        this.passwordError = 'Server error. Please try again later.';
        break;
      default:
        this.passwordError = response.message || 'Unexpected error occurred';
    }

   
 
  }

  private handleHttpError(error: any): void {
    const errMsg = error?.error?.message || 'An error occurred while communicating with the server';

    this.passwordError = errMsg;


  
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
