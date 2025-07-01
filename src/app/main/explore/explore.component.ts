import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BusinessDto, BusinessSearchDto } from '../../_models/businesses';
import { Category } from '../../_models/category';
import { Governorate } from '../../_models/governorate';
import { InvestingStages, DesiredInvestmentType, BusinessIdeaStatus } from '../../_shared/enums';
import { CategoryService } from '../../_services/category.service';
import { GovernrateService } from '../../_services/governorate.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit {

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
  businesses: BusinessDto[] = [];
  filteredBusinesses: BusinessDto[] = [];
  categories: Category[] = [];
  governorates: Governorate[] = [];

  // Enums for template
  InvestingStages = InvestingStages;
  DesiredInvestmentType = DesiredInvestmentType;
  
  // Expose Math for template
  Math = Math;

  // Filter options
  stageOptions = [
    { value: InvestingStages.ideation, label: 'Ideation' },
    { value: InvestingStages.startup, label: 'Startup' },
    { value: InvestingStages.intermediate, label: 'Intermediate' },
    { value: InvestingStages.advanced, label: 'Advanced' }
  ];

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
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadInitialData();
    this.generateSampleData(); // For demo purposes
  }

  initializeForm() {
    this.searchForm = this.fb.group({
      searchInput: [''],
      categoryId: [null],
      stage: [null],
      governorateId: [null],
      minFunding: [null],
      maxFunding: [null],
      minAiRate: [null],
      investmentType: [null]
    });

    // Subscribe to form changes for real-time filtering
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
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
    }
  }

  // Generate sample data for demo
  generateSampleData() {
    // Extended BusinessDto to include imageUrl as a dynamic property
this.businesses = [
  Object.assign(new BusinessDto(1, 1, 'Ahmed Hassan', 1, 'Technology', 'AI-Powered Health Monitoring App', 85, InvestingStages.startup, 'Cairo', 150000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-15', undefined, undefined, undefined, undefined, 1, 1, 'Revolutionary healthcare app that uses AI to monitor vital signs and predict health issues before they become serious.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(2, 2, 'Fatima Al-Rashid', 2, 'Agriculture', 'Sustainable Urban Farming', 92, InvestingStages.intermediate, 'Alexandria', 300000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-20', undefined, undefined, undefined, undefined, 2, 2, 'Vertical farming solution for urban areas using hydroponics and renewable energy sources.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(3, 3, 'Mohamed Ali', 1, 'Technology', 'Blockchain Supply Chain Platform', 78, InvestingStages.advanced, 'Giza', 500000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-10', undefined, undefined, undefined, undefined, 3, 3, 'Complete transparency in supply chain management using blockchain technology and IoT sensors.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(4, 4, 'Sara Mohamed', 3, 'Education', 'Virtual Reality Education Platform', 88, InvestingStages.startup, 'Luxor', 200000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-25', undefined, undefined, undefined, undefined, 4, 4, 'Immersive VR learning experiences for students of all ages with interactive 3D environments.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(5, 5, 'Omar Farouk', 2, 'Clean Energy', 'Solar-Powered Water Purification', 95, InvestingStages.ideation, 'Aswan', 100000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-02-01', undefined, undefined, undefined, undefined, 5, 5, 'Portable solar-powered water purification systems for rural and emergency use.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(6, 6, 'Layla Ibrahim', 4, 'Smart Home', 'Smart Home Automation Hub', 82, InvestingStages.intermediate, 'Cairo', 250000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-30', undefined, undefined, undefined, undefined, 1, 1, 'All-in-one smart home solution with AI-powered automation and energy optimization.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(7, 7, 'Youssef Ahmed', 1, 'Healthcare', 'Telemedicine Platform for Rural Areas', 90, InvestingStages.advanced, 'Minya', 400000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-18', undefined, undefined, undefined, undefined, 6, 6, 'Connecting rural patients with healthcare professionals through advanced telemedicine technology.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(8, 8, 'Nour El-Din', 3, 'Environmental', 'Eco-Friendly Packaging Solutions', 87, InvestingStages.startup, 'Port Said', 180000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-02-05', undefined, undefined, undefined, undefined, 7, 7, 'Biodegradable packaging materials made from agricultural waste and natural fibers.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(9, 9, 'Hania Mahmoud', 2, 'Fintech', 'AI-Driven Financial Advisory', 91, InvestingStages.intermediate, 'Suez', 350000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-22', undefined, undefined, undefined, undefined, 8, 8, 'Personal finance management with AI-powered investment recommendations and risk assessment.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(10, 10, 'Amr Mostafa', 4, 'E-commerce', 'Digital Marketplace for Artisans', 84, InvestingStages.ideation, 'Ismailia', 120000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-02-08', undefined, undefined, undefined, undefined, 9, 9, 'Online platform connecting traditional artisans with global customers and providing business tools.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(11, 11, 'Rana Salah', 1, 'Logistics', 'Autonomous Delivery Drones', 89, InvestingStages.advanced, 'Sharm El Sheikh', 600000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-01-12', undefined, undefined, undefined, undefined, 10, 10, 'Last-mile delivery solution using AI-powered drones for efficient and cost-effective shipping.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=400&h=300&fit=crop' }),

  Object.assign(new BusinessDto(12, 12, 'Karim El-Sayed', 3, 'Healthcare', 'Mental Health Support App', 86, InvestingStages.startup, 'Hurghada', 140000, false, undefined, BusinessIdeaStatus.Active, undefined, '2024-02-03', undefined, undefined, undefined, undefined, 11, 11, 'AI-powered mental health support with personalized therapy sessions and crisis intervention.', undefined, undefined, [], undefined, undefined), { imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop' })
];

    this.filteredBusinesses = [...this.businesses];
    this.totalItems = this.businesses.length;
    this.isLoading = false;
  }

  applyFilters() {
    const formValues = this.searchForm.value;
    
    this.filteredBusinesses = this.businesses.filter(business => {
      // Search input filter
      if (formValues.searchInput) {
        const searchLower = formValues.searchInput.toLowerCase();
        const matchesSearch = 
          business.title?.toLowerCase().includes(searchLower) ||
          business.description?.toLowerCase().includes(searchLower) ||
          business.founderName?.toLowerCase().includes(searchLower) ||
          business.categoryName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (formValues.categoryId && business.categoryId !== formValues.categoryId) {
        return false;
      }

      // Stage filter
      if (formValues.stage && business.stage !== formValues.stage) {
        return false;
      }

      // Governorate filter
      if (formValues.governorateId && business.governmentId !== formValues.governorateId) {
        return false;
      }

      // Funding range filter
      if (formValues.minFunding && business.capital && business.capital < formValues.minFunding) {
        return false;
      }
      if (formValues.maxFunding && business.capital && business.capital > formValues.maxFunding) {
        return false;
      }

      // AI rate filter
      if (formValues.minAiRate && business.airate && business.airate < formValues.minAiRate) {
        return false;
      }

      return true;
    });

    this.totalItems = this.filteredBusinesses.length;
    this.currentPage = 1; // Reset to first page
    this.currentCarouselIndex = 0; // Reset carousel position
  }

  toggleView(viewType: 'grid' | 'carousel') {
    this.isGridView = viewType === 'grid';
    this.isCarouselView = viewType === 'carousel';
  }

  clearFilters() {
    this.searchForm.reset();
    this.filteredBusinesses = [...this.businesses];
    this.totalItems = this.businesses.length;
    this.currentCarouselIndex = 0; // Reset carousel position
  }

  getStageLabel(stage: InvestingStages): string {
    const stageOption = this.stageOptions.find(option => option.value === stage);
    return stageOption ? stageOption.label : 'Unknown';
  }

  getInvestmentTypeLabel(type: DesiredInvestmentType): string {
    const typeOption = this.investmentTypeOptions.find(option => option.value === type);
    return typeOption ? typeOption.label : 'Unknown';
  }



  getPaginatedBusinesses(): BusinessDto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredBusinesses.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
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

  getCarouselBusinesses(): BusinessDto[] {
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

  getBusinessImage(business: BusinessDto): string {
    return (business as any).imageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
  }

  shouldShowFunding(): boolean {
    const investmentType = this.searchForm.get('investmentType')?.value;
    // Handle both string and number values from form
    return investmentType != DesiredInvestmentType.IndustrialExperience && investmentType != '1';
  }

  // Navigation Methods
  navigateToIdeaDetails(business: BusinessDto): void {
    this.router.navigate(['/idea', business.id]);
  }

  onCardClick(business: BusinessDto, event: Event): void {
    // Prevent navigation if clicking on buttons inside the card
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    this.navigateToIdeaDetails(business);
  }
} 