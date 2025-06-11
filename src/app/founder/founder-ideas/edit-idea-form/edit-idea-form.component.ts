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

interface BusinessFormData {
  title: string;
  category: string;
  stage: string;
  governmentId: string;
  cityId: string;
  investmentType: string;
  fundingGoal: string;
  [key: string]: any;
}

interface QuestionConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
}

@Component({
  selector: 'app-edit-idea-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-idea-form.component.html',
  styleUrl: './edit-idea-form.component.css'
})
export class EditIdeaFormComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  
  @Input() idea!: Idea;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Idea>();
  @Output() saveStarted = new EventEmitter<void>();

  // Form data for editing
  formData: BusinessFormData = {
    title: '',
    category: '',
    stage: '',
    governmentId: '',
    cityId: '',
    investmentType: '',
    fundingGoal: ''
  };

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

  // Category-specific questions
  categoryQuestions: { [key: string]: QuestionConfig[] } = {
    'Technology': [
      { key: 'techStack', label: 'Technology Stack', type: 'text', placeholder: 'e.g., React, Node.js, MongoDB' },
      { key: 'targetMarket', label: 'Target Market', type: 'text', placeholder: 'e.g., Small businesses, Enterprise' },
      { key: 'problemSolving', label: 'What problem does it solve?', type: 'textarea', placeholder: 'Describe the problem your technology addresses' },
      { key: 'competitiveAdvantage', label: 'Competitive Advantage', type: 'textarea', placeholder: 'What makes your solution unique?' },
      { key: 'scalability', label: 'Scalability Plan', type: 'textarea', placeholder: 'How do you plan to scale your technology?' }
    ],
    'Healthcare': [
      { key: 'medicalSpecialty', label: 'Medical Specialty', type: 'text', placeholder: 'e.g., Cardiology, Mental Health' },
      { key: 'targetPatients', label: 'Target Patient Group', type: 'text', placeholder: 'e.g., Elderly, Children, Chronic patients' },
      { key: 'regulatoryCompliance', label: 'Regulatory Compliance', type: 'textarea', placeholder: 'How will you ensure medical regulations compliance?' },
      { key: 'clinicalValidation', label: 'Clinical Validation Plan', type: 'textarea', placeholder: 'Describe your clinical testing approach' },
      { key: 'healthcarePartners', label: 'Healthcare Partners', type: 'text', placeholder: 'Potential hospital/clinic partnerships' }
    ],
    'Finance': [
      { key: 'financialServices', label: 'Financial Services Offered', type: 'text', placeholder: 'e.g., Lending, Investment, Insurance' },
      { key: 'targetCustomers', label: 'Target Customers', type: 'text', placeholder: 'e.g., Individuals, SMEs, Corporations' },
      { key: 'complianceStrategy', label: 'Regulatory Compliance Strategy', type: 'textarea', placeholder: 'How will you handle financial regulations?' },
      { key: 'securityMeasures', label: 'Security Measures', type: 'textarea', placeholder: 'Describe your security and data protection plan' },
      { key: 'revenueModel', label: 'Revenue Model', type: 'textarea', placeholder: 'How will you generate revenue?' }
    ],
    'Education': [
      { key: 'educationLevel', label: 'Education Level', type: 'text', placeholder: 'e.g., K-12, University, Professional' },
      { key: 'subjectArea', label: 'Subject Area', type: 'text', placeholder: 'e.g., STEM, Languages, Arts' },
      { key: 'learningMethod', label: 'Learning Method', type: 'textarea', placeholder: 'Describe your teaching/learning approach' },
      { key: 'assessmentStrategy', label: 'Assessment Strategy', type: 'textarea', placeholder: 'How will you measure learning outcomes?' },
      { key: 'institutionPartnerships', label: 'Institution Partnerships', type: 'text', placeholder: 'Potential school/university partnerships' }
    ],
    'E-commerce': [
      { key: 'productCategory', label: 'Product Category', type: 'text', placeholder: 'e.g., Fashion, Electronics, Home goods' },
      { key: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Young professionals, Families' },
      { key: 'logisticsStrategy', label: 'Logistics Strategy', type: 'textarea', placeholder: 'How will you handle shipping and delivery?' },
      { key: 'paymentMethods', label: 'Payment Methods', type: 'text', placeholder: 'e.g., Credit cards, Digital wallets, COD' },
      { key: 'marketingStrategy', label: 'Marketing Strategy', type: 'textarea', placeholder: 'How will you acquire customers?' }
    ],
    'Food & Beverage': [
      { key: 'cuisineType', label: 'Cuisine/Product Type', type: 'text', placeholder: 'e.g., Italian, Healthy snacks, Beverages' },
      { key: 'targetMarket', label: 'Target Market', type: 'text', placeholder: 'e.g., Health-conscious, Families, Young adults' },
      { key: 'foodSafety', label: 'Food Safety Measures', type: 'textarea', placeholder: 'Describe your food safety and quality control' },
      { key: 'supplyChain', label: 'Supply Chain Strategy', type: 'textarea', placeholder: 'How will you source ingredients/materials?' },
      { key: 'distributionChannels', label: 'Distribution Channels', type: 'text', placeholder: 'e.g., Restaurants, Retail, Online' }
    ]
  };

  constructor(private governorateService: GovernrateService) { }

  ngOnInit(): void {
    this.loadGovernorates();
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    // Initialize form data
    this.formData = {
      title: this.idea.title,
      category: this.idea.category,
      stage: this.idea.stage,
      governmentId: '', // Will be set after governorates load
      cityId: '',
      investmentType: this.idea.formData?.investmentType || '',
      fundingGoal: this.idea.fundingGoal || '',
      ...(this.idea.formData || {})
    };
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
      this.formData.governmentId = governorate.id.toString();
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
            this.formData.cityId = city.id.toString();
          }
        }
      }, 
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
  }

  getCurrentCategoryQuestions(): QuestionConfig[] {
    return this.categoryQuestions[this.formData.category] || [];
  }

  onCategoryChange(): void {
    const categoryQuestions = this.getCurrentCategoryQuestions();
    
    // Remove old category-specific fields but keep common fields
    Object.keys(this.formData).forEach(key => {
      if (!['title', 'category', 'stage', 'governmentId', 'cityId', 'investmentType', 'fundingGoal'].includes(key)) {
        delete this.formData[key];
      }
    });

    // Initialize new category-specific fields
    categoryQuestions.forEach(question => {
      this.formData[question.key] = '';
    });
  }

  onInvestmentTypeChange(): void {
    // Clear funding goal when investment type doesn't require funding
    if (this.formData.investmentType === 'Industrial Experience') {
      this.formData.fundingGoal = '';
    }
  }

  isFundingRequired(): boolean {
    return this.formData.investmentType === 'Funding' || this.formData.investmentType === 'Both';
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
      title: this.formData.title,
      category: this.formData.category,
      stage: this.formData.stage,
      fundingGoal: this.formData.fundingGoal,
      formData: { ...this.formData }
    };
    
    this.onSave.emit(updatedIdea);
  }

  isFormValid(): boolean {
    const commonFieldsValid = !!(this.formData.title && this.formData.category && 
                               this.formData.stage && this.formData.governmentId && 
                               this.formData.cityId && this.formData.investmentType);
    
    // Funding goal is only required if investment type requires funding
    const fundingGoalValid = !this.isFundingRequired() || !!this.formData.fundingGoal;
    
    const categoryQuestions = this.getCurrentCategoryQuestions();
    const categoryFieldsValid = categoryQuestions.every(question => {
      return !!this.formData[question.key];
    });

    return commonFieldsValid && fundingGoalValid && categoryFieldsValid;
  }

  onCancel(): void {
    this.onClose.emit();
  }
} 