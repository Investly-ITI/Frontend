import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string;
  accountStatus: 'active' | 'suspended' | 'pending';
}

@Component({
  selector: 'app-founder-security',
  imports: [CommonModule, FormsModule],
  templateUrl: './founder-security.component.html',
  styleUrl: './founder-security.component.css'
})
export class FounderSecurityComponent {
  @Input() securitySettings!: SecuritySettings;
  @Output() securitySettingsChange = new EventEmitter<SecuritySettings>();

  isSaving = false;
  saveMessage = '';
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError = '';

  isPasswordFormValid(): boolean {
    return !!(
      this.passwordForm.currentPassword.trim() &&
      this.passwordForm.newPassword.trim() &&
      this.passwordForm.confirmPassword.trim() &&
      this.passwordForm.newPassword.length >= 8
    );
  }

  async onPasswordSubmit(): Promise<void> {
    // Clear previous errors
    this.passwordError = '';

    // Validate passwords
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    try {
      // Simulate API call - replace with actual service call
      await this.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword);
      
      // Update last password change date
      this.securitySettings.lastPasswordChange = new Date().toISOString().split('T')[0];
      this.securitySettingsChange.emit(this.securitySettings);
      
      // Clear form
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      
      this.saveMessage = 'Password changed successfully!';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.saveMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      this.passwordError = 'Failed to change password. Please check your current password.';
    } finally {
      this.isSaving = false;
    }
  }

  private async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate password validation and change
        if (currentPassword === 'wrongpassword') {
          reject(new Error('Current password is incorrect'));
        } else {
          console.log('Password changed successfully');
          resolve();
        }
      }, 1000);
    });
  }
} 