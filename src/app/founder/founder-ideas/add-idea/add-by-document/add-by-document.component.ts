import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../../_models/governorate';
import { City } from '../../../../_models/city';
import { GovernrateService } from '../../../../_services/governorate.service';
import { CategoryService } from '../../../../_services/category.service';
import { ToastrService } from 'ngx-toastr';
import { AddIdeaService } from '../../../_services/add-idea.service';
import { Category } from '../../../../_models/category';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestingStages,DesiredInvestmentType } from '../../../../_shared/enums';

@Component({
  selector: 'app-add-by-document',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './add-by-document.component.html',
  styleUrl: './add-by-document.component.css'
})
export class AddByDocumentComponent implements OnInit {
  @Output() submissionStarted = new EventEmitter<void>();
  
  private unsubscribe: Subscription[] = [];
  
 
  cityId = '';
  
 
  modalMode: 'add' | 'view' = 'view';
 ;

  


  // Replace static governments with dynamic data
  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  selectedGovernorate: boolean = false;
  categories:Category[] = [];

  formData!: FormGroup;
  showFundingGoal: boolean = false;
  fileError: string | null = null;
  uploadedFile: File | null = null;

  investingStages = InvestingStages;
  desiredInvestmentTypes = DesiredInvestmentType;

  constructor(private fb: FormBuilder, private governorateService: GovernrateService, private categoryService: CategoryService,private toasterService:ToastrService,private AddIdeaService:AddIdeaService) { 
   
  }

  ngOnInit(): void {
    this.loadGovernorates();
    this.loadCategories();
    this.initializeForm();
   
  }

 

  initializeForm(): void {
       this.formData = this.fb.group({
      Title: ['', Validators.required],
      CategoryId: [null, Validators.required],
      Stage: [null, Validators.required],
      DesiredInvestmentType: [null, Validators.required],
      GovernmentId: [null, Validators.required],
      CityId: [null, Validators.required],
      Capital: [null, [Validators.min(5000)]], 
      Location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
 
      
    });
   
    // Listen for investmentType changes
    this.formData.get('DesiredInvestmentType')?.valueChanges.subscribe(() => {
      
      this.updateFundingGoalVisibility();
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
        this.toasterService.error('Failed to load categories', 'Error');
      }
    },
    error: (err) => {
      console.log("Error loading categories:", err);
      this.toasterService.error('Failed to load categories', 'Error');
    }
  });
  this.unsubscribe.push(subCat);
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.fileError = 'Please select a file.';
      this.uploadedFile = null;
      return;
    }
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Unsupported file type.';
      this.uploadedFile = null;
      return;
    }
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.fileError = 'File size exceeds 10MB.';
      this.uploadedFile = null;
      return;
    }
    this.uploadedFile = file;
    this.fileError = null;
  }

  removeFile() {
    this.uploadedFile = null;
    this.fileError = null;
  }

  isFormValid(): boolean {
    return this.formData.valid && !!this.uploadedFile && !this.fileError;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      // Mark all controls as touched to show errors
      this.formData.markAllAsTouched();
      if (!this.uploadedFile) {
        this.fileError = 'Please upload a document.';
      }
      return;
    } 
    else {
     
       const rawData = this.formData.value;
      const formPayload = new FormData();
      for (const key in rawData) {
          const value = rawData[key];
          if (value !== null && value !== undefined && value !== '') {
            formPayload.append(key, value);
          }
        }
        
      if (this.uploadedFile) {
        
        formPayload.append('IdeaFile', this.uploadedFile);

       

      } else {
       
        this.fileError = 'Please upload a document.';
        return;
      }
    formPayload.append('IsDrafted', 'false');
 
    console.log('Form Payload:', this.formData.value);
        var res = this.AddIdeaService.AddIdea(formPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toasterService.success(response.message, 'Success');
              
              

            } else {
              this.toasterService.error(response.message, "Error");

            }
          }, error: (err) => {
            const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
            this.toasterService.error(errorMsg, 'Error');
          }
        })
        this.unsubscribe.push(res);

        //edit
      } 
    
    
   
   
  }

  onSaveAsDraft(): void {
   if (!this.formData.valid) {
      this.formData.markAllAsTouched();
    } 
 
    else {
       const rawData = this.formData.value;
      const formPayload = new FormData();
      for (const key in rawData) {
          const value = rawData[key];
          if (value !== null && value !== undefined && value !== '') {
            formPayload.append(key, value);
          }
        }
      
   
     
      if (this.uploadedFile) {
      
        formPayload.append('IdeaFile', this.uploadedFile);

      
      } else {
        // handle error: file is required
        this.fileError = 'Please upload a document.';
        return;
      }
    
    formPayload.append('IsDrafted', 'true');
    
        var res = this.AddIdeaService.AddIdea(formPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toasterService.success("Idea Saved To Drafts", 'Success');
              
             

            } else {
              this.toasterService.error(response.message, "Error");

            }
          }, error: (err) => {
            const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
            this.toasterService.error(errorMsg, 'Error');
          }
        })
        this.unsubscribe.push(res);

        
      } 
    

  }
   ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}