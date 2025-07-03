import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { AiIdeaEvaluationResult, StandardAiResult } from '../../../_models/aiIdeaEvaluationResult';

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
  selector: 'app-add-idea',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-idea.component.html',
  styleUrl: './add-idea.component.css',
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
export class AddIdeaComponent implements OnInit, OnDestroy {
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

  // Loading and result modal properties
  isLoading = false;
  loadingMessage = 'Analyzing your business idea...';
  showResultModal = false;
  reviewResult: ReviewResult | null = null;

  private unsubscribe: Subscription[] = [];

  // Loading messages to cycle through
  private loadingMessages = [
    'Analyzing your business idea...',
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

  loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.governorates = response.data;
        }
      },
      error: (err) => {
        console.log("Error loading governorates:", err);
      }
    });
    this.unsubscribe.push(subGov);
  }

  loadCategories() {
    const subCat = this.categoryService.GetAllCategories().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.categories = response.data;
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

  onGovernorateChange(governorateId: number) {
    const subcity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          this.formData.get('CityId')?.setValue(null);
        }
      },
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
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
      std.Answer = std.Answer || '';
      std.touched = false;
    });
  }

  onStandardAnswerChange(index: number, event: any): void {
    const value = event.target.value;
    this.standards[index].Answer = value;
    this.standards[index].touched = true;
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
    const requiredFields = ['Description', 'Title', 'CategoryId', 'Stage', 'DesiredInvestmentType', 'GovernmentId', 'CityId', 'Location'];
    const basicFieldsValid = requiredFields.every(field => {
      const control = this.formData.get(field);
      return control && control.valid && control.value;
    });

    // Check funding goal if required
    if (this.showFundingGoal) {
      const capitalControl = this.formData.get('Capital');
      return basicFieldsValid && capitalControl && capitalControl.valid && capitalControl.value;
    }

    return basicFieldsValid;
  }

  isStep2Valid(): boolean {
    return this.standards.every(std => std.Answer && std.Answer.trim().length > 0);
  }

  isStep3Valid(): boolean {
    // At least one image is required
    return this.selectedImages.length >= 1;
  }

  // File upload methods
  onDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.isValidDocument(file)) {
        this.selectedDocument = file;
      } else {
        this.toastrService.error('Please select a valid document (PDF, Word, or PowerPoint) under 10MB', 'Invalid File');
        event.target.value = '';
      }
    }
  }

  onImagesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    if (this.selectedImages.length + files.length > this.maxImages) {
      this.toastrService.error(`You can only upload up to ${this.maxImages} images`, 'Too Many Files');
      return;
    }

    const validFiles = files.filter(file => this.isValidImage(file));

    if (validFiles.length !== files.length) {
      this.toastrService.warning('Some files were skipped. Only image files under 10MB are allowed', 'File Warning');
    }

    this.selectedImages = [...this.selectedImages, ...validFiles];
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  removeDocument(): void {
    this.selectedDocument = null;
  }

  isValidDocument(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    return allowedTypes.includes(file.type) && file.size <= this.maxFileSize;
  }

  isValidImage(file: File): boolean {
    return file.type.startsWith('image/') && file.size <= this.maxFileSize;
  }











  // Form submission methods
  onSubmitForAiReview(): void {
    if (!this.isFormCompletelyValid()) {
      this.toastrService.error('Please complete all required fields', 'Form Incomplete');
      return;
    }
    var formPayload = this.FormPayload(false);
    this.startAIReview(formPayload);
  }

  onSaveAsDraft(): void {
    if (!this.isStep1Valid()) {
      this.toastrService.error('Please complete basic information to save as draft', 'Incomplete Form');
      return;
    }
    var formData = this.FormPayload(true);
    this.sumbitForm(formData, true);
  }

  isFormCompletelyValid(): boolean {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid();
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

    // Add images
    this.selectedImages.forEach((image, index) => {
      formPayload.append(`Imagefiles`, image);
    });

    //aiReviewForEachStandards
    var aiIdeaEvaluationResult: AiIdeaEvaluationResult = {
      businessId: 0,
      generalFeedback: this.reviewResult?.generalFeedback??'',
      totalWeightedScore: this.reviewResult?.totalWeightScore??null,
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

    result = {
      isAccepted: (totalWeightScore ?? 0) > 50,
      generalFeedback: response.generalFeedback,
      totalWeightScore: totalWeightScore,
      allStandards: standards,
      rejectedStandards: standards.filter(s => s.weightContribution < (s.weight * .5)),
      message: (totalWeightScore ?? 0) > 50 ? "Congratulations! Your business idea meets our standards" :
        "Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal."
    };

    return result;

  }





  closeModal(): void {
    this.showResultModal = false;
    this.reviewResult = null;
  }

  saveAsDraft(): void {
    this.sumbitForm(this.FormPayload(true), true);
    //this.closeModal();
  }
  AddIdea():void{
    this.sumbitForm(this.FormPayload(false),false);
     //this.closeModal();
  }


  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }


  sumbitForm(formData: FormData, isDraft: boolean) {
    var sub = this.addIdeaService.AddIdea(formData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrService.success(
            isDraft ? 'Idea saved to drafts' : response.message,
            'Success'
          );
          this.showResultModal=false;
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

} 