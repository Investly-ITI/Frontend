import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BusinessDto, BusinessExploreDto, BusinessSearchRequest, BusinessListDto, InvestorPreferences, InvestorPreferencesApiResponse } from '../../_models/businesses';
import { Category } from '../../_models/category';
import { Governorate } from '../../_models/governorate';
import { InvestingStages, DesiredInvestmentType, BusinessIdeaStatus, ContactRequestStatus, UserType } from '../../_shared/enums';
import { CategoryService } from '../../_services/category.service';
import { GovernrateService } from '../../_services/governorate.service';
import { ExploreService } from './explore.service';
import { AuthService } from '../../_services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit, OnDestroy {

  // View states
  isGridView = true;
  isCarouselView = false;
  searchForm!: FormGroup;
  isLoading = true;
  
  // Accordion state
  isFiltersExpanded = false;
  
  // Carousel state
  currentCarouselIndex = 0;
  carouselItemsPerView = 3;

  // Data
  businesses: BusinessExploreDto[] = [];
  filteredBusinesses: BusinessExploreDto[] = [];
  categories: Category[] = [];
  governorates: Governorate[] = [];
  investorPreferences: InvestorPreferencesApiResponse | null = null;

  // Track if this is the initial load to avoid infinite loops
  private isInitialLoad = true;
  preferencesApplied = false;
  userMadeChanges = false; // Track if user explicitly changed filters
  private isClearing = false; // Track when we're in the middle of clearing filters

  // Image cycling for hover effect
  currentImageIndexes: { [businessId: number]: number } = {};
  imageIntervals: { [businessId: number]: any } = {};
  imageTimeouts: { [businessId: number]: any } = {};

  // Enums for template
  InvestingStages = InvestingStages;
  DesiredInvestmentType = DesiredInvestmentType;
  ContactRequestStatus = ContactRequestStatus;

  // Modal state
  showContactRequestModal = false;
  selectedBusiness: BusinessExploreDto | null = null;
  isSubmittingContactRequest = false;
  
  // Expose Math for template
  Math = Math;

  // Convert getter to simple property - getters in templates cause binding issues
  stageOptions: { value: string, label: string }[] = [];

  // Remove the getter and replace with method to initialize options
  private initializeStageOptions(): void {
    const baseOptions: { value: string, label: string }[] = [
      { value: '1', label: 'Ideation' },      // InvestingStages.ideation = 1
      { value: '2', label: 'Startup' },       // InvestingStages.startup = 2  
      { value: '3', label: 'Intermediate' },  // InvestingStages.intermediate = 3
      { value: '4', label: 'Advanced' }       // InvestingStages.advanced = 4
    ];
    
    // Add "Custom Preference" option only for investors
    if (this.isUserInvestor()) {
      baseOptions.push({ value: 'custom', label: 'Custom Preference' });
    }
    
    this.stageOptions = baseOptions;
  }

  // Get options for dropdown - excludes 'custom' so it's not selectable
  getSelectableStageOptions(): { value: string, label: string }[] {
    return [
      { value: '', label: 'All Stages' },
      { value: '1', label: 'Ideation' },
      { value: '2', label: 'Startup' },
      { value: '3', label: 'Intermediate' },
      { value: '4', label: 'Advanced' }
    ];
  }

  // Get display text for selected value - includes custom preference display
  getStageDisplayText(): string {
    const selectedValue = this.searchForm.get('stage')?.value;
    if (selectedValue === 'custom') {
      return 'Custom Preference';
    }
    if (!selectedValue || selectedValue === '') {
      return 'All Stages';
    }
    const option = this.stageOptions.find(opt => opt.value === selectedValue);
    return option ? option.label : 'All Stages';
  }

  investmentTypeOptions = [
    { value: DesiredInvestmentType.IndustrialExperience, label: 'Industrial Experience' },
    { value: DesiredInvestmentType.Funding, label: 'Funding' },
    { value: DesiredInvestmentType.Both, label: 'Both' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private governorateService: GovernrateService,
    private exploreService: ExploreService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initializeStageOptions(); // Initialize stage options first
    this.initializeForm();
    this.loadInitialData();
    this.loadBusinesses(); // Load real data instead of generating sample data
  }

  initializeForm() {
    this.searchForm = this.fb.group({
      searchInput: [''],
      categoryId: [''],
      stage: [''], // Initialize with empty string to match "All Stages" option
      governorateId: [''],
      minFunding: [null],
      maxFunding: [null],
      minAiRate: [50], // Default to 50+ Good rating
      investmentType: ['']
    });

    // Subscribe to form changes for real-time filtering with debounce
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe((formValues) => {
      // Skip if we're in the middle of clearing filters
      if (this.isClearing) {
        return;
      }
      
      // Mark that user has made changes only after initial setup is complete
      if (this.preferencesApplied && !this.isInitialLoad && !this.userMadeChanges) {
        this.userMadeChanges = true;
      }
      this.loadBusinesses();
    });

    // Clear funding fields when Industrial Experience is selected
    this.searchForm.get('investmentType')?.valueChanges.subscribe((investmentType) => {
      if (investmentType == DesiredInvestmentType.IndustrialExperience || investmentType == '1') {
        this.searchForm.patchValue({
          minFunding: null,
          maxFunding: null
        }, { emitEvent: false });
      }
    });
  }

  async loadInitialData() {
    try {
      // Load categories and governorates for filters
      const categoriesResponse = await this.categoryService.GetAllCategories().toPromise();
      this.categories = categoriesResponse?.data || [];
      
      const governoratesResponse = await this.governorateService.getGovernrates().toPromise();
      this.governorates = governoratesResponse?.data || [];
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.toastr.warning(
        'Some filter options may not be available. Please refresh the page if needed.',
        'Loading Issue'
      );
    }
  }

  async loadBusinesses() {
    try {
      this.isLoading = true;
      const formValues = this.searchForm.value;
      
      const searchRequest: BusinessSearchRequest = {
        pageSize: this.itemsPerPage,
        pageNumber: this.currentPage,
        searchInput: formValues.searchInput || undefined,
        categoryId: formValues.categoryId || undefined,
        stage: (formValues.stage && formValues.stage !== '' && formValues.stage !== 'custom') ? parseInt(formValues.stage) : undefined,
        governmentId: formValues.governorateId || undefined,
        minCapital: (formValues.minFunding !== null && formValues.minFunding !== '' && formValues.minFunding !== 0) ? formValues.minFunding : null,
        maxCapital: (formValues.maxFunding !== null && formValues.maxFunding !== '') ? formValues.maxFunding : undefined,
        minAiRate: (formValues.minAiRate !== null && formValues.minAiRate !== '') ? formValues.minAiRate : undefined,
        desiredInvestmentType: (formValues.investmentType !== null && formValues.investmentType !== '') ? formValues.investmentType : null,
        useDefaultPreferences: this.isInitialLoad && !this.userMadeChanges && !this.preferencesApplied
      };

      const response = await this.exploreService.getBusinesses(searchRequest).toPromise();
      
      if (response && response.isSuccess && response.data) {
        this.businesses = response.data.businesses || [];
        this.filteredBusinesses = [...this.businesses]; // For compatibility with existing template
        this.totalItems = response.data.totalCount || 0;
        this.investorPreferences = response.data.investorPreferences || null;
        
        // Apply investor preferences to form on initial load only
        if (this.isInitialLoad && this.investorPreferences && !this.preferencesApplied) {
          this.applyInvestorPreferencesToForm(this.investorPreferences);
          this.preferencesApplied = true;
          this.isInitialLoad = false;
          // Reload businesses with applied preferences
          setTimeout(() => this.loadBusinesses(), 100);
          return;
        }
        
        // Apply defaults for non-investors or when no preferences exist
        if (this.isInitialLoad && !this.investorPreferences && !this.preferencesApplied) {
          this.applyDefaultsForNonInvestors();
          this.preferencesApplied = true;
          this.isInitialLoad = false;
        }
        
        // Update pagination info if provided
        if (response.data.currentPage) {
          this.currentPage = response.data.currentPage;
        }
        
        // Mark initial load as complete
        this.isInitialLoad = false;
      } else {
        console.error('Failed to load businesses:', response?.message);
        this.businesses = [];
        this.filteredBusinesses = [];
        this.totalItems = 0;
        
        // Show error toast for API failure
        this.toastr.error(
          response?.message || 'Unable to load business ideas. Please try again.',
          'Loading Failed'
        );
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      this.businesses = [];
      this.filteredBusinesses = [];
      this.totalItems = 0;
      
      // Show error toast for network/unexpected errors
      this.toastr.error(
        'Network error occurred while loading business ideas. Please check your connection and try again.',
        'Connection Error'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Apply investor preferences to the filter form
   */
  private applyInvestorPreferencesToForm(preferences: InvestorPreferencesApiResponse) {
    
    const updateObject: any = {};
    
    // Set default values for all filters when preferences are applied
    updateObject.categoryId = ''; // All categories
    updateObject.governorateId = ''; // All governorates  
    updateObject.minAiRate = 50; // Minimum good rating (50+)
    updateObject.searchInput = ''; // Clear any search text
    
    // Apply investment type
    if (preferences.investingType !== undefined && preferences.investingType !== null) {
      updateObject.investmentType = preferences.investingType;
    }
    
    // Apply funding range
    if (preferences.minFunding !== undefined && preferences.minFunding !== null) {
      updateObject.minFunding = preferences.minFunding;
    }
    
    if (preferences.maxFunding !== undefined && preferences.maxFunding !== null) {
      updateObject.maxFunding = preferences.maxFunding;
    }
    
    // Apply business stages - only if there's a single preferred stage
    if (preferences.interestedBusinessStages) {
      const stages = preferences.interestedBusinessStages.toString().split(',').map((s: string) => s.trim());
      
      // Only apply stage filter if there's exactly one preferred stage
      if (stages.length === 1 && stages[0]) {
        const stageValue = parseInt(stages[0]);
        if (!isNaN(stageValue) && stageValue >= 1 && stageValue <= 4) {
          updateObject.stage = stageValue.toString(); // Convert to string: "1", "2", "3", or "4"
        }
      } else if (stages.length > 1) {
        updateObject.stage = 'custom'; // Set stage to 'custom' for multiple stages
      }
    } else {
      // If no stages preference, set to empty string for "All Stages"
      updateObject.stage = '';
    }
    
    // Apply the updates to the form without emitting events to avoid infinite loop
    if (Object.keys(updateObject).length > 0) {
      this.searchForm.patchValue(updateObject, { emitEvent: false });
      
      // Force change detection to ensure dropdown updates
      this.cdr.detectChanges();
      
      // Show the filters section so user can see the applied preferences
      this.isFiltersExpanded = true;
    }
  }

  private applyDefaultsForNonInvestors() {
    
    const updateObject: any = {
      categoryId: '', // All categories
      governorateId: '', // All governorates
      stage: '', // All stages
      investmentType: '', // All types  
      minFunding: null,
      maxFunding: null,
      minAiRate: 50, // Still set minimum AI rating for quality
      searchInput: ''
    };
    
    this.searchForm.patchValue(updateObject, { emitEvent: false });
    
    // Force change detection to ensure dropdown updates
    this.cdr.detectChanges();
  }

  applyFilters() {
    // Reset to first page when filters change
    this.currentPage = 1;
    this.currentCarouselIndex = 0;
    this.loadBusinesses();
  }



  toggleView(viewType: 'grid' | 'carousel') {
    this.isGridView = viewType === 'grid';
    this.isCarouselView = viewType === 'carousel';
  }

  clearFilters() {
    
    // this.searchForm.reset();
    this.currentCarouselIndex = 0; // Reset carousel position
    this.currentPage = 1;
    
    // Mark as user action (no longer initial load, preferences removed)
    this.preferencesApplied = false;
    this.isInitialLoad = false; 
    this.userMadeChanges = true; // Clearing filters is an explicit user action
    this.isClearing = true; // Set flag to indicate clearing
    
    // Set clean default values (ignore investor preferences)
    const defaultValues = {
      searchInput: '',
      categoryId: '', // All categories
      stage: '', // All stages
      governorateId: '', // All governorates  
      minFunding: null, // No min funding
      maxFunding: null, // No max funding
      minAiRate: 50, // 50%+ AI rating
      investmentType: '' // All investment types
    };
    
    // true to ensure form updates properly
    this.searchForm.patchValue(defaultValues, { emitEvent: true });
    
    // Reset flag after a short delay to allow the form change to process
    setTimeout(() => {
      this.isClearing = false;
    }, 100);
  }

  getStageLabel(stage: InvestingStages | string | number): string {
    // Convert to string for consistent comparison
    const stageStr = stage?.toString();
    const stageOption = this.stageOptions.find(option => option.value === stageStr);
    return stageOption ? stageOption.label : 'Unknown';
  }

  getInvestmentTypeLabel(type: DesiredInvestmentType): string {
    const typeOption = this.investmentTypeOptions.find(option => option.value === type);
    return typeOption ? typeOption.label : 'Unknown';
  }

  //Convert comma-separated stage numbers to readable labels
  
  getStagesLabel(stages: string): string {
    if (!stages) return '';
    
    const stageNumbers = stages.split(',').map(s => s.trim()).filter(s => s);
    if (stageNumbers.length === 0) return '';
    
    const stageLabels = stageNumbers.map(stageNum => {
      const stageValue = parseInt(stageNum);
      return this.getStageLabel(stageValue);
    }).filter(label => label !== 'Unknown');
    
    return stageLabels.join(', ');
  }


  getPaginatedBusinesses(): BusinessExploreDto[] {
    return this.filteredBusinesses;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBusinesses();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Accordion functionality
  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  // Carousel functionality
  nextCarousel() {
    const maxIndex = Math.max(0, this.filteredBusinesses.length - this.carouselItemsPerView);
    if (this.currentCarouselIndex < maxIndex) {
      // Move by 3 items (full page) instead of 1
      this.currentCarouselIndex = Math.min(this.currentCarouselIndex + this.carouselItemsPerView, maxIndex);
    }
  }

  prevCarousel() {
    if (this.currentCarouselIndex > 0) {
      // Move by 3 items (full page) instead of 1
      this.currentCarouselIndex = Math.max(this.currentCarouselIndex - this.carouselItemsPerView, 0);
    }
  }

  getCarouselBusinesses(): BusinessExploreDto[] {
    // Return all filtered businesses for the transform approach
    return this.filteredBusinesses;
  }

  getCarouselTransform(): string {
    // Calculate the pixel amount to slide based on current index
    // Each item is 360px + 2rem gap (32px) = 392px total
    const itemWidthWithGap = 392; // 360px + 32px gap
    const translatePixels = -(this.currentCarouselIndex * itemWidthWithGap);
    return `translateX(${translatePixels}px)`;
  }

  canGoPrev(): boolean {
    return this.currentCarouselIndex > 0;
  }

  canGoNext(): boolean {
    return this.currentCarouselIndex < Math.max(0, this.filteredBusinesses.length - this.carouselItemsPerView);
  }

  getBusinessImage(business: BusinessExploreDto): string {
    const currentIndex = this.currentImageIndexes[business.id] || 0;
    
    // Use the images array from API response
    if (business.images && business.images.length > 0) {
      const images = Array.isArray(business.images) ? business.images : [business.images];
      return images[currentIndex] || images[0];
    }
    // Fallback to default image
    return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
  }

  getBusinessImages(business: BusinessExploreDto): string[] {
    // Use the images array from API response
    if (business.images && business.images.length > 0) {
      return Array.isArray(business.images) ? business.images : [business.images];
    }
    // Fallback to default image
    return ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'];
  }

  startImageCycling(business: BusinessExploreDto): void {
    const images = this.getBusinessImages(business);
    if (images.length <= 1) return;

    // Initialize current index if not exists
    if (!(business.id in this.currentImageIndexes)) {
      this.currentImageIndexes[business.id] = 0;
    }

    // Clear any existing interval and timeout
    if (this.imageIntervals[business.id]) {
      clearInterval(this.imageIntervals[business.id]);
      delete this.imageIntervals[business.id];
    }
    if (this.imageTimeouts[business.id]) {
      clearTimeout(this.imageTimeouts[business.id]);
      delete this.imageTimeouts[business.id];
    }

    // Start cycling after 0.5 second delay, then every 2 seconds
    this.imageTimeouts[business.id] = setTimeout(() => {
      // Check if we should still start cycling (user might have unhovered)
      if (this.imageTimeouts[business.id]) {
        this.transitionToNextImage(business, images);
        this.imageIntervals[business.id] = setInterval(() => {
          this.transitionToNextImage(business, images);
        }, 2000);
      }
    }, 500);
  }

  private transitionToNextImage(business: BusinessExploreDto, images: string[]): void {
    // Switch to next image instantly
    this.currentImageIndexes[business.id] = 
      (this.currentImageIndexes[business.id] + 1) % images.length;
  }

  stopImageCycling(business: BusinessExploreDto): void {
    // Clear interval and timeout immediately
    if (this.imageIntervals[business.id]) {
      clearInterval(this.imageIntervals[business.id]);
      delete this.imageIntervals[business.id];
    }
    if (this.imageTimeouts[business.id]) {
      clearTimeout(this.imageTimeouts[business.id]);
      delete this.imageTimeouts[business.id];
    }
    
    // Reset to first image instantly
    this.currentImageIndexes[business.id] = 0;
  }

  shouldShowFunding(): boolean {
    const investmentType = this.searchForm.get('investmentType')?.value;
    // Handle both string and number values from form
    return investmentType != DesiredInvestmentType.IndustrialExperience && investmentType != '1';
  }

  shouldShowFundingForBusiness(business: BusinessExploreDto): boolean {
    // Show funding if desiredInvestmentType is Funding (2) or Both (3)
    return business.desiredInvestmentType === DesiredInvestmentType.Funding || 
           business.desiredInvestmentType === DesiredInvestmentType.Both;
  }

  // Contact request logic
  canShowContactButton(business: BusinessExploreDto): boolean {
    return business.contactRequestStatus === null && business.canRequestContact === true;
  }

  getContactRequestStatusLabel(status: ContactRequestStatus): string {
    switch (status) {
      case ContactRequestStatus.Pending:
        return 'Contact Request Pending';
      case ContactRequestStatus.Accepted:
        return 'Contact Request Accepted';
      case ContactRequestStatus.Declined:
        return 'Contact Request Declined';
      case ContactRequestStatus.Deleted:
        return 'Contact Request Cancelled';
      default:
        return 'Unknown Status';
    }
  }

  getContactRequestStatusClass(status: ContactRequestStatus): string {
    switch (status) {
      case ContactRequestStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case ContactRequestStatus.Accepted:
        return 'bg-green-100 text-green-800';
      case ContactRequestStatus.Declined:
        return 'bg-red-100 text-red-800';
      case ContactRequestStatus.Deleted:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isUserInvestor(): boolean {
    const userData = this.authService.getUserData();
    return userData?.userType === UserType.Investor;
  }

  onContactRequest(business: BusinessExploreDto): void {
    this.selectedBusiness = business;
    this.showContactRequestModal = true;
  }

  confirmContactRequest(): void {
    if (!this.selectedBusiness) return;

    this.isSubmittingContactRequest = true;
    
    this.exploreService.createContactRequest(this.selectedBusiness.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Update the business object to reflect the new status
          this.selectedBusiness!.contactRequestStatus = ContactRequestStatus.Pending;
          this.selectedBusiness!.canRequestContact = false;
          
          // Show success toast
          this.toastr.success(
            'Your contact request has been submitted',
            'Contact Request Sent!'
          );
          
          this.closeContactRequestModal();
        } else {
          // Show error toast
          this.toastr.error(response.message || 'Failed to send contact request.', 'Request Failed');
        }
      },
      error: (error) => {
        console.error('Error sending contact request:', error);
        
        // Handle different error types
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.status === 401) {
          errorMessage = 'You need to be logged in to send contact requests.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to send contact requests.';
        } else if (error.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.toastr.error(errorMessage, 'Request Failed');
        this.closeContactRequestModal();
      },
      complete: () => {
        this.isSubmittingContactRequest = false;
      }
    });
  }

  closeContactRequestModal(): void {
    this.showContactRequestModal = false;
    this.selectedBusiness = null;
    this.isSubmittingContactRequest = false;
  }

  // Navigation Methods
  navigateToIdeaDetails(business: BusinessExploreDto): void {
    this.router.navigate(['/idea', business.id]);
  }

  onCardClick(business: BusinessExploreDto, event: Event): void {
    // Prevent navigation if clicking on buttons inside the card
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    this.navigateToIdeaDetails(business);
  }

  ngOnDestroy(): void {
    // Clear all image intervals and timeouts to prevent memory leaks
    Object.values(this.imageIntervals).forEach(interval => {
      if (interval) {
        clearInterval(interval);
      }
    });
    Object.values(this.imageTimeouts).forEach(timeout => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
    this.currentImageIndexes = {};
    this.imageIntervals = {};
    this.imageTimeouts = {};
  }
} 