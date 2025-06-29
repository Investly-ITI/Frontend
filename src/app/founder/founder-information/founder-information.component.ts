import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../_services/profile.service';
import { UpdateFounder, UpdateNationalIdRequest } from '../../_models/founder';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Governorate } from '../../_models/governorate';
import { City } from '../../_models/city';
import { GovernrateService } from '../../_services/governorate.service';
import { environment } from '../../../environments/environment';

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    countryCode: string;
    phoneNumber: string;
    address: string;
    government: string;
    governmentId: number | null;  
    city: string;
    cityId: number | null;        
    nationalId: string;
    gender: string;
    frontIdPicPath?: string;  // Add this
    backIdPicPath?: string;   // Add this
}

@Component({
  selector: 'app-founder-information',
  imports: [CommonModule, FormsModule],
  templateUrl: './founder-information.component.html',
  styleUrl: './founder-information.component.css'
})
export class FounderInformationComponent implements OnInit, OnChanges {

  private unsubscribe: Subscription[] = [];
  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  selectedGovernorate: boolean = false;

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
    private governorateService: GovernrateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Check if personalInfo has changed and reload images
    if (changes['personalInfo'] && changes['personalInfo'].currentValue) {
      this.loadPreviousIdImages();
    }
  }

  ngOnInit(): void {
    this.toastr.toastrConfig.positionClass = 'toast-top-right';
    this.toastr.toastrConfig.timeOut = 5000;
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.progressBar = true;
    this.loadGovernorates();
    
    // Load previous ID images when component initializes
    this.loadPreviousIdImages();
    this.loadProfileData();
  }
  private loadProfileData(): void {
    const sub = this.profileService.getProfileData().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          // Update the personalInfo with the fetched data
          this.personalInfo.frontIdPicPath = response.data.user.frontIdPicPath;
          this.personalInfo.backIdPicPath = response.data.user.backIdPicPath;
          
          // Load images if we're on the documentation tab
          if (this.activeTab === 'documentation') {
            this.loadPreviousIdImages();
          }
          
          // Notify parent component of changes
          this.personalInfoChange.emit(this.personalInfo);
        }
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.toastr.error('Failed to load profile data');
      }
    });
    this.unsubscribe.push(sub);
  }

  private loadPreviousIdImages(): void {
    // Check if we have previous image paths in personalInfo
    if (this.personalInfo?.frontIdPicPath) {
      this.frontIdImageUrl = this.getImageUrl(this.personalInfo.frontIdPicPath);
    }
    
    if (this.personalInfo?.backIdPicPath) {
      this.backIdImageUrl = this.getImageUrl(this.personalInfo.backIdPicPath);
    }
  }

  private getImageUrl(imagePath: string): string {
      const baseUrl =environment.apiUrl+'/'; 
      return baseUrl + imagePath;
  }


  public loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess == true) {
          this.governorates = response.data;
        }
      },
      error: (err) => {
        console.log("Error loading governorates", err);
        this.toastr.error('Failed to load governorates');
      }
    });
    this.unsubscribe.push(subGov);
  }


  invalidFileMessage: string = '';
  allowedExtensions = ['.jpg', '.jpeg', '.png'];

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

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
    if (tab === 'documentation') {
      this.loadPreviousIdImages();
    }
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
          
          // Update the personalInfo with new image paths from response
          if (response.data) {
            if (response.data.frontIdPicPath) {
              this.personalInfo.frontIdPicPath = response.data.frontIdPicPath;
            }
            if (response.data.backIdPicPath) {
              this.personalInfo.backIdPicPath = response.data.backIdPicPath;
            }
            
            // Emit the updated personalInfo to parent component
            this.personalInfoChange.emit(this.personalInfo);
          }
          
          // Clear the file selections since they're now saved
          this.frontIdFile = undefined;
          this.backIdFile = undefined;
          
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
            this.isPhoneNumberValid() &&
            !!this.personalInfo.firstName &&
            !!this.personalInfo.lastName;
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
          case 'firstName':
              return !this.personalInfo.firstName ? 'First name is required' : '';
          case 'lastName':
              return !this.personalInfo.lastName ? 'Last name is required' : '';
          // ... keep your existing cases
          default:
              return '';
      }
  }

  async onSave(): Promise<void> {
      if (!this.isFormValid()) {
          this.toastr.error('Please fix all validation errors before saving.');
          return;
      }

      this.isSaving = true;

      try {
          // Create UpdateFounder instance with the form data
          let date = new Date();
          if (this.personalInfo.dateOfBirth) {
              date = new Date(this.personalInfo.dateOfBirth);
          }

          const updateData = new UpdateFounder(
              this.personalInfo.firstName,
              this.personalInfo.lastName,
              this.personalInfo.countryCode + this.personalInfo.phoneNumber,
              this.personalInfo.gender || null,
              this.personalInfo.governmentId || null,
              this.personalInfo.cityId || null,
              this.personalInfo.address || null,
              date.toISOString().split('T')[0]  // This will now match string | null
          );
          console.log(updateData);
          this.profileService.updateFounder(this.personalInfo.email, updateData).subscribe({
              next: (response) => {
                  if (response.isSuccess) {
                      const message = response.statusCode === 200 
                          ? 'Profile updated successfully' 
                          : 'No changes detected';
                      this.toastr.success(message);
                      this.personalInfoChange.emit(this.personalInfo);
                  } else {
                      this.toastr.error(response.message || 'Update failed');
                  }
              },
              error: (error) => {
                  this.handleUpdateError(error);
              }
          });
      } catch (error) {
          console.error('Error updating profile:', error);
          this.toastr.error('An unexpected error occurred');
      } finally {
          this.isSaving = false;
      }
  }

  private handleUpdateError(error: any): void {
      let errorMessage = 'Failed to update profile';
      
      if (error.error?.message) {
          errorMessage = error.error.message;
      } else if (error.status === 400) {
          errorMessage = 'Phone number must be unique.';
      } else if (error.status === 404) {
          errorMessage = 'User not found';
      } else if (error.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
      }
      
      this.toastr.error(errorMessage);
  }



  onFieldChange(): void {
    this.personalInfoChange.emit(this.personalInfo);
  }

  governments: any[] = []; 
  cities: any[] = [];     

  onGovernorateChange(governorateId: number | null) {
    if (!governorateId) {
      this.citiesByGovernorate = [];
      this.selectedGovernorate = false;
      this.personalInfo.cityId = null;
      this.personalInfo.city = '';
      return;
    }

    const subCity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          
          // If there's only one city, select it automatically
          if (this.citiesByGovernorate.length === 1) {
            this.onCityChange(this.citiesByGovernorate[0].id);
          }
        }
      }, 
      error: (err) => {
        console.log("Error loading cities", err);
        this.toastr.error('Failed to load cities');
      }
    });
    this.unsubscribe.push(subCity);

    // Update the government name in personalInfo
    const selectedGov = this.governorates.find(g => g.id === governorateId);
    if (selectedGov) {
      this.personalInfo.government = selectedGov.nameEn;
      this.personalInfo.governmentId = selectedGov.id;
    }
    this.onFieldChange();
  }

  onCityChange(cityId: number | null) {
    const selectedCity = this.citiesByGovernorate.find(c => c.id === cityId);
    if (selectedCity) {
      this.personalInfo.city = selectedCity.nameEn;
      this.personalInfo.cityId = selectedCity.id;
    }
    this.onFieldChange();
  }



} 