import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IdeaDetailsDto, BusinessStandardAnswer } from '../../_models/businesses';
import { InvestingStages, ContactRequestStatus } from '../../_shared/enums';
import { ToastrService } from 'ngx-toastr';
import { IdeaDetailsService } from './idea-details.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-idea-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idea-details.component.html',
  styleUrls: ['./idea-details.component.css']
})
export class IdeaDetailsComponent implements OnInit, OnDestroy {

  // Component State
  businessData: IdeaDetailsDto | null = null;
  currentImageIndex: number = 0;
  activeTab: string = 'overview';
  isRequestPending: boolean = false;
  isLoading: boolean = false;
  
  // Modal state
  showContactRequestModal: boolean = false;
  isSubmittingContactRequest: boolean = false;
  
  // Auto-carousel timer
  private carouselInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastr: ToastrService,
    private ideaDetailsService: IdeaDetailsService
  ) { }

  ngOnInit(): void {
    // Get business ID from route parameters
    const businessId = this.route.snapshot.paramMap.get('id');
    
    if (businessId) {
      this.loadBusinessData(parseInt(businessId));
    } else {
      // If no ID provided, show error and navigate back
      this.toastr.error('Business idea not found', 'Error');
      this.goBack();
    }
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

  loadBusinessData(businessId: number): void {
    this.isLoading = true;
    
    this.ideaDetailsService.getBusinessDetails(businessId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.businessData = response.data;
          // Start auto-carousel after data is loaded
          this.startAutoCarousel();
          console.log('Business data loaded:', this.businessData);
        } else {
          this.toastr.error(response.message || 'Failed to load business details', 'Error');
          this.goBack();
        }
      },
      error: (error) => {
        console.error('Error loading business data:', error);
        this.toastr.error('Failed to load business details', 'Error');
        this.goBack();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
    if (this.businessData?.cityName && this.businessData?.governmentName) {
      return `${this.businessData.cityName}, ${this.businessData.governmentName}`;
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
    if (this.isRequestPending || !this.businessData?.canRequestContact) {
      return;
    }

    // Show confirmation modal
    this.showContactRequestModal = true;
  }

  confirmContactRequest(): void {
    if (!this.businessData || this.isSubmittingContactRequest) {
      return;
    }

    this.isSubmittingContactRequest = true;

    this.ideaDetailsService.createContactRequest(this.businessData.id).subscribe({
      next: (response) => {
        this.isSubmittingContactRequest = false;
        this.showContactRequestModal = false;
        this.toastr.success(
          'Your contact request has been submitted',
          'Contact Request Sent!'
        );
        
        // Update business data after successful request
        if (this.businessData) {
          this.businessData.contactRequestStatus = ContactRequestStatus.Pending;
          this.businessData.canRequestContact = false;
          this.businessData.totalContactRequests++;
        }
      },
      error: (error) => {
        this.isSubmittingContactRequest = false;
        console.error('Contact request error:', error);
        
        let errorMessage = 'Failed to send contact request. Please try again.';
        if (error.status === 401) {
          errorMessage = 'You must be logged in to send contact requests.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to send contact requests.';
        } else if (error.status === 429) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.toastr.error(errorMessage, 'Request Failed');
        this.closeContactRequestModal();
      }
    });
  }

  closeContactRequestModal(): void {
    this.showContactRequestModal = false;
    this.isSubmittingContactRequest = false;
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
    if (this.businessData?.images && this.businessData.images.length > 0) {
      return this.businessData.images.map(imagePath => this.getFullImageUrl(imagePath));
    }
    return [];
  }

  // Utility method to construct full image URLs
  private getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Construct full URL using environment apiUrl
    return `${environment.apiUrl}/${imagePath}`;
  }

  // Utility method to construct full file URLs
  private getFullFileUrl(filePath: string): string {
    if (!filePath) {
      return '';
    }
    
    // If already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // Construct full URL using environment apiUrl
    return `${environment.apiUrl}/${filePath}`;
  }

  getBusinessStandardAnswers(): BusinessStandardAnswer[] {
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

  getDesiredInvestmentTypeName(): string {
    const investmentType = this.businessData?.desiredInvestmentType;
    switch (investmentType) {
      case 1:
        return 'Industrial Experience';
      case 2:
        return 'Funding';
      case 3:
        return 'Industrial Experience & Funding';
      default:
        return 'Investment';
    }
  }

  shouldShowFundingAmount(): boolean {
    const investmentType = this.businessData?.desiredInvestmentType;
    // Show funding amount only for Funding (2) or Both (3)
    return investmentType === 2 || investmentType === 3;
  }

  shouldShowExperienceSection(): boolean {
    const investmentType = this.businessData?.desiredInvestmentType;
    // Show experience section only for Industrial Experience (1)
    return investmentType === 1;
  }

  // ========================================
  // CONTACT REQUEST HELPER METHODS
  // ========================================

  canSendContactRequest(): boolean {
    return !!(this.businessData?.canRequestContact && !this.isSubmittingContactRequest);
  }

  getContactRequestStatusLabel(): string {
    if (!this.businessData?.contactRequestStatus) {
      return '';
    }
    
    switch (this.businessData.contactRequestStatus) {
      case ContactRequestStatus.Pending:
        return 'Contact Request Pending';
      case ContactRequestStatus.Accepted:
        return 'Contact Request Accepted';
      case ContactRequestStatus.Declined:
        return 'Contact Request Declined';
      case ContactRequestStatus.Deleted:
        return 'Contact Request Cancelled';
      default:
        return '';
    }
  }

  getContactRequestStatusClass(): string {
    if (!this.businessData?.contactRequestStatus) {
      return '';
    }
    
    switch (this.businessData.contactRequestStatus) {
      case ContactRequestStatus.Pending:
        return 'status-pending';
      case ContactRequestStatus.Accepted:
        return 'status-accepted';
      case ContactRequestStatus.Declined:
        return 'status-declined';
      case ContactRequestStatus.Deleted:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  hasContactRequestStatus(): boolean {
    return !!(this.businessData?.contactRequestStatus);
  }

  // ========================================
  // FILE HANDLING METHODS
  // ========================================

  hasBusinessFile(): boolean {
    return !!(this.businessData?.filePath && this.businessData?.isInvestor);
  }

  shouldShowDetailsTab(): boolean {
    return !!(this.businessData?.isInvestor && this.hasQAData());
  }

  shouldShowBusinessDocuments(): boolean {
    return !!(this.businessData?.isInvestor && this.businessData?.filePath);
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
      const fullFileUrl = this.getFullFileUrl(this.businessData.filePath);
      window.open(fullFileUrl, '_blank');
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
