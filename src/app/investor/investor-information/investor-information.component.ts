import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../_services/profile.service';
import { GovernrateService } from '../../_services/governorate.service';
import { City } from '../../_models/city';
import { Governorate } from '../../_models/governorate';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { InvestorInvestingType, InvestingStages } from '../../_shared/enums';
import { CountryCodeService } from '../../_services/country-code.service';



@Component({
  selector: 'app-investor-information',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './investor-information.component.html',
  styleUrl: './investor-information.component.css'
})
export class InvestorInformationComponent {
  @Input() personalInfo!: any;
  @Output() personalInfoChange = new EventEmitter<any>();

  //* Tab functionality
  activeTab: 'personal' | 'documentation' = 'personal';
  url = environment.apiUrl;
  isSaving = false;
  saveMessage = '';

  //* Documentation images
  frontIdImageUrl: string | null = null;
  backIdImageUrl: string | null = null;
  showFrontIdOverlay: boolean = false;
  showBackIdOverlay: boolean = false;
  formData!: FormGroup;
  governorates: Governorate[] = [];
  Cities: City[] = [];
  FrontIdImageFile!: File;
  BackIdImageFile!: File;
  originalFormValue: any;
  private unsubscribe: Subscription[] = [];
  investingTypes = InvestorInvestingType
  InvestingStages = InvestingStages
  fundingRanges = [
    { value: 500, label: '500 EGP' },
    { value: 500000, label: '500K EGP' },
    { value: 1000000, label: '1M EGP' }
  ];

  minFunding = 500;        // 500 EGP
  maxFunding = 1000000;    // 1M EGP  
  selectedFundingMin = 500;     // 5K EGP (initial minimum)
  selectedFundingMax = 100000;   // 100K EGP (initial maximum)
  countryCodes: { code: string; country: string }[] = [];

  availableStages = [
    { value: this.InvestingStages.ideation, label: 'Ideation' },
    { value: this.InvestingStages.advanced, label: 'Advanced' },
    { value: this.InvestingStages.intermediate, label: 'Intermediate' },
    { value: this.InvestingStages.startup, label: 'Startup' },
  ];

  selectedStages: any[] = [];
  dropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private ProfileService: ProfileService,
    private governorateService: GovernrateService,
    private countryCodeService: CountryCodeService
  ) { }
  ngOnInit(): void {
    this.countryCodes = this.countryCodeService.getCountryCodes();
    this.initializeForms();
    this.loadGovernments();
    this.setFundingValuesFromDatabase();

  }

  initializeForms(): void {
    this.formData = this.fb.group({
      id: [this.personalInfo?.id || null],
      investingType: [this.personalInfo?.investingType || '', Validators.required],
      fundingRange: [`${this.selectedFundingMin}-${this.selectedFundingMax}`],

      interestedBusinessStages: [this.personalInfo?.interestedBusinessStages ? this.personalInfo.interestedBusinessStages.split(',').map(Number)
        : [],
      this.arrayRequiredValidator],
      user: this.fb.group({
        id: [this.personalInfo?.user?.id || 0],
        firstName: [this.personalInfo?.user?.firstName || '', Validators.required],
        lastName: [this.personalInfo?.user?.lastName || '', Validators.required],
        email: [this.personalInfo?.user?.email || '', [Validators.required, Validators.email]],
        phoneNumber: [this.personalInfo?.user?.phoneNumber || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        userType: [this.personalInfo?.user?.userType || 0],
        nationalId: [this.personalInfo?.user?.nationalId || ''],
        gender: [this.personalInfo?.user?.gender || ''],
        dateOfBirth: [this.personalInfo?.user?.dateOfBirth || '', [Validators.required, this.IsAgeValid]],
        governmentId: [this.personalInfo?.user?.governmentId || null, Validators.required],
        cityId: [this.personalInfo?.user?.cityId || null, Validators.required],
        address: [this.personalInfo?.user?.address || ''],
        countryCode: [this.personalInfo?.user?.countryCode || '+20', Validators.required]

      })
    });

    // Store original form value for comparison
    this.originalFormValue = this.formData.getRawValue();

    // Set image URLs
    this.frontIdImageUrl = this.personalInfo?.user?.frontIdPicPath || null;
    this.backIdImageUrl = this.personalInfo?.user?.backIdPicPath || null;
    const selectedCityId = this.personalInfo.user.cityId;
    if (this.personalInfo?.user.governmentId) {
      this.loadCities(this.personalInfo.user.governmentId, selectedCityId);
    }
    const selectedStageIds = this.formData.get('interestedBusinessStages')?.value || [];
    this.selectedStages = this.availableStages.filter(stage => selectedStageIds.includes(stage.value));
  }


  loadGovernments(): void {
    this.governorateService.getGovernrates().subscribe({
      next: (res) => {
        this.governorates = res.data;

      }
    });
  }

  loadCities(governmentId: number, selectedCityId?: number): void {
    this.governorateService.getCitiesByGovernrateId(governmentId).subscribe({
      next: (res) => {
        this.Cities = res.data;

        // Re-assign cityId after cities are loaded
        if (selectedCityId) {
          this.formData.get('user.cityId')?.setValue(selectedCityId);
        }
      },
      error: (err) => console.error('Error loading cities:', err)
    });
  }

  setFundingValuesFromDatabase(): void {
    const minFromDb = this.personalInfo?.minFunding;
    const maxFromDb = this.personalInfo?.maxFunding;

    this.selectedFundingMin = minFromDb ?? this.minFunding;
    this.selectedFundingMax = maxFromDb ?? this.maxFunding;
  }



  switchTab(tab: 'personal' | 'documentation'): void {
    this.activeTab = tab;
  }

  onFrontIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.FrontIdImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.frontIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onBackIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.BackIdImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.backIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFrontIdUpload(): void {
    const fileInput = document.getElementById('frontIdInput') as HTMLInputElement;
    fileInput?.click();
  }

  triggerBackIdUpload(): void {
    const fileInput = document.getElementById('backIdInput') as HTMLInputElement;
    fileInput?.click();
  }

  submitPersonalInfo(): void {
    if (!this.formData.valid) {
      this.formData.markAllAsTouched();
      this.saveMessage = 'Please fill all required fields.';
      return;
    }


    this.isSaving = true;
    this.saveMessage = '';

    // Check if form has actually changed
    const currentFormValue = this.formData.getRawValue();
    const hasFormChanged = JSON.stringify(this.originalFormValue) !== JSON.stringify(currentFormValue);


    if (!hasFormChanged) {
      this.saveMessage = 'No changes detected.';
      this.isSaving = false;
      return;
    }

    const rawData = this.formData.value;
    const formPayload = new FormData();

    for (const key in rawData) {
      if (key !== 'user') {
        if (key === 'interestedBusinessStages' && Array.isArray(rawData[key])) {
          formPayload.append(key, rawData[key].join(','));
        } else {
          formPayload.append(key, rawData[key]);
        }
      }
    }

    for (const key in rawData.user) {
      formPayload.append(`user.${key}`, rawData.user[key]);
    }

    formPayload.append('minFunding', this.selectedFundingMin.toString());
    formPayload.append('maxFunding', this.selectedFundingMax.toString());

    this.isSaving = true;
    this.ProfileService.update(formPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.isSaving = false;
          this.saveMessage = 'Profile updated successfully!'

          setTimeout(() => {
            this.saveMessage = '';

          }, 3000);
        }
        else {
          this.isSaving = false;
          this.saveMessage = 'Profile update Failed!'
        }
      },
      error: () => {
        this.isSaving = false;
        this.saveMessage = 'Failed while updating personal info.';
      }
    });
  }
  submitDocumentation(): void {

    this.isSaving = true;
    this.saveMessage = '';

    // Check if form has actually changed

    const hasNewImages = this.FrontIdImageFile || this.BackIdImageFile;

    if (!hasNewImages) {
      this.saveMessage = 'No changes detected.';
      this.isSaving = false;
      return;
    }

    const formData = new FormData();

    if (this.FrontIdImageFile) {
      formData.append('FrontIdPic', this.FrontIdImageFile);
    }

    if (this.BackIdImageFile) {
      formData.append('BackIdPic', this.BackIdImageFile);
    }

    this.ProfileService.updateNationalId(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {


          //this.personalInfo = res.data;
          // this.personalInfoChange.emit(res.data);
          this.isSaving = false;
          this.saveMessage = 'ID documentation updated successfully!'
          setTimeout(() => {
            this.saveMessage = '';

          }, 3000);
        }
        else {
          this.isSaving = false;
          this.saveMessage = 'ID documentation Failed!'
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.saveMessage = err?.error?.message || 'Failed to update documentation.';
      }
    });
  }


  onInvestmentTypeChange(): void {
    const investmentType = this.formData.get('investingType')?.value;
    const fundingRangeControl = this.formData.get('fundingRange');

    if (investmentType == InvestorInvestingType.Money || investmentType == InvestorInvestingType.Both) {
      fundingRangeControl?.setValidators([Validators.required]);
    } else {
      fundingRangeControl?.clearValidators();
      fundingRangeControl?.setValue('');
    }
    fundingRangeControl?.updateValueAndValidity();
  }
  get showFundingRange(): boolean {
    const investmentType = this.formData.get('investingType')?.value;
    return investmentType == InvestorInvestingType.Money || investmentType == InvestorInvestingType.Both;
  }
  onFundingMinChange(value: number) {
    const minGap = 500; // Minimum gap of 500 EGP between min and max

    // Prevent minimum from exceeding maximum (with gap)
    if (value >= this.selectedFundingMax) {
      this.selectedFundingMin = this.selectedFundingMax - minGap;
      // Update the DOM input value to reflect the corrected value
      this.updateFormValue('min', this.selectedFundingMin);
    } else {
      this.selectedFundingMin = value;
    }

    this.updateRangeFill();
    this.updateFormValue('range');
  }

  onFundingMaxChange(value: number) {
    const minGap = 500; // Minimum gap of 500 EGP between min and max

    // Prevent maximum from going below minimum (with gap)
    if (value <= this.selectedFundingMin) {
      this.selectedFundingMax = this.selectedFundingMin + minGap;
      // Update the DOM input value to reflect the corrected value
      this.updateFormValue('max', this.selectedFundingMax);
    } else {
      this.selectedFundingMax = value;
    }

    this.updateRangeFill();
    this.updateFormValue('range');
  }

  // Helper method to update form values and DOM elements
  private updateFormValue(type: 'min' | 'max' | 'range', value?: number) {
    if (type === 'min' && value !== undefined) {
      // Update the DOM input element for minimum slider
      const minSlider = document.querySelector('input[type="range"].range-min') as HTMLInputElement;
      if (minSlider) {
        minSlider.value = value.toString();
      }
    } else if (type === 'max' && value !== undefined) {
      // Update the DOM input element for maximum slider
      const maxSlider = document.querySelector('input[type="range"].range-max') as HTMLInputElement;
      if (maxSlider) {
        maxSlider.value = value.toString();
      }
    } else if (type === 'range') {
      // Update the form control with the current range
      const fundingRangeControl = this.formData.get('fundingRange');
      if (fundingRangeControl) {
        fundingRangeControl.setValue(`${this.selectedFundingMin}-${this.selectedFundingMax}`);
      }
    }
  }

  // Update the visual range fill between sliders
  updateRangeFill() {
    const minPercent = ((this.selectedFundingMin - this.minFunding) / (this.maxFunding - this.minFunding)) * 100;
    const maxPercent = ((this.selectedFundingMax - this.minFunding) / (this.maxFunding - this.minFunding)) * 100;

    const rangeFill = document.querySelector('.range-fill') as HTMLElement;
    if (rangeFill) {
      rangeFill.style.left = minPercent + '%';
      rangeFill.style.width = (maxPercent - minPercent) + '%';
    }
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace('.0', '') + 'M EGP';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K EGP';
    }
    return value.toLocaleString() + ' EGP';
  }

  // Calculate proper position for range indicators accounting for thumb width
  getIndicatorPosition(value: number): number {
    const percentage = ((value - this.minFunding) / (this.maxFunding - this.minFunding)) * 100;
    return Math.max(0, Math.min(100, percentage));
  }
  private arrayRequiredValidator(control: any) {
    const value = control.value;
    return value && Array.isArray(value) && value.length > 0 ? null : { required: true };
  }

  private IsAgeValid(control: any) {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      return actualAge < 21 ? { ageRestriction: true } : null;
    }

    return age < 21 ? { ageRestriction: true } : null;
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    setTimeout(() => this.dropdownOpen = false, 200);
  }

  selectStage(stage: any) {
    if (!this.selectedStages.find(s => s.value === stage.value)) {
      this.selectedStages.push(stage);
      this.updateFormControl();
    }
  }

  removeStage(stage: any, event: Event) {
    event.stopPropagation();
    this.selectedStages = this.selectedStages.filter(s => s.value !== stage.value);
    this.updateFormControl();
  }

  updateFormControl() {
    this.formData.get('interestedBusinessStages')?.setValue(this.selectedStages.map(s => s.value));
    this.formData.get('interestedBusinessStages')?.markAsTouched();
  }



  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }





}
