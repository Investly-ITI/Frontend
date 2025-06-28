import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../_services/profile.service';
import { UpdateNationalIdRequest } from '../../_models/founder';
import { ToastrService } from 'ngx-toastr';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
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
export class FounderInformationComponent implements OnInit {

  constructor(private profileService: ProfileService,
      private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.toastr.toastrConfig.positionClass = 'toast-top-right';
    this.toastr.toastrConfig.timeOut = 5000;
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.progressBar = true;
  }
  invalidFileMessage: string = '';
  allowedExtensions = ['.jpg', '.jpeg', '.png'];


  @Input() personalInfo!: PersonalInfo;
  @Output() personalInfoChange = new EventEmitter<PersonalInfo>();

  //* Tab functionality
  activeTab: 'personal' | 'documentation' = 'personal';

  isSaving = false;
  saveMessage = '';

  //* Documentation images
  frontIdImageUrl: string | null = null;
  backIdImageUrl: string | null = null;
  showFrontIdOverlay: boolean = false;
  showBackIdOverlay: boolean = false;

  switchTab(tab: 'personal' | 'documentation'): void {
    this.activeTab = tab;
  }

  frontIdFile?: File;
  backIdFile?: File;

  onFrontIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(`.${extension}`)) {
        this.invalidFileMessage = `Only ${this.allowedExtensions.join(', ')} files are allowed`;
        this.toastr.error(this.invalidFileMessage);
        this.frontIdFile = undefined;
        this.frontIdImageUrl = null;
        return;
      }
      
      this.invalidFileMessage = '';
      this.frontIdFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.frontIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.frontIdFile = undefined;
    }
  }

  onBackIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(`.${extension}`)) {
        this.invalidFileMessage = `Only ${this.allowedExtensions.join(', ')} files are allowed`;
        this.toastr.error(this.invalidFileMessage);
        this.backIdFile = undefined;
        this.backIdImageUrl = null;
        return;
      }
      
      this.invalidFileMessage = '';
      this.backIdFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.backIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.backIdFile = undefined;
    }
  }

  triggerFrontIdUpload(): void {
    const fileInput = document.getElementById('frontIdInput') as HTMLInputElement;
    fileInput?.click();
  }

  triggerBackIdUpload(): void {
    const fileInput = document.getElementById('backIdInput') as HTMLInputElement;
    fileInput?.click();
  }

  hasDocumentationToSave(): boolean {
    return !!this.frontIdFile || !!this.backIdFile;
  }

  hasValidDocumentationToSave(): boolean {
    return (!!this.frontIdFile || !!this.backIdFile) && !this.invalidFileMessage;
  }
  
  async onSaveDocumentation(): Promise<void> {
    if (!this.hasValidDocumentationToSave()) {
      const message = this.invalidFileMessage || 'Please upload at least one ID picture before saving.';
      this.toastr.error(message);
      return;
    }

    this.isSaving = true;

    try {
      await this.saveDocumentationData();
    } catch (error) {
      // Error handling is already done in saveDocumentationData
      console.error('Error saving documentation:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private async saveDocumentationData(): Promise<void> {
    if (!this.personalInfo?.email) {
      this.toastr.error('User email is required');
      throw new Error('User email is required');
    }

    const request: UpdateNationalIdRequest = {
      email: this.personalInfo.email,
      frontIdFile: this.frontIdFile, 
      backIdFile: this.backIdFile    
    };

    return new Promise((resolve, reject) => {
      this.profileService.updateNationalIdImages(request).subscribe({
        next: (response) => {
          const message = response.message || 'National ID images updated successfully';
          this.toastr.success(message);
          resolve();
        },
        error: (err) => {
          let errorMessage = 'Failed to save documentation. Please try again.';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 404) {
            errorMessage = 'User not found. Please refresh the page and try again.';
          } else if (err.status === 400) {
            errorMessage = 'Invalid file format or missing required fields.';
          } else if (err.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }
          
          this.toastr.error(errorMessage);
          reject(err);
        }
      });
    });
  }

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