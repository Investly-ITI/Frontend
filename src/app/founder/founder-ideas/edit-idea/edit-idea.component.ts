import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

// Models and Services
import { Governorate } from '../../../_models/governorate';
import { City } from '../../../_models/city';
import { Category } from '../../../_models/category';
import { StandardAnswers } from '../../../_models/standardanswers';
import { GovernrateService } from '../../../_services/governorate.service';
import { CategoryService } from '../../../_services/category.service';
import { AddIdeaService } from '../../_services/add-idea.service';
import { StandardService } from '../../_services/Standards.service';
import { ToastrService } from 'ngx-toastr';

// Enums
import { InvestingStages, DesiredInvestmentType } from '../../../_shared/enums';

interface ContactRequest {
  id: string;
  investorName: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

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
  contactRequests?: ContactRequest[];
  rejectionData?: {
    message: string;
    standards: string[];
    rejectedAt: string;
  };
}

interface ReviewResult {
  isAccepted: boolean;
  message: string;
  standards?: string[];
}

@Component({
  selector: 'app-edit-idea',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-idea.component.html',
  styleUrl: './edit-idea.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class EditIdeaComponent implements OnInit, OnDestroy {
  @Input() idea!: Idea;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Idea>();
  @Output() saveStarted = new EventEmitter<void>();

  // Step management
  currentStep = 1;
  totalSteps = 3;
  
  // Form and data
  formData!: FormGroup;
  standards: any[] = [];
  
  // Dropdown data
  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  categories: Category[] = [];
  selectedGovernorate: boolean = false;
  
  // Enums for templates
  investingStages = InvestingStages;
  desiredInvestmentTypes = DesiredInvestmentType;
  
  // Form validation flags
  showFundingGoal: boolean = false;
  
  // File upload properties
  selectedDocument: File | null = null;
  selectedImages: File[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  maxImages = 5;
  
  // Existing files from the idea being edited
  existingDocument: string = '';
  existingImages: string[] = [];
  
  // Loading and result modal properties
  isLoading = false;
  loadingMessage = 'Updating your business idea...';
  showResultModal = false;
  reviewResult: ReviewResult | null = null;
  
  private unsubscribe: Subscription[] = [];
  
  // Loading messages to cycle through
  private loadingMessages = [
    'Updating your business idea...',
    'Checking market viability...',
    'Evaluating innovation potential...',
    'Assessing financial projections...',
    'Reviewing competition analysis...',
    'Finalizing AI review...'
  ];

  constructor(
    private fb: FormBuilder,
    private governorateService: GovernrateService,
    private categoryService: CategoryService,
    private addIdeaService: AddIdeaService,
    private standardService: StandardService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadGovernorates();
    this.loadCategories();
    this.loadExistingData();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  initializeForm(): void {
    this.formData = this.fb.group({
      Description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      Title: ['', Validators.required],
      CategoryId: [null, Validators.required],
      Stage: [null, Validators.required],
      DesiredInvestmentType: [null, Validators.required],
      GovernmentId: [null, Validators.required],
      CityId: [null, Validators.required],
      Capital: [null, [Validators.min(5000)]], 
      Location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    });

    this.formData.get('DesiredInvestmentType')?.valueChanges.subscribe(() => {
      this.updateFundingGoalVisibility();
    });
    
    this.formData.get('CategoryId')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.loadStandards(categoryId);
      } else {
        this.standards = [];
      }
    });
  }

  loadExistingData(): void {
    if (!this.idea) return;

    // Populate form with existing idea data
    this.formData.patchValue({
      Description: this.idea.description,
      Title: this.idea.title,
      Stage: this.getStageValue(this.idea.stage),
      DesiredInvestmentType: this.getInvestmentTypeValue(this.idea.formData?.investmentType || ''),
      Capital: this.idea.fundingGoal ? parseInt(this.idea.fundingGoal) : null,
      Location: this.idea.formData?.location || ''
    });

    // Load existing files
    this.existingDocument = (this.idea.documentFiles && this.idea.documentFiles.length > 0) ? this.idea.documentFiles[0] : '';
    this.existingImages = this.idea.formData?.images || [];

    // Update funding goal visibility based on investment type
    this.updateFundingGoalVisibility();
  }

  loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.governorates = response.data;
          this.setInitialLocation();
        }
      },
      error: (err) => {
        console.log("Error loading governorates:", err);
      }
    });
    this.unsubscribe.push(subGov);
  }

  setInitialLocation(): void {
    // Find and set the governorate based on idea's government
    const governorate = this.governorates.find(gov => gov.nameEn === this.idea.government);
    if (governorate) {
      this.formData.patchValue({ GovernmentId: governorate.id });
      this.onGovernorateChange(governorate.id);
    }
  }

  loadCategories() {
    const subCat = this.categoryService.GetAllCategories().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.categories = response.data;
          this.setInitialCategory();
        } else {
          this.toastrService.error('Failed to load categories', 'Error');
        }
      },
      error: (err) => {
        console.log("Error loading categories:", err);
        this.toastrService.error('Failed to load categories', 'Error');
      }
    });
    this.unsubscribe.push(subCat);
  }

  setInitialCategory(): void {
    // Find and set the category based on idea's category
    const category = this.categories.find(cat => cat.name === this.idea.category);
    if (category) {
      this.formData.patchValue({ CategoryId: category.id });
      this.loadStandards(category.id);
    }
  }

  onGovernorateChange(governorateId: number) {
    const subcity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          this.setInitialCity();
        }
      }, 
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
  }

  setInitialCity(): void {
    // Find and set the city based on idea's city
    const city = this.citiesByGovernorate.find(c => c.nameEn === this.idea.city);
    if (city) {
      this.formData.patchValue({ CityId: city.id });
    }
  }

  loadStandards(categoryId: number) {
    this.standardService.GetStandardsByCategory(categoryId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.standards = response.data;
          this.initializeStandards();
        } else {
          this.standards = [];
        }
      },
      error: () => {
        this.standards = [];
      }
    });
  }

  initializeStandards(): void {
    this.standards.forEach(std => {
      // Use existing answers if available, otherwise default to empty
      std.Answer = this.getExistingStandardAnswer(std.id) || '';
      std.touched = false; 
    });
  }

  getExistingStandardAnswer(standardId: number): string {
    // Get existing answer from idea's formData
    if (this.idea.formData && this.idea.formData.standards) {
      const existingStandard = this.idea.formData.standards.find((s: any) => s.id === standardId);
      return existingStandard ? existingStandard.answer : '';
    }
    return '';
  }

  getStageValue(stageName: string): number {
    switch (stageName.toLowerCase()) {
      case 'ideation': return this.investingStages.ideation;
      case 'startup': return this.investingStages.startup;
      case 'intermediate': return this.investingStages.intermediate;
      case 'advanced': return this.investingStages.advanced;
      default: return this.investingStages.ideation;
    }
  }

  getInvestmentTypeValue(typeName: string): number {
    switch (typeName) {
      case 'Industrial Experience': return this.desiredInvestmentTypes.IndustrialExperience;
      case 'Funding': return this.desiredInvestmentTypes.Funding;
      case 'Both': return this.desiredInvestmentTypes.Both;
      default: return this.desiredInvestmentTypes.IndustrialExperience;
    }
  }

  onStandardAnswerChange(index: number, event: any): void {
    const value = event.target.value;
    this.standards[index].Answer = value;
    this.standards[index].touched = true;
  }

  updateFundingGoalVisibility() {
    const investmentType = +this.formData.get('DesiredInvestmentType')?.value;
    
    if (investmentType === this.desiredInvestmentTypes.Both || 
        investmentType === this.desiredInvestmentTypes.Funding) {
      this.showFundingGoal = true;
      this.formData.get('Capital')?.setValidators([Validators.required, Validators.min(5000)]);
      this.formData.get('Capital')?.updateValueAndValidity();
    } else {
      this.showFundingGoal = false;
      this.formData.get('Capital')?.clearValidators();
      this.formData.get('Capital')?.setValue(null);
      this.formData.get('Capital')?.updateValueAndValidity();
    }
  }

  // Step navigation methods
  nextStep(): void {
    if (this.canProceedToNextStep()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      default:
        return false;
    }
  }

  isStep1Valid(): boolean {
    const basicFields = ['Description', 'Title', 'CategoryId', 'Stage', 'DesiredInvestmentType', 'GovernmentId', 'CityId', 'Location'];
    const basicValid = basicFields.every(field => {
      const control = this.formData.get(field);
      return control && control.valid && control.value;
    });

    const fundingValid = !this.showFundingGoal || (this.formData.get('Capital')?.valid && this.formData.get('Capital')?.value);
    
    return basicValid && fundingValid;
  }

  isStep2Valid(): boolean {
    return this.standards.length === 0 || this.standards.every(std => std.Answer && std.Answer.trim().length > 0);
  }

  isStep3Valid(): boolean {
    // At least one image is required (either existing or newly uploaded)
    return (this.selectedImages.length + this.existingImages.length) >= 1;
  }

  onDocumentSelected(event: any): void {
    const file = event.target.files[0] as File;
    if (file && this.isValidDocument(file)) {
      this.selectedDocument = file;
    }
    event.target.value = '';
  }

  onImagesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const validFiles = files.filter(file => this.isValidImage(file));
    
    const totalImages = this.selectedImages.length + this.existingImages.length + validFiles.length;
    if (totalImages <= this.maxImages) {
      this.selectedImages.push(...validFiles);
    } else {
      const available = this.maxImages - this.selectedImages.length - this.existingImages.length;
      this.toastrService.warning(`You can only upload up to ${this.maxImages} images total. You have ${available} slots remaining.`, 'Warning');
    }
    
    event.target.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  removeDocument(): void {
    this.selectedDocument = null;
  }

  removeExistingDocument(): void {
    this.existingDocument = '';
  }

  isValidDocument(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      this.toastrService.error('Only PDF and Word documents are allowed.', 'Invalid File Type');
      return false;
    }
    if (file.size > this.maxFileSize) {
      this.toastrService.error('File size exceeds 10MB limit.', 'File Too Large');
      return false;
    }
    return true;
  }

  isValidImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.toastrService.error('Only image files are allowed.', 'Invalid File Type');
      return false;
    }
    if (file.size > this.maxFileSize) {
      this.toastrService.error('Image size exceeds 10MB limit.', 'File Too Large');
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (this.isFormCompletelyValid()) {
      this.submitForm();
    }
  }



  isFormCompletelyValid(): boolean {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid();
  }

  submitForm(): void {
    if (!this.isFormCompletelyValid()) {
      this.toastrService.error('Please complete all required fields.', 'Form Invalid');
      return;
    }

    // Emit save started event for AI review simulation
    this.saveStarted.emit();

    // Start AI review
    this.startAIReview();
  }

  createUpdatedIdea(): Idea {
    const formValue = this.formData.value;
    
    // Find category and governorate names
    const category = this.categories.find(c => c.id === formValue.CategoryId);
    const governorate = this.governorates.find(g => g.id === formValue.GovernmentId);
    const city = this.citiesByGovernorate.find(c => c.id === formValue.CityId);
    
    const updatedIdea: Idea = {
      ...this.idea,
      title: formValue.Title,
      description: formValue.Description,
      category: category?.name || this.idea.category,
      stage: this.getStageName(formValue.Stage),
      government: governorate?.nameEn || this.idea.government,
      city: city?.nameEn || this.idea.city,
      fundingGoal: formValue.Capital ? formValue.Capital.toString() : undefined,
      status: 'submitted', // When updating, the idea goes to submitted status for review
      submissionType: 'form', // Unified approach - no more separate types
      documentFiles: this.existingDocument ? [this.existingDocument] : [],
      formData: {
        ...this.idea.formData,
        title: formValue.Title,
        category: category?.name || this.idea.category,
        stage: this.getStageName(formValue.Stage),
        investmentType: this.getInvestmentTypeName(formValue.DesiredInvestmentType),
        fundingGoal: formValue.Capital ? formValue.Capital.toString() : '',
        location: formValue.Location,
        standards: this.standards.map(std => ({
          id: std.id,
          question: std.description,
          answer: std.Answer
        })),
        images: this.existingImages
      }
    };

    return updatedIdea;
  }

  getStageName(stageValue: number): string {
    switch (stageValue) {
      case this.investingStages.ideation: return 'Ideation';
      case this.investingStages.startup: return 'Startup';
      case this.investingStages.intermediate: return 'Intermediate';
      case this.investingStages.advanced: return 'Advanced';
      default: return 'Ideation';
    }
  }

  getInvestmentTypeName(typeValue: number): string {
    switch (typeValue) {
      case this.desiredInvestmentTypes.IndustrialExperience: return 'Industrial Experience';
      case this.desiredInvestmentTypes.Funding: return 'Funding';
      case this.desiredInvestmentTypes.Both: return 'Both';
      default: return 'Industrial Experience';
    }
  }

  startAIReview(): void {
    this.isLoading = true;
    this.loadingMessage = this.loadingMessages[0];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % this.loadingMessages.length;
      this.loadingMessage = this.loadingMessages[messageIndex];
    }, 2000);

    // Simulate AI review process
    setTimeout(() => {
      clearInterval(messageInterval);
      this.simulateAIReview();
    }, 8000);
  }

  private simulateAIReview(): void {
    // Simulate AI review logic
    const isAccepted = Math.random() > 0.3; // 70% chance of acceptance
    
    this.reviewResult = {
      isAccepted: isAccepted,
      message: isAccepted 
        ? 'Your updated business idea meets all the required standards and has been successfully saved!'
        : 'Your updated business idea has some areas that need improvement. Please review the feedback below.',
      standards: isAccepted ? [] : [
        'Market analysis could be more comprehensive',
        'Financial projections need more detail',
        'Competitive advantage could be better defined'
      ]
    };
    
    this.isLoading = false;
    this.showResultModal = true;
  }

  closeModal(): void {
    this.showResultModal = false;
    
    if (this.reviewResult?.isAccepted) {
      const updatedIdea = this.createUpdatedIdea();
      this.onSave.emit(updatedIdea);
      this.onClose.emit();
    }
    
    this.reviewResult = null;
  }

  onCancel(): void {
    this.onClose.emit();
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
} 