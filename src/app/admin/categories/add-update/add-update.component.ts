import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Category, StandardCategoryDto, AddCategoryWithStandards, AddCategoryStandard, UpdateCategoryWithStandards, UpdateCategoryStandard } from '../../../_models/category';
import { Status } from '../../../_shared/enums';
import { CategoriesService } from '../../_services/categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-update',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-update.component.html',
  styleUrl: './add-update.component.css'
})
export class AddUpdateComponent implements OnInit, OnChanges {

  @Input() selectedEntity: Category | null = null;
  @Input() isEditMode: boolean = false;
  @Input() entityName: string = 'Category';
  @Input() modalMode: 'add' | 'view' = 'view';
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshData = new EventEmitter<void>();

  //* Form data
  formData!: FormGroup;
  categoryData!: Category;

  //* Status options
  Status = Status;
  statusOptions = [
    { value: Status.Active, label: 'Active' },
    { value: Status.Inactive, label: 'Inactive' }
  ];

  //* Standards management
  currentStandard: StandardCategoryDto = {
    id: 0,
    standardName: '',
    question: '',
    standardId: 0,
    standardCategoryWeight: 1
  };
  editingStandardIndex: number = -1;
  isAddingStandard: boolean = false;
  standardFieldsTouched: { [key: string]: boolean } = {};
  
  //* Track original standards for update operations
  originalStandards: StandardCategoryDto[] = [];
  deletedStandardIds: number[] = [];
  
  //* Track original form data for change detection
  originalFormData: any = null;



  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedEntity'] || changes['isEditMode']) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    // Set default status for new categories (Active = 1)
    const defaultStatus = this.modalMode === 'add' ? Status.Active : (this.selectedEntity?.status || Status.Active);
    
    this.formData = this.fb.group({
      id: [this.selectedEntity?.id || 0],
      name: [this.selectedEntity?.name || '', [Validators.required, Validators.minLength(2)]],
      status: [defaultStatus, this.modalMode === 'view' ? Validators.required : []],
      standards: this.fb.array([])
    });

    // Initialize standards array
    this.initializeStandards();

    // Enable form in edit mode, disable only in view mode
    if (this.modalMode === 'view' && !this.isEditMode) {
      this.formData.disable();
    } else {
      this.formData.enable();
    }
    
    // Store original form data for change detection (only in view mode)
    if (this.modalMode === 'view' && this.selectedEntity) {
      this.captureOriginalFormData();
    }
  }

  initializeStandards(): void {
    const standardsArray = this.formData.get('standards') as FormArray;
    standardsArray.clear();
    
    // Reset tracking arrays
    this.originalStandards = [];
    this.deletedStandardIds = [];

    if (this.selectedEntity?.standardCategoryDto) {
      // Store original standards for tracking changes
      this.originalStandards = [...this.selectedEntity.standardCategoryDto];
      
      this.selectedEntity.standardCategoryDto.forEach(standard => {
        standardsArray.push(this.createStandardFormGroup(standard));
      });
    }
  }

  createStandardFormGroup(standard?: StandardCategoryDto): FormGroup {
    return this.fb.group({
      id: [standard?.id || 0],
      standardName: [standard?.standardName || '', Validators.required],
      question: [standard?.question || '', Validators.required],
      standardId: [standard?.standardId || 0],
      standardCategoryWeight: [standard?.standardCategoryWeight || 1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  get standardsArray(): FormArray {
    return this.formData.get('standards') as FormArray;
  }

  addStandard(): void {
    // Check if adding this standard would exceed 100%
    const currentTotal = this.getTotalWeight();
    const newWeight = this.currentStandard.standardCategoryWeight;
    
    if (currentTotal + newWeight > 100) {
      return; // the UI show the validation
    }

    if (this.isValidStandard(this.currentStandard)) {
      this.standardsArray.push(this.createStandardFormGroup(this.currentStandard));
      this.resetCurrentStandard();
      this.isAddingStandard = false;
      this.standardFieldsTouched = {};
      this.validateTotalWeight();
    } else {
      // Mark all fields as touched to show validation errors
      this.standardFieldsTouched = {
        standardName: true,
        question: true,
        standardCategoryWeight: true
      };
      this.toastrService.error('Please fill in all standard fields correctly.', 'Validation Error');
    }
  }

  editStandard(index: number): void {
    const standard = this.standardsArray.at(index).value;
    this.currentStandard = { ...standard };
    this.editingStandardIndex = index;
    this.isAddingStandard = true;
  }

  updateStandard(): void {
    if (this.editingStandardIndex !== -1) {
      // Check if updating this standard would exceed 100%
      const currentTotal = this.getTotalWeight();
      const oldWeight = this.standardsArray.at(this.editingStandardIndex).get('standardCategoryWeight')?.value || 0;
      const newWeight = this.currentStandard.standardCategoryWeight;
      const totalAfterUpdate = currentTotal - oldWeight + newWeight;
      
      if (totalAfterUpdate > 100) {
        return; // Silent return, let the UI show the validation
      }

      if (this.isValidStandard(this.currentStandard)) {
        const standardFormGroup = this.createStandardFormGroup(this.currentStandard);
        this.standardsArray.setControl(this.editingStandardIndex, standardFormGroup);
        this.resetCurrentStandard();
        this.isAddingStandard = false;
        this.editingStandardIndex = -1;
        this.standardFieldsTouched = {};
        this.validateTotalWeight();
      } else {
        // Mark all fields as touched to show validation errors
        this.standardFieldsTouched = {
          standardName: true,
          question: true,
          standardCategoryWeight: true
        };
        this.toastrService.error('Please fill in all standard fields correctly.', 'Validation Error');
      }
    }
  }

  removeStandard(index: number): void {
    const standardControl = this.standardsArray.at(index);
    const standardId = standardControl.get('standardId')?.value;
    
    // If it's an existing standard (has standardId), mark for deletion
    if (standardId && standardId > 0) {
      this.deletedStandardIds.push(standardId);
    }
    
    // Remove from form array
    this.standardsArray.removeAt(index);
    this.validateTotalWeight();
  }

  startAddingStandard(): void {
    // Check if total weight is already 100%
    if (this.getTotalWeight() >= 100) {
      return; // Silent return, button should be disabled anyway
    }
    
    this.resetCurrentStandard();
    this.isAddingStandard = true;
    this.editingStandardIndex = -1;
    this.standardFieldsTouched = {};
  }

  cancelStandardEdit(): void {
    this.resetCurrentStandard();
    this.isAddingStandard = false;
    this.editingStandardIndex = -1;
    this.standardFieldsTouched = {};
  }

  resetCurrentStandard(): void {
    this.currentStandard = {
      id: 0,
      standardName: '',
      question: '',
      standardId: 0,
      standardCategoryWeight: 1
    };
  }

  isValidStandard(standard: StandardCategoryDto): boolean {
    const basicValidation = !!(standard.standardName && 
                              standard.question && 
                              standard.standardCategoryWeight >= 1 && 
                              standard.standardCategoryWeight <= 100);
    
    if (!basicValidation) {
      return false;
    }
    
    // Check total weight validation
    const currentTotal = this.getTotalWeight();
    const newWeight = standard.standardCategoryWeight;
    
    if (this.editingStandardIndex !== -1) {
      // For editing, subtract the old weight first
      const oldWeight = this.standardsArray.at(this.editingStandardIndex).get('standardCategoryWeight')?.value || 0;
      const totalAfterUpdate = currentTotal - oldWeight + newWeight;
      return totalAfterUpdate <= 100;
    } else {
      // For adding new standard
      return currentTotal + newWeight <= 100;
    }
  }

  validateTotalWeight(): void {
    const totalWeight = this.standardsArray.controls.reduce((sum, control) => {
      return sum + (control.get('standardCategoryWeight')?.value || 0);
    }, 0);

    if (totalWeight > 100) {
      this.toastrService.warning('Total weight of all standards exceeds 100%. Please adjust the weights.', 'Weight Warning');
    }
  }

  getTotalWeight(): number {
    return this.standardsArray.controls.reduce((sum, control) => {
      return sum + (control.get('standardCategoryWeight')?.value || 0);
    }, 0);
  }

  resetForm(): void {
    this.formData.reset();
    this.initializeForm();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.formData.enable();
      // Capture current state as original when entering edit mode
      this.captureOriginalFormData();
    } else {
      this.formData.disable();
      this.initializeForm(); // Reset form to original values
    }
  }

  onSubmit(): void {
    // Check if total weight is exactly 100%
    const totalWeight = this.getTotalWeight();
    if (totalWeight < 100) {
      this.toastrService.error(`Total weight is ${totalWeight}%. Please ensure all standards add up to exactly 100%.`, 'Validation Error');
      return;
    }

    if (this.formData.valid) {
      const formValue = this.formData.value;
      
      if (this.modalMode === 'add') {
        // For add mode, call service directly
        const addCategoryData = new AddCategoryWithStandards();
        addCategoryData.name = formValue.name.trim();
        addCategoryData.standards = formValue.standards.map((standard: any) => {
          const addStandard = new AddCategoryStandard();
          addStandard.standardName = standard.standardName.trim();
          addStandard.formQuestion = standard.question.trim();
          addStandard.weight = standard.standardCategoryWeight;
          return addStandard;
        });

        this.categoriesService.addCategoryWithStandards(addCategoryData).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success('Category added successfully!', 'Success');
              this.refreshData.emit();
              this.closeModal.emit();
            } else {
              this.toastrService.error(response.message || 'Failed to add category', 'Error');
            }
          },
          error: (err) => {
            console.log('Error adding category:', err);
            this.toastrService.error('An error occurred while adding category', 'Error');
          }
        });
      } else {
        // For edit mode, call update service directly
        const updateCategoryData = new UpdateCategoryWithStandards();
        updateCategoryData.id = formValue.id;
        updateCategoryData.name = formValue.name.trim();
        
        // Process current standards from form
        updateCategoryData.standards = formValue.standards.map((standard: any) => {
          const updateStandard = new UpdateCategoryStandard();
          updateStandard.standardName = standard.standardName.trim();
          updateStandard.formQuestion = standard.question.trim();
          updateStandard.weight = standard.standardCategoryWeight;
          updateStandard.isDeleted = false;
          
          // If standard has standardId, it's an existing standard
          if (standard.standardId && standard.standardId > 0) {
            updateStandard.standardId = standard.standardId;
          }
          // If no standardId, it's a new standard (standardId will be null/undefined)
          
          return updateStandard;
        });

        // Add deleted standards to the array
        this.deletedStandardIds.forEach(deletedId => {
          const deletedStandard = new UpdateCategoryStandard();
          deletedStandard.standardId = deletedId;
          deletedStandard.isDeleted = true;
          // For deleted standards, we don't need other fields
          deletedStandard.standardName = '';
          deletedStandard.formQuestion = '';
          deletedStandard.weight = 0;
          
          updateCategoryData.standards.push(deletedStandard);
        });

        this.categoriesService.updateCategoryWithStandards(updateCategoryData).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success('Category updated successfully!', 'Success');
              this.refreshData.emit();
              this.closeModal.emit();
            } else {
              this.toastrService.error(response.message || 'Failed to update category', 'Error');
            }
          },
          error: (err) => {
            console.log('Error updating category:', err);
            this.toastrService.error('An error occurred while updating category', 'Error');
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.formData);
      
      this.toastrService.error('Please fill in all required fields correctly.', 'Validation Error');
    }
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }



  // Helper method to get form control errors
  getFieldError(fieldName: string): string {
    const control = this.formData.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  // Helper method to check if field has error
  hasFieldError(fieldName: string): boolean {
    const control = this.formData.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  // Helper method to get standard field errors
  getStandardFieldError(field: string): string {
    // Only show errors if field has been touched
    if (!this.standardFieldsTouched[field]) {
      return '';
    }

    if (field === 'standardName' && !this.currentStandard.standardName) {
      return 'Standard name is required';
    }
    if (field === 'question' && !this.currentStandard.question) {
      return 'Question is required';
    }
    if (field === 'standardCategoryWeight') {
      if (this.currentStandard.standardCategoryWeight < 1 || this.currentStandard.standardCategoryWeight > 100) {
        return 'Weight must be between 1 and 100';
      }
      
      // Check total weight validation
      const currentTotal = this.getTotalWeight();
      const newWeight = this.currentStandard.standardCategoryWeight;
      
      if (this.editingStandardIndex !== -1) {
        // For editing, subtract the old weight first
        const oldWeight = this.standardsArray.at(this.editingStandardIndex).get('standardCategoryWeight')?.value || 0;
        const totalAfterUpdate = currentTotal - oldWeight + newWeight;
        if (totalAfterUpdate > 100) {
          return `Total weight would be ${totalAfterUpdate}% (exceeds 100%)`;
        }
      } else {
        // For adding new standard
        if (currentTotal + newWeight > 100) {
          return `Total weight would be ${currentTotal + newWeight}% (exceeds 100%)`;
        }
      }
    }
    return '';
  }

  // Helper method to mark standard field as touched
  onStandardFieldTouch(field: string): void {
    this.standardFieldsTouched[field] = true;
  }

  // Helper method to check if adding a standard is disabled
  isAddStandardDisabled(): boolean {
    return this.getTotalWeight() >= 100;
  }

  // Helper method to check if save button should be disabled due to weight validation
  isSaveDisabled(): boolean {
    const totalWeight = this.getTotalWeight();
    return totalWeight < 100;
  }

  // Capture original form data for change detection
  captureOriginalFormData(): void {
    if (this.formData && this.selectedEntity) {
      this.originalFormData = {
        name: this.selectedEntity.name,
        status: this.selectedEntity.status,
        standards: this.selectedEntity.standardCategoryDto.map(standard => ({
          id: standard.id,
          standardName: standard.standardName,
          question: standard.question,
          standardId: standard.standardId,
          standardCategoryWeight: standard.standardCategoryWeight
        }))
      };
    }
  }

  // Check if form has changes compared to original data
  hasFormChanges(): boolean {
    // In add mode, check if there's content to save
    if (this.modalMode === 'add') {
      const currentFormValue = this.formData?.value;
      const hasName = currentFormValue?.name?.trim();
      const hasStandards = this.standardsArray?.length > 0;
      return !!(hasName || hasStandards);
    }

    // No changes possible if no original data
    if (!this.originalFormData || !this.formData) {
      return false;
    }

    const currentFormValue = this.formData.value;

    // Check basic form fields
    if (currentFormValue.name?.trim() !== this.originalFormData.name) {
      return true;
    }

    // Check standards changes
    return this.hasStandardsChanges();
  }

  // Check if standards have changes
  hasStandardsChanges(): boolean {
    if (!this.originalFormData) {
      return false;
    }

    const currentStandards = this.formData.get('standards')?.value || [];
    const originalStandards = this.originalFormData.standards || [];

    // Check if any standards were deleted
    if (this.deletedStandardIds.length > 0) {
      return true;
    }

    // Check if number of standards changed
    if (currentStandards.length !== originalStandards.length) {
      return true;
    }

    // Check each current standard
    for (let i = 0; i < currentStandards.length; i++) {
      const current = currentStandards[i];
      
      // Find corresponding original standard by standardId
      const originalStandard = originalStandards.find((orig: any) => 
        orig.standardId && orig.standardId === current.standardId
      );

      if (originalStandard) {
        // Modified existing standard
        if (current.standardName?.trim() !== originalStandard.standardName ||
            current.question?.trim() !== originalStandard.question ||
            current.standardCategoryWeight !== originalStandard.standardCategoryWeight) {
          return true;
        }
      } else {
        // New standard (no matching standardId in original)
        if (current.standardName?.trim() || current.question?.trim() || current.standardCategoryWeight > 0) {
          return true;
        }
      }
    }

    return false;
  }


}
