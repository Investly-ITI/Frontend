import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../../_models/governorate';
import { City } from '../../../../_models/city';
import { GovernrateService } from '../../../../_services/governorate.service';

interface BusinessFormData {
  // Common fields
  title: string;
  category: string;
  stage: string;
  governmentId: string;
  cityId: string;
  
  // Category-specific fields (dynamic)
  [key: string]: any;
}

interface QuestionConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
}

@Component({
  selector: 'app-add-by-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-by-form.component.html',
  styleUrl: './add-by-form.component.css'
})
export class AddByFormComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  
  formData: BusinessFormData = {
    title: '',
    category: '',
    stage: '',
    governmentId: '',
    cityId: ''
  };

  categories: string[] = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Food & Beverage', 'Real Estate', 'Entertainment', 'Transportation', 'Other'
  ];

  stages: string[] = [
    'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth Stage', 'Expansion'
  ];

  // Replace static governments with dynamic data
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
          this.formData.cityId = '';
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
    // Reset category-specific fields when category changes
    const categoryQuestions = this.getCurrentCategoryQuestions();
    
    // Remove old category-specific fields
    Object.keys(this.formData).forEach(key => {
      if (!['title', 'category', 'stage', 'governmentId', 'cityId'].includes(key)) {
        delete this.formData[key];
      }
    });

    // Initialize new category-specific fields
    categoryQuestions.forEach(question => {
      this.formData[question.key] = '';
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      console.error('Form is invalid');
      return;
    }
    
    console.log('Submitting form-based idea:', this.formData);
    // Submit to backend
  }

  isFormValid(): boolean {
    const commonFieldsValid = !!(this.formData.title && this.formData.category && 
                               this.formData.stage && this.formData.governmentId && this.formData.cityId);
    
    const categoryQuestions = this.getCurrentCategoryQuestions();
    const categoryFieldsValid = categoryQuestions.every(question => {
      const value = this.formData[question.key];
      return value && typeof value === 'string' && value.trim().length > 0;
    });

    return commonFieldsValid && categoryFieldsValid;
  }
} 