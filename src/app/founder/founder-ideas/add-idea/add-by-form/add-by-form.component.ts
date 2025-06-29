import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../../_models/governorate';
import { City } from '../../../../_models/city';
import { GovernrateService } from '../../../../_services/governorate.service';
import { InvestingStages,DesiredInvestmentType } from '../../../../_shared/enums';
import { Category } from '../../../../_models/category';
import { CategoryService } from '../../../../_services/category.service';
import { ToastrService } from 'ngx-toastr';
import { IdeaService } from '../../../_services/idea.service';
import { StandardService } from '../../../_services/Standards.service';
import { StandardAnswers } from '../../../../_models/standardanswers';

@Component({
  selector: 'app-add-by-form',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './add-by-form.component.html',
  styleUrl: './add-by-form.component.css'
})
export class AddByFormComponent implements OnInit, OnDestroy {
  @Output() submissionStarted = new EventEmitter<void>();
  
  private unsubscribe: Subscription[] = [];
  
 formData!: FormGroup;
  showFundingGoal: boolean = false;
    investingStages = InvestingStages;
  desiredInvestmentTypes = DesiredInvestmentType;

  governorates: Governorate[] = [];
    citiesByGovernorate: City[] = [];
    selectedGovernorate: boolean = false;
    categories:Category[] = [];
      cityId = '';

  standards: any[] = [];

  

  constructor(private fb: FormBuilder,private governorateService: GovernrateService,private categoryService: CategoryService,private toastrservice:ToastrService,private AddIdeaService:IdeaService,private StandardService:StandardService) { }

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
  
 

initializeStandards(): void {
 
  this.standards.forEach(std => {
    std.Answer = std.Answer || '';
    std.touched = false; 
  });
}
   updateFundingGoalVisibility() {
  const investmentType =+ this.formData.get('DesiredInvestmentType')?.value;
  
  if (investmentType === this.desiredInvestmentTypes.Both|| 
      investmentType ===this.desiredInvestmentTypes.Funding) {
    this.showFundingGoal = true;
    this.formData.get('Capital')?.setValidators([Validators.required, Validators.min(5000)]);
    this.formData.get('Capital')?.updateValueAndValidity();
  } else {
  
    this.showFundingGoal = false;
    this.formData.get('Capital')?.clearValidators();
    this.formData.get('Capital')?.setValue(null);
    this.formData.get('Capital')?.updateValueAndValidity();
      console.log('Final showFundingGoal:', this.showFundingGoal);
  }
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

  public loadCategories()
{
  const subCat = this.categoryService.GetAllCategories().subscribe({
    next: (response) => {
      if (response.isSuccess) {
        this.categories = response.data;
      } else {
        this.toastrservice.error('Failed to load categories', 'Error');
      }
    },
    error: (err) => {
      console.log("Error loading categories:", err);
      this.toastrservice.error('Failed to load categories', 'Error');
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
         
          this.cityId = '';
        }
      }, 
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
  }

  onCategoryChange(): void {
    const categoryId = this.formData.get('CategoryId')?.value;
    if (categoryId) {
      this.loadStandards(categoryId);
    } else {
      this.standards = [];
    }
  }
  loadStandards(categoryId: number) {
    this.StandardService.GetStandardsByCategory(categoryId).subscribe({
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

 onStandardAnswerChange(index: number, event: any): void {
  const value = event.target.value;
  this.standards[index].Answer = value;
  
 
  this.standards[index].touched = true;
}
   isFormValid(): boolean {
    const areStandardsValid = this.standards.every(std => 
    std.Answer && std.Answer.trim().length > 0
  );
   const isFormControlsValid = this.formData.valid;
   
  return isFormControlsValid && areStandardsValid;
  }

onSubmit(): void {
    if (!this.isFormValid()) {
      this.formData.markAllAsTouched();
      return;
    }

   const rawData = this.formData.value;
  const formPayload = new FormData();
  
  for (const key in rawData) {
    const value = rawData[key];
    if (value !== null && value !== undefined && value !== '') {
      formPayload.append(key, value);
    }
  }


  formPayload.append('IsDrafted', 'false');
  
  
 const standardAnswers = this.standards
    .filter(std => std.Answer && std.Answer.trim().length > 0)
    .map(std => new StandardAnswers(std.id, std.Answer.trim()));
  
  standardAnswers.forEach((standard, index) => {
    formPayload.append(`BusinessStandardAnswers[${index}].StandardId`, standard.StandardId.toString());
    formPayload.append(`BusinessStandardAnswers[${index}].Answer`, standard.answer);
  });



  console.log("Form Data:", this.formData.value);
  console.log("Standard Answers:", standardAnswers);

console.log("Standards structure:", this.standards);

  console.log("Raw form data:", formPayload);

    this.AddIdeaService.AddIdea(formPayload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrservice.success(response.message, 'Success');
        } else {
          this.toastrservice.error(response.message, "Error");
        }
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
        this.toastrservice.error(errorMsg, 'Error');
      }
    });
  }

  onSaveAsDraft(): void {
    if (!this.isFormValid()) {
      this.formData.markAllAsTouched();
      return;
    }

   const rawData = this.formData.value;
  const formPayload = new FormData();
  

  for (const key in rawData) {
    const value = rawData[key];
    if (value !== null && value !== undefined && value !== '') {
      formPayload.append(key, value);
    }
  }

  
  formPayload.append('IsDrafted', 'true');
  

 const standardAnswers = this.standards
    .filter(std => std.Answer && std.Answer.trim().length > 0)
    .map(std => new StandardAnswers(std.id, std.Answer.trim()));
  
  standardAnswers.forEach((standard, index) => {
    formPayload.append(`BusinessStandardAnswers[${index}].StandardId`, standard.StandardId.toString());
    formPayload.append(`BusinessStandardAnswers[${index}].Answer`, standard.answer);
  });


    this.AddIdeaService.AddIdea(formPayload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrservice.success("Idea Saved To Drafts", 'Success');
        } else {
          this.toastrservice.error(response.message, "Error");
        }
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
        this.toastrservice.error(errorMsg, 'Error');
      }
    });
  }

  
   ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}