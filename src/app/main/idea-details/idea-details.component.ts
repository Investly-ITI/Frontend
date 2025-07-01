import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BusinessDto } from '../../_models/businesses';
import { InvestingStages } from '../../_shared/enums';
import { ToastrService } from 'ngx-toastr';

interface ExtendedBusinessDto extends BusinessDto {
  images?: string[];
  visits?: number;
  contactRequests?: number;
}

@Component({
  selector: 'app-idea-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idea-details.component.html',
  styleUrls: ['./idea-details.component.css']
})
export class IdeaDetailsComponent implements OnInit, OnDestroy {

  // Component State
  businessData: ExtendedBusinessDto | null = null;
  currentImageIndex: number = 0;
  activeTab: string = 'overview';
  isRequestPending: boolean = false;
  
  // Auto-carousel timer
  private carouselInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Get business ID from route parameters
    const businessId = this.route.snapshot.paramMap.get('id');
    
    if (businessId) {
      this.loadBusinessData(businessId);
    } else {
      // If no ID provided, show error and navigate back
      this.toastr.error('Business idea not found', 'Error');
      this.goBack();
    }

    // Start auto-carousel if images exist
    this.startAutoCarousel();
  }

  ngOnDestroy(): void {
    // Clean up interval
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // ========================================
  // DATA LOADING
  // ========================================

  loadBusinessData(businessId: string): void {
    // TODO: Replace this with actual API call to get business data
    // For now, using mock data that matches the business model structure
    
    const mockBusinessData: ExtendedBusinessDto = new BusinessDto(
      parseInt(businessId),
      1, // founderId
      'Ahmed Mohamed', // founderName
      1, // categoryId
      'Technology', // categoryName
      'Revolutionary AI-Powered Learning Platform', // title
      85, // airate
             InvestingStages.startup, // stage
      'Cairo, Egypt', // location
      500000, // capital
      false, // isDrafted
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // filePath
      undefined, // status
      '', // rejectedReason
      new Date().toISOString(), // createdAt
      1, // createdBy
      1, // updatedBy
      new Date().toISOString(), // updatedAt
      null, // ideaFile
      1, // governmentId
      1, // cityId
      'Our AI-powered learning platform revolutionizes education by providing personalized learning experiences for students of all ages. Using advanced machine learning algorithms, we adapt content delivery to individual learning styles and pace, ensuring maximum comprehension and retention. The platform includes interactive modules, real-time progress tracking, and comprehensive analytics for both students and educators.', // description
      1, // desiredInvestmentType
      'Money Funding', // desiredInvestmentTypeName
      [ // businessStandardAnswers
        {
          StandardId: 1,
          answer: 'Our target market consists of educational institutions, individual learners, and corporate training departments. We focus primarily on K-12 schools and universities looking to enhance their digital learning capabilities.',
          standardQuestion: 'What is your target market and customer base?'
        },
        {
          StandardId: 2,
          answer: 'We generate revenue through subscription models for institutions, freemium plans for individual users, and enterprise licensing for corporate clients. Our tiered pricing structure accommodates different organizational sizes and needs.',
          standardQuestion: 'What is your revenue model and monetization strategy?'
        },
        {
          StandardId: 3,
          answer: 'Our key competitive advantages include proprietary AI algorithms, extensive content library, seamless integration capabilities, and superior user experience. We also have strategic partnerships with leading educational publishers.',
          standardQuestion: 'What are your competitive advantages?'
        },
        {
          StandardId: 4,
          answer: 'We plan to expand into new markets, develop mobile applications, enhance AI capabilities, and establish partnerships with international educational institutions. We also aim to integrate VR/AR technologies for immersive learning experiences.',
          standardQuestion: 'What are your future plans and growth strategy?'
        }
      ],
      { // city
        id: 1,
        govId: 1,
        nameAr: 'القاهرة',
        nameEn: 'Cairo'
      },
      { // government
        id: 1,
        nameAr: 'القاهرة',
        nameEn: 'Cairo'
      }
      
    );

    // Add mock extended properties
    mockBusinessData.images = [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ];
    mockBusinessData.visits = 1248;
    mockBusinessData.contactRequests = 23;

    this.businessData = mockBusinessData;

    // Simulate API loading delay
    setTimeout(() => {
      console.log('Business data loaded:', this.businessData);
    }, 500);
  }

  // ========================================
  // CAROUSEL FUNCTIONALITY
  // ========================================

  startAutoCarousel(): void {
    this.carouselInterval = setInterval(() => {
      if (this.businessData?.images && this.businessData.images.length > 1) {
        this.nextImage();
      }
    }, 5000); // Change image every 5 seconds
  }

  nextImage(): void {
    if (this.businessData?.images && this.businessData.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.businessData.images.length;
    }
  }

  prevImage(): void {
    if (this.businessData?.images && this.businessData.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.businessData.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    if (this.businessData?.images && index >= 0 && index < this.businessData.images.length) {
      this.currentImageIndex = index;
    }
  }

  // ========================================
  // TAB FUNCTIONALITY
  // ========================================

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // ========================================
  // BUSINESS LOGIC
  // ========================================

  getStageLabel(stage: InvestingStages): string {
    switch (stage) {
      case InvestingStages.ideation:
        return 'Ideation';
      case InvestingStages.startup:
        return 'Startup';
      case InvestingStages.intermediate:
        return 'Intermediate';
      case InvestingStages.advanced:
        return 'Advanced';
      default:
        return 'Unknown';
    }
  }

  getLocationDisplay(): string {
    if (this.businessData?.city && this.businessData?.government) {
      return `${this.businessData.city.nameEn}, ${this.businessData.government.nameEn}`;
    } else if (this.businessData?.location) {
      return this.businessData.location;
    }
    return 'Location not specified';
  }

  // ========================================
  // ACTION HANDLERS
  // ========================================

  goBack(): void {
    this.location.back();
  }

  sendContactRequest(): void {
    if (this.isRequestPending) {
      return;
    }

    this.isRequestPending = true;

    // Simulate API call
    setTimeout(() => {
      this.isRequestPending = false;
      this.toastr.success(
        'Your contact request has been sent to the founder. They will reach out to you soon!',
        'Contact Request Sent'
      );
      
      // Update contact requests count
      if (this.businessData && this.businessData.contactRequests !== undefined) {
        this.businessData.contactRequests++;
      }
      
      // TODO: Implement actual contact request API call
    }, 2000);
  }

  shareIdea(): void {
    if (navigator.share) {
      navigator.share({
        title: this.businessData?.title || 'Business Idea',
        text: this.businessData?.description || 'Check out this amazing business idea!',
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toastr.success('Link copied to clipboard!', 'Share');
      }).catch(() => {
        this.toastr.error('Failed to copy link', 'Share Error');
      });
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // ========================================
  // HELPER METHODS FOR TEMPLATE
  // ========================================

  hasImages(): boolean {
    return !!(this.businessData?.images && this.businessData.images.length > 0);
  }

  hasMultipleImages(): boolean {
    return !!(this.businessData?.images && this.businessData.images.length > 1);
  }

  hasQAData(): boolean {
    return !!(this.businessData?.businessStandardAnswers && this.businessData.businessStandardAnswers.length > 0);
  }

  getImages(): string[] {
    return this.businessData?.images || [];
  }

  getBusinessStandardAnswers(): any[] {
    return this.businessData?.businessStandardAnswers || [];
  }

  getAIRatingClass(): string {
    const rating = this.businessData?.airate || 0;
    if (rating >= 80) return 'excellent';
    if (rating >= 60) return 'good';
    if (rating >= 40) return 'average';
    return 'poor';
  }

  getStageClass(): string {
    return this.getStageLabel(this.businessData?.stage || InvestingStages.ideation).toLowerCase();
  }

  // ========================================
  // FILE HANDLING METHODS
  // ========================================

  hasBusinessFile(): boolean {
    return !!(this.businessData?.filePath || this.businessData?.ideaFile);
  }

  getFileName(): string {
    if (this.businessData?.filePath) {
      const path = this.businessData.filePath;
      return path.split('/').pop() || path.split('\\').pop() || 'Business Document';
    }
    return 'Business Document';
  }

  getFileExtension(): string {
    const fileName = this.getFileName();
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  }

  getFileType(): string {
    const extension = this.getFileExtension();
    
    if (['pdf'].includes(extension)) {
      return 'PDF Document';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'Word Document';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return 'PowerPoint Presentation';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'Excel Spreadsheet';
    } else if (['txt'].includes(extension)) {
      return 'Text Document';
    } else {
      return 'Document';
    }
  }

  viewBusinessFile(): void {
    if (!this.hasBusinessFile()) {
      this.toastr.error('No file available to view', 'View Error');
      return;
    }

    if (this.businessData?.filePath) {
      window.open(this.businessData.filePath, '_blank');
    }
  }

  // ========================================
  // DEVELOPMENT HELPERS
  // ========================================

  onImageError(event: any): void {
    console.warn('Image failed to load:', event.target.src);
    // Could implement fallback image logic here
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event.target.src);
  }
}
