import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../../_models/governorate';
import { City } from '../../../../_models/city';
import { GovernrateService } from '../../../../_services/governorate.service';

@Component({
  selector: 'app-add-by-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-by-document.component.html',
  styleUrl: './add-by-document.component.css'
})
export class AddByDocumentComponent implements OnInit, OnDestroy {
  @Output() submissionStarted = new EventEmitter<void>();
  
  private unsubscribe: Subscription[] = [];
  
  title = '';
  category = '';
  stage = '';
  governmentId = '';
  cityId = '';
  investmentType = '';
  fundingGoal = '';
  uploadedFile: File | null = null;

  categories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Food & Beverage', 'Real Estate', 'Entertainment', 'Transportation', 'Other'
  ];

  stages = [
    'Ideation', 'Startup', 'Intermediate', 'Advanced'
  ];

  investmentTypes = [
    'Industrial Experience',
    'Funding',
    'Both'
  ];

  // Replace static governments with dynamic data
  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  selectedGovernorate: boolean = false;

  constructor(private governorateService: GovernrateService) { }

  ngOnInit(): void {
    this.loadGovernorates();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  public loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess == true) {
          this.governorates = response.data;
        }
      },
      error: (err) => {
        console.log("Error loading governorates:", err);
      }
    });
    this.unsubscribe.push(subGov);
  }

  // Handle governorate selection change
  onGovernorateChange(governorateId: number) {
    const subcity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          // Reset city selection when governorate changes
          this.cityId = '';
        }
      }, 
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0] as File;
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit. Please select a smaller file.');
        event.target.value = '';
        return;
      }
      this.uploadedFile = file;
    }
    // Clear the input so the same file can be selected again
    event.target.value = '';
  }

  removeFile(): void {
    this.uploadedFile = null;
  }

  onInvestmentTypeChange(): void {
    // Clear funding goal when investment type doesn't require funding
    if (this.investmentType === 'Industrial Experience') {
      this.fundingGoal = '';
    }
  }

  isFundingRequired(): boolean {
    return this.investmentType === 'Funding' || this.investmentType === 'Both';
  }

  isFormValid(): boolean {
    const basicValid = !!(this.title && this.category && this.stage && 
                         this.governmentId && this.cityId && this.investmentType && this.uploadedFile);
    
    // Funding goal is only required if investment type requires funding
    const fundingGoalValid = !this.isFundingRequired() || !!this.fundingGoal;
    
    return basicValid && fundingGoalValid;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      console.error('Form is invalid');
      return;
    }
    
    // Emit submission started event
    this.submissionStarted.emit();
    
    const formData = {
      title: this.title,
      category: this.category,
      stage: this.stage,
      governmentId: this.governmentId,
      cityId: this.cityId,
      investmentType: this.investmentType,
      fundingGoal: this.fundingGoal,
      file: this.uploadedFile
    };
    
    console.log('Submitting document-based idea:', formData);
    // Submit to backend with status 'submitted'
  }

  onSaveAsDraft(): void {
    if (!this.isFormValid()) {
      console.error('All fields are required for draft');
      return;
    }

    const formData = {
      title: this.title,
      category: this.category,
      stage: this.stage,
      governmentId: this.governmentId,
      cityId: this.cityId,
      investmentType: this.investmentType,
      fundingGoal: this.fundingGoal,
      file: this.uploadedFile
    };
    
    console.log('Saving document-based idea as draft:', formData);
    // Save to backend with status 'draft'
  }
} 