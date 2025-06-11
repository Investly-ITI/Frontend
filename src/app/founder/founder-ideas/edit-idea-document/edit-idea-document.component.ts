import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../_models/governorate';
import { City } from '../../../_models/city';
import { GovernrateService } from '../../../_services/governorate.service';

interface Idea {
  id: string;
  title: string;
  category: string;
  status: 'approved' | 'draft' | 'submitted' | 'declined' | 'rejected-drafted';
  stage: string;
  description: string;
  submittedDate: string;
  government: string;
  city: string;
  fundingGoal?: string;
  declineReason?: string;
  submissionType: 'form' | 'document';
  formData?: any;
  documentFiles?: string[];
  rejectionData?: {
    message: string;
    standards: string[];
    rejectedAt: string;
  };
}

@Component({
  selector: 'app-edit-idea-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-idea-document.component.html',
  styleUrl: './edit-idea-document.component.css'
})
export class EditIdeaDocumentComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  
  @Input() idea!: Idea;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Idea>();
  @Output() saveStarted = new EventEmitter<void>();

  // Document data
  documentTitle = '';
  documentCategory = '';
  documentStage = '';
  documentGovernmentId = '';
  documentCityId = '';
  documentInvestmentType = '';
  documentFundingGoal = '';
  uploadedFile: File | null = null;
  existingDocumentFile: string = '';

  categories: string[] = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Food & Beverage', 'Real Estate', 'Entertainment', 'Transportation', 'Other'
  ];

  stages: string[] = [
    'Ideation', 'Startup', 'Intermediate', 'Advanced'
  ];

  investmentTypes: string[] = [
    'Industrial Experience',
    'Funding',
    'Both'
  ];

  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  selectedGovernorate: boolean = false;

  constructor(private governorateService: GovernrateService) { }

  ngOnInit(): void {
    this.loadGovernorates();
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    // Initialize document data
    this.documentTitle = this.idea.title;
    this.documentCategory = this.idea.category;
    this.documentStage = this.idea.stage;
    this.documentInvestmentType = this.idea.formData?.investmentType || '';
    this.documentFundingGoal = this.idea.fundingGoal || '';
    this.existingDocumentFile = (this.idea.documentFiles && this.idea.documentFiles.length > 0) ? this.idea.documentFiles[0] : '';
  }

  public loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess == true) {
          this.governorates = response.data;
          this.setInitialGovernorateAndCity();
        }
      },
      error: (err) => {
        console.log("Error loading governorates:", err);
      }
    });
    this.unsubscribe.push(subGov);
  }

  private setInitialGovernorateAndCity(): void {
    // Find and set the governorate based on idea's government
    const governorate = this.governorates.find(gov => gov.nameEn === this.idea.government);
    if (governorate) {
      this.documentGovernmentId = governorate.id.toString();
      this.onGovernorateChange(governorate.id);
    }
  }

  onGovernorateChange(governorateId: number): void {
    const subcity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          
          // Find and set the city
          const city = this.citiesByGovernorate.find(c => c.nameEn === this.idea.city);
          if (city) {
            this.documentCityId = city.id.toString();
          }
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

  removeNewFile(): void {
    this.uploadedFile = null;
  }

  onInvestmentTypeChange(): void {
    // Clear funding goal when investment type doesn't require funding
    if (this.documentInvestmentType === 'Industrial Experience') {
      this.documentFundingGoal = '';
    }
  }

  isFundingRequired(): boolean {
    return this.documentInvestmentType === 'Funding' || this.documentInvestmentType === 'Both';
  }

  isFormValid(): boolean {
    const basicValid = !!(this.documentTitle && this.documentCategory && this.documentStage && 
                         this.documentGovernmentId && this.documentCityId && this.documentInvestmentType &&
                         (this.existingDocumentFile || this.uploadedFile));
    
    // Funding goal is only required if investment type requires funding
    const fundingGoalValid = !this.isFundingRequired() || !!this.documentFundingGoal;
    
    return basicValid && fundingGoalValid;
  }

  onSaveChanges(): void {
    if (!this.isFormValid()) {
      console.error('Form is invalid');
      return;
    }
    
    // Emit save started event for AI review simulation
    this.saveStarted.emit();
    
    const updatedIdea: Idea = {
      ...this.idea,
      title: this.documentTitle,
      category: this.documentCategory,
      stage: this.documentStage,
      fundingGoal: this.documentFundingGoal,
      documentFiles: this.existingDocumentFile ? [this.existingDocumentFile] : [],
      formData: {
        ...this.idea.formData,
        investmentType: this.documentInvestmentType
      }
    };
    
    this.onSave.emit(updatedIdea);
  }

  onCancel(): void {
    this.onClose.emit();
  }
} 