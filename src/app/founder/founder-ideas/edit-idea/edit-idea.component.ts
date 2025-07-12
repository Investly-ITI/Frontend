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
import { IdeaService } from '../../_services/idea.service';
import { StandardService } from '../../_services/Standards.service';
import { ToastrService } from 'ngx-toastr';

// Enums
import { InvestingStages, DesiredInvestmentType } from '../../../_shared/enums';
import { AiIdeaEvaluationResult, StandardAiResult } from '../../../_models/aiIdeaEvaluationResult';

interface ContactRequest {
  id: string;
  investorName: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface Idea {
  id: number;
  founderId: number;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'declined' | 'rejected-drafted'|'inactive';
  stage: string;
  submittedDate: string;
  government: string;
  city: string;
  fundingGoal?: string;
  declineReason?: string;
  formData?: any;
  AiRate?: number;
  documentFiles?: string[];
  contactRequests?: ContactRequest[];
  rejectionData?: {
    message: string;
    standards: StandardAiResult[];
  };
}

interface ReviewResult {
  isAccepted: boolean;
  generalFeedback: string,
  message: string;
  totalWeightScore: number|null;
  allStandards?: StandardReview[];
  rejectedStandards?: StandardReview[];
}
interface StandardReview {
  standardCategoryId: number,
  standard: string;
  weight: number;
  achievmentScore: number;
  weightContribution: number;
  feedback: string;
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
    private addIdeaService: IdeaService,
    private standardService: StandardService,
    private toastrService: ToastrService
  ) { }

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
      Id: [0],
      FounderId: [0],
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

  loadExistingData() {
    if (!this.idea) return;

    // Populate form with existing idea data
    this.formData.patchValue({
      Id: this.idea.id,
      FounderId: this.idea.founderId,
      Description: this.idea.description,
      Title: this.idea.title,
      Stage: this.getStageValue(this.idea.stage),
      DesiredInvestmentType: this.getInvestmentTypeValue(this.idea.formData?.investmentType || ''),
      Capital: this.idea.fundingGoal ? parseInt(this.idea.fundingGoal) : null,
      Location: this.idea.formData?.location || ''
    });

    console.log(this.idea);

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
      const existingStandard = this.idea.formData.standards.find((s: any) => s.standardId === standardId);
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

  async onSubmit() {
    if (this.isFormCompletelyValid()) {
      await this.submitForm();
    }
  }























  FormPayload(isDraft: boolean = false): FormData {
    const rawData = this.formData.value;
    const formPayload = new FormData();

    // Add form data
    for (const key in rawData) {
      const value = rawData[key];
      if (value !== null && value !== undefined && value !== '') {
        formPayload.append(key, value);
      }
    }

    formPayload.append('IsDrafted', isDraft.toString());

    // Add standard answers
    const standardAnswers = this.standards
      .filter(std => std.Answer && std.Answer.trim().length > 0)
      .map(std => new StandardAnswers(std.id, std.Answer.trim()));

    standardAnswers.forEach((standard, index) => {
      formPayload.append(`BusinessStandardAnswers[${index}].StandardId`, standard.StandardId.toString());
      formPayload.append(`BusinessStandardAnswers[${index}].Answer`, standard.answer);
    });

    // Add document if selected
    if (this.selectedDocument) {
      formPayload.append('IdeaFile', this.selectedDocument);
    }


    // this.selectedImages.forEach((image, index) => {
    //   formPayload.append(`Imagefiles`, image);
    // });

    //aiReviewForEachStandards
    var aiIdeaEvaluationResult: AiIdeaEvaluationResult = {
      businessId: 0,
      generalFeedback: this.reviewResult?.generalFeedback ?? '',
      totalWeightedScore: this.reviewResult?.totalWeightScore ?? 0,
      standards: []
    };
    this.reviewResult?.allStandards?.forEach((s: StandardReview) => {
      aiIdeaEvaluationResult.standards?.push(
        new StandardAiResult(
          s.standard,
          s.weight,
          s.achievmentScore,
          s.weightContribution,
          s.standardCategoryId,
          s.feedback
        )
      );
    });


    // Add AiBusinessEvaluations fields directly to FormData
    formPayload.append('AiBusinessEvaluations.BusinessId', aiIdeaEvaluationResult.businessId.toString());
    formPayload.append('AiBusinessEvaluations.GeneralFeedback', aiIdeaEvaluationResult.generalFeedback);
    formPayload.append('AiBusinessEvaluations.TotalWeightedScore', aiIdeaEvaluationResult.totalWeightedScore !== null && aiIdeaEvaluationResult.totalWeightedScore !== undefined ? aiIdeaEvaluationResult.totalWeightedScore.toString() : '');

    // Add each standard in the list with proper bracket notation
    aiIdeaEvaluationResult.standards?.forEach((standard, index) => {
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].Name`, standard.name);
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].Weight`, standard.weight.toString());
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].AchievementScore`, standard.achievementScore.toString());
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].WeightedContribution`, standard.weightedContribution.toString());
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].StandardCategoryId`, standard.standardCategoryId.toString());
      formPayload.append(`AiBusinessEvaluations.Standards[${index}].Feedback`, standard.feedback);
    });
    return formPayload;
  }


  isFormCompletelyValid(): boolean {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid();
  }




  async submitForm() {
    if (!this.isFormCompletelyValid()) {
      this.toastrService.error('Please complete all required fields.', 'Form Invalid');
      return;
    }
    // Start AI review
    this.startAIReview(this.FormPayload(false));
  }

  startAIReview(formPayload: any): void {
    this.isLoading = true;
    this.showResultModal = false;
    var res = this.addIdeaService.Evaluate(formPayload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // this.ToastrService.success(response.message, 'Success');
          this.isLoading = false;
          this.AIReview(response.data);


        } else {
          this.toastrService.error(response.message, "Error");

        }
      }, error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
        this.toastrService.error(errorMsg, 'Error');
        this.isLoading = false;
      }
    })
    this.unsubscribe.push(res);
  }

  private AIReview(aiResponse: AiIdeaEvaluationResult): void {
    const result = this.ParseStandaredFromAiResponse(aiResponse);
    this.reviewResult = result;
    this.showResultModal = true;
  }


  private getAiTotalRate(response: AiIdeaEvaluationResult): number|null {
    return response.totalWeightedScore;

  }

  private ParseStandaredFromAiResponse(response: AiIdeaEvaluationResult): ReviewResult {
    var standards: StandardReview[] = [];
    var result: ReviewResult | null = null;

    var totalWeightScore = this.getAiTotalRate(response);
    response.standards?.map(s => {
      standards.push({
        standard: s.name,
        standardCategoryId: s.standardCategoryId,
        weight: s.weight,
        weightContribution: s.weightedContribution,
        feedback: s.feedback,
        achievmentScore: s.achievementScore
      })
    })

    const safeTotalWeightScore = totalWeightScore ?? 0;
    result = {
      isAccepted: safeTotalWeightScore > 50,
      generalFeedback: response.generalFeedback,
      totalWeightScore: totalWeightScore??null,
      allStandards: standards,
      rejectedStandards: standards.filter(s => s.weightContribution < (s.weight * .5)),
      message: safeTotalWeightScore > 50 ? "Congratulations! Your business idea meets our standards" :
        "Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal."
    };

    return result;

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
  closeModal(): void {
    this.showResultModal = false;

    if (this.reviewResult?.isAccepted) {
      const updatedIdea = this.createUpdatedIdea();
      this.onSave.emit(updatedIdea);
      this.onClose.emit();
    }

    this.reviewResult = null;
  }



  async saveAsDraft() {
    const imageFiles = await this.convertExistingImagesToFiles(this.existingImages);
    const allImages: File[] = [...imageFiles, ...this.selectedImages];
    const file= await this.convertExistingDocumentToFile(this.existingDocument)

    var formPayload = this.FormPayload(true);

    // Add all images to FormData
    allImages.forEach((image) => {
      formPayload.append('ImageFiles', image);
    });
     if(file){
      formPayload.append('IdeaFile',file);
    }


    this.sumbitForm(formPayload, true);
    //this.closeModal();
  }
  async AddIdea() {
    const imageFiles = await this.convertExistingImagesToFiles(this.existingImages);
    const allImages: File[] = [...imageFiles, ...this.selectedImages];
    const file= await this.convertExistingDocumentToFile(this.existingDocument)

    var formPayload = this.FormPayload(false);

    // Add all images to FormData
    allImages.forEach((image) => {
      formPayload.append('ImageFiles', image);
    });
    if(file){
      formPayload.append('IdeaFile',file);
    }

    this.sumbitForm(formPayload, false);
    //this.closeModal();
  }


  onCancel(): void {
    this.onClose.emit();
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getImagePreview(file: File): string {
    console.log(file);
    return URL.createObjectURL(file);
  }



  sumbitForm(formData: FormData, isDraft: boolean) {
    var sub = this.addIdeaService.UpdateIdea(formData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrService.success(
            isDraft ? 'Idea saved to drafts' : response.message,
            'Success'
          );
          this.showResultModal = false;
          this.saveStarted.emit();
        } else {
          this.toastrService.error(response.message, "Error");
        }
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
        this.toastrService.error(errorMsg, 'Error');
      }
    });
    this.unsubscribe.push(sub);

  }

async urlToAnyFile(url: string, filename: string, defaultMimeType: string = 'application/octet-stream'): Promise<File> {
  console.log(url);
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || defaultMimeType;
  return new File([blob], filename, { type: mimeType });
}

  async convertExistingImagesToFiles(existingImages: string[]): Promise<File[]> {
    return Promise.all(
      existingImages.map(url => {
        const filename = url.substring(url.lastIndexOf('/') + 1);
        return this.urlToAnyFile(url, filename);
      })
    );
  }
  async convertExistingDocumentToFile(documentUrl: string): Promise<File | null> {
    if (!documentUrl) return null;
    const filename = documentUrl.substring(documentUrl.lastIndexOf('/') + 1);
    return this.urlToAnyFile(documentUrl, filename, 'application/pdf');
  }
} 