import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Governorate } from '../../_models/governorate';
import { City } from '../../_models/city';
import { GovernrateService } from '../../_services/governorate.service';
import { Subscription } from 'rxjs';
import { Gender } from '../../_shared/general';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 4;
  userType: 'investor' | 'founder' | null = null;
  isDarkMode = false;
  isLoading = false;
  private unsubscribe: Subscription[] = []; 

  // Form groups for each step
  typeSelectionForm!: FormGroup;
  personalInfoForm!: FormGroup;
  documentsForm!: FormGroup;
  investorPreferencesForm!: FormGroup;

  // File upload properties
  profilePicture: File | null = null;
  nationalCardFront: File | null = null;
  nationalCardBack: File | null = null;

  // Country codes for phone number (simplified)
  countryCodes = [
    { code: '+1', country: 'United States' },
    { code: '+20', country: 'Egypt' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+91', country: 'India' }
  ];

  selectedCountryCode = this.countryCodes.find(c=>c.code==='+20');

  // Investment options
  investmentTypes = [
    { value: 'funding', label: 'Funding', description: 'Provide financial support to startups' },
    { value: 'industrial_experience', label: 'Industrial Experience', description: 'Share expertise and mentorship' },
    { value: 'both', label: 'Both', description: 'Funding and industrial experience' }
  ];

  investmentStages = [
    { value: 'ideation', label: 'Ideation', description: 'Early concept development' },
    { value: 'startup', label: 'Startup', description: 'Initial business development' },
    { value: 'intermediate', label: 'Intermediate', description: 'Growing businesses' },
    { value: 'advanced', label: 'Advanced', description: 'Established companies' }
  ];

  // Funding range slider configuration (EGP currency)
  fundingRanges = [
    { value: 500, label: '500 EGP' },
    { value: 500000, label: '500K EGP' },
    { value: 1000000, label: '1M EGP' }
  ];

  minFunding = 500;        // 500 EGP
  maxFunding = 1000000;    // 1M EGP  
  selectedFundingMin = 500;     // 5K EGP (initial minimum)
  selectedFundingMax = 100000;   // 100K EGP (initial maximum)

  // Egyptian Governorates list
  governorates:Governorate[] = [];

  // Egyptian Cities grouped by governorate
  citiesByGovernorate:City[]=[];
  selectedGovernorate: boolean=false;

  //
Genders=Gender;
  // Carousel properties
  private carouselInterval: any;
  private currentSlideIndex = 0;
  private readonly carouselImages = [
    'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ];

  constructor(
    private formBuilder: FormBuilder
    ,private governorateService:GovernrateService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.checkDarkMode();
    this.startCarousel();
    this.loadGovernorates();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  public loadGovernorates(){
     var subGov=this.governorateService.getGovernrates().subscribe({
      next:(response)=> {
        if(response.isSuccess==true){
          this.governorates=response.data;
        }
      },
      error:(err)=>{
       console.log("errr");
      }
     })
     this.unsubscribe.push(subGov);
  }

    // Handle governorate selection change
  onGovernorateChange(governorate: number) {
    var subcity= this.governorateService.getCitiesByGovernrateId(governorate).subscribe({
      next:(response)=>{
         if(response.isSuccess){
          this.citiesByGovernorate=response.data;
          this.selectedGovernorate=true;
         }
      },error:(err)=>{
      console.log(err);
      }
    })

    // this.personalInfoForm.patchValue({ city: '' });
    
  }


  private initializeForms(): void {
    // Step 1: User type selection
    this.typeSelectionForm = this.formBuilder.group({
      userType: ['', Validators.required]
    });

    // Step 2: Personal information
    this.personalInfoForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, this.ageValidator]],
      countryCode: [`${this.selectedCountryCode?.code } ${this.selectedCountryCode?.country}`, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      street: ['', Validators.required],
      government: ['', Validators.required],
      city: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      gender: ['', Validators.required],
      password: ['', [Validators.required, 
        //Validators.minLength(8),
       //  this.passwordValidator
        ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Step 3: Documents upload
    this.documentsForm = this.formBuilder.group({
      profilePicture: ['', Validators.required],
      nationalCardFront: ['', Validators.required],
      nationalCardBack: ['', Validators.required]
    });

    // Step 4: Investor preferences (only for investors)
    this.investorPreferencesForm = this.formBuilder.group({
      investmentType: ['', Validators.required],
      investmentStages: [[], this.arrayRequiredValidator],
      fundingRange: [`${this.selectedFundingMin}-${this.selectedFundingMax}`]
    });
  }

  // Custom validators
  private ageValidator(control: any) {
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

  private passwordValidator(control: any) {
    if (!control.value) return null;
    
    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasNumbers = /\d/.test(control.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
    
    const valid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    return valid ? null : { passwordStrength: true };
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Custom validator for investment stages array
  private arrayRequiredValidator(control: any) {
    const value = control.value;
    return value && Array.isArray(value) && value.length > 0 ? null : { required: true };
  }

  private checkDarkMode(): void {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    this.applyTheme();
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 2600);
  }

  private nextSlide(): void {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
    slides[this.currentSlideIndex].classList.add('active');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;
    body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (this.isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    
    setTimeout(() => {
      body.style.transition = '';
    }, 600);
  }

  // Progress calculation
  get progressPercentage(): number {
    const maxSteps = this.userType === 'founder' ? 3 : 4;
    return (this.currentStep / maxSteps) * 100;
  }

  // Step navigation
  nextStep(): void {
   // if (this.validateCurrentStep()) {
   console.log(this.userType);
      this.userType="investor";
      const maxSteps=4;
      //const maxSteps = this.userType === 'founder' ? 3 : 4;
      if (this.currentStep < maxSteps) {
        this.currentStep++;
        this.animateStepTransition('next');
      }
    //}
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.animateStepTransition('prev');
    }
  }

  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        if (this.typeSelectionForm.valid) {
          this.userType = this.typeSelectionForm.get('userType')?.value;
          return true;
        }
        break;
      case 2:
        return this.personalInfoForm.valid;
      case 3:
        return this.documentsForm.valid;
      case 4:
        return this.investorPreferencesForm.valid;
    }
    
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.getCurrentForm());
    return false;
  }

  private getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.typeSelectionForm;
      case 2: return this.personalInfoForm;
      case 3: return this.documentsForm;
      case 4: return this.investorPreferencesForm;
      default: return this.typeSelectionForm;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private animateStepTransition(direction: 'next' | 'prev'): void {
    const container = document.querySelector('.signup-form-container');
    if (container) {
      container.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
      
      setTimeout(() => {
        container.classList.remove('slide-left', 'slide-right');
      }, 300);
    }
  }

  // File upload handlers
  onFileSelect(event: any, type: 'profile' | 'cardFront' | 'cardBack'): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!this.isValidImageFile(file)) {
        alert('Please select a valid image file (JPG, PNG, GIF) under 5MB');
        return;
      }

      switch (type) {
        case 'profile':
          this.profilePicture = file;
          this.documentsForm.patchValue({ profilePicture: file.name });
          break;
        case 'cardFront':
          this.nationalCardFront = file;
          this.documentsForm.patchValue({ nationalCardFront: file.name });
          break;
        case 'cardBack':
          this.nationalCardBack = file;
          this.documentsForm.patchValue({ nationalCardBack: file.name });
          break;
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  // Investment type change handler
  onInvestmentTypeChange(): void {
    const investmentType = this.investorPreferencesForm.get('investmentType')?.value;
    const fundingRangeControl = this.investorPreferencesForm.get('fundingRange');
    
    if (investmentType === 'funding' || investmentType === 'both') {
      fundingRangeControl?.setValidators([Validators.required]);
    } else {
      fundingRangeControl?.clearValidators();
      fundingRangeControl?.setValue('');
    }
    fundingRangeControl?.updateValueAndValidity();
  }

  // Investment stage selection handler
  onStageToggle(stage: string): void {
    const currentStages = this.investorPreferencesForm.get('investmentStages')?.value || [];
    const index = currentStages.indexOf(stage);
    
    if (index > -1) {
      currentStages.splice(index, 1);
    } else {
      currentStages.push(stage);
    }
    
    this.investorPreferencesForm.patchValue({ investmentStages: currentStages });
  }

  isStageSelected(stage: string): boolean {
    const currentStages = this.investorPreferencesForm.get('investmentStages')?.value || [];
    return currentStages.includes(stage);
  }

  // Form submission
  onSubmit(): void {
    if (this.validateCurrentStep()) {
      this.isLoading = true;
      
      // Simulate service calling
      setTimeout(() => {
        console.log('Registration completed:', {
          userType: this.userType,
          personalInfo: this.personalInfoForm.value,
          documents: {
            profilePicture: this.profilePicture,
            nationalCardFront: this.nationalCardFront,
            nationalCardBack: this.nationalCardBack
          },
          investorPreferences: this.userType === 'investor' ? this.investorPreferencesForm.value : null
        });
        
        this.isLoading = false;        // Navigate to login or dashboard !
      }, 2000);
    } else {
      // Show specific error message based on current step
      let errorMessage = '';
      switch (this.currentStep) {
        case 3:
          if (!this.profilePicture) errorMessage += 'Please upload your profile picture. ';
          if (!this.nationalCardFront) errorMessage += 'Please upload the front of your national ID. ';
          if (!this.nationalCardBack) errorMessage += 'Please upload the back of your national ID. ';
          break;
        case 4:
          if (this.userType === 'investor') {
            const investmentType = this.investorPreferencesForm.get('investmentType')?.value;
            const stages = this.investorPreferencesForm.get('investmentStages')?.value;
            if (!investmentType) errorMessage += 'Please select your investment type. ';
            if (!stages || stages.length === 0) errorMessage += 'Please select at least one investment stage. ';
          }
          break;
        default:
          errorMessage = 'Please fill in all required fields.';
      }
      
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  }

  // Getters for form controls
  get showFundingRange(): boolean {
    const investmentType = this.investorPreferencesForm.get('investmentType')?.value;
    return investmentType === 'funding' || investmentType === 'both';
  }

  get isLastStep(): boolean {
    const maxSteps = this.userType === 'founder' ? 3 : 4;
    return this.currentStep === maxSteps;
  }

  // Funding range slider methods
  onFundingMinChange(value: number) {
    if (value <= this.selectedFundingMax) {
      this.selectedFundingMin = value;
      this.updateRangeFill();
    }
  }

  onFundingMaxChange(value: number) {
    if (value >= this.selectedFundingMin) {
      this.selectedFundingMax = value;
      this.updateRangeFill();
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
    const thumbWidthPercent = 1.4; 
    const paddingPercent = 1.5; 
    
    if (percentage === 0) {
      return paddingPercent;
    } else if (percentage === 100) {
      return percentage - paddingPercent;
    } else {
      return percentage;
    }
  }


} 