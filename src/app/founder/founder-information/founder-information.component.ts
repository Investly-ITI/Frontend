import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  street: string;
  government: string;
  city: string;
  nationalId: string;
  gender: string;
}

@Component({
  selector: 'app-founder-information',
  imports: [CommonModule, FormsModule],
  templateUrl: './founder-information.component.html',
  styleUrl: './founder-information.component.css'
})
export class FounderInformationComponent {
  @Input() personalInfo!: PersonalInfo;
  @Output() personalInfoChange = new EventEmitter<PersonalInfo>();

  isSaving = false;
  saveMessage = '';

  isFormValid(): boolean {
    return this.isEmailValid() &&
           this.isPhoneNumberValid();
  }

  isEmailValid(): boolean {
    const email = this.personalInfo.email?.trim() || '';
    if (!email) return false; // Empty email is invalid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isPhoneNumberValid(): boolean {
    const phoneNumber = this.personalInfo.phoneNumber?.trim() || '';
    if (!phoneNumber) return false; // Empty phone number is invalid
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  }

  getFieldErrorMessage(field: string): string {
    switch (field) {
      case 'email':
        const email = this.personalInfo.email?.trim() || '';
        if (!email) {
          return 'Email address is required';
        }
        return !this.isEmailValid() ? 'Please enter a valid email address' : '';
      case 'phoneNumber':
        const phoneNumber = this.personalInfo.phoneNumber?.trim() || '';
        if (!phoneNumber) {
          return 'Phone number is required';
        }
        return !this.isPhoneNumberValid() ? 'Phone number must be exactly 10 digits' : '';
      default:
        return '';
    }
  }

  async onSave(): Promise<void> {
    if (!this.isFormValid()) {
      this.saveMessage = 'Please fix all validation errors before saving.';
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    try {
      // Only send editable fields to the backend
      const editableData = {
        email: this.personalInfo.email,
        countryCode: this.personalInfo.countryCode,
        phoneNumber: this.personalInfo.phoneNumber
      };
      
      await this.saveContactInformation(editableData);
      
      this.saveMessage = 'Contact information updated successfully!';
      this.personalInfoChange.emit(this.personalInfo);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.saveMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error saving contact information:', error);
      this.saveMessage = 'Failed to save contact information. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  onFieldChange(): void {
    this.personalInfoChange.emit(this.personalInfo);
  }

  private async saveContactInformation(editableData: any): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) { // 90% success rate
          console.log('Contact information saved:', editableData);
          resolve();
        } else {
          reject(new Error('Failed to save contact information'));
        }
      }, 1500);
    });
  }
} 