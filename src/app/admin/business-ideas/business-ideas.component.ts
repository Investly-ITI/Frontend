import { Component, OnInit ,HostListener, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../_services/businesses.service';
import { BusinessDto, BusinessListDto, BusinessSearchDto } from '../../_models/businesses';
import { Response } from '../../_models/response';
import { getBusinessIdeaStatusLabel, getStageLabel } from '../../_shared/utils/enum.utils';
import { BusinessIdeaStatus, InvestingStages } from '../../_shared/enums';

import { Observable, catchError, of, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../_services/dark-mode.service';
import { environment } from '../../../environments/environment';
import { CategoryService } from '../../_services/category.service';
import { Category } from '../../_models/category';

@Component({
  selector: 'app-business-ideas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-ideas.component.html',
  styleUrls: ['./business-ideas.component.css']
})
export class BusinessIdeasComponent implements OnInit, OnDestroy {

  businessList: BusinessListDto | null = null;
  businessIdeas: BusinessDto[] = [];
  animationComplete: boolean = true;
  isViewDetailsModalOpen: boolean = false;
  selectedIdeaForDetails: BusinessDto | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  rejectedReasonInput: string = '';

  searchParams: BusinessSearchDto = new BusinessSearchDto();

  stages: InvestingStages[] = Object.values(InvestingStages).filter(value => typeof value === 'number') as InvestingStages[];
  businessStatuses: BusinessIdeaStatus[] = Object.values(BusinessIdeaStatus)
  .filter(value => typeof value === 'number' && value !== BusinessIdeaStatus.Deleted) as BusinessIdeaStatus[];
    businessStatusesFilter: BusinessIdeaStatus[] = Object.values(BusinessIdeaStatus)
  .filter(value => typeof value === 'number' && value !== BusinessIdeaStatus.Deleted) as BusinessIdeaStatus[];


  isStatusUpdateModalOpen: boolean = false;
  selectedBusinessId: number | null = null;
  newStatus: BusinessIdeaStatus | null = null;
  currentStatusName: string | null = null;
  tempStatusFilter: BusinessIdeaStatus | null = null;

  isSoftDeleteModalOpen: boolean = false;
  selectedIdeaIdForSoftDelete: number | null = null;

  dropdownStates: boolean[] = [];

  isAdvancedSearchOpen: boolean = false;

  public BusinessIdeaStatus = BusinessIdeaStatus;
  public Stage = InvestingStages;

  entityNamePlural: string = 'Business Idea';

  displayActiveCount: number = 0;
  displayInactiveCount: number = 0;
  displayPendingCount: number = 0;
  displayRejectedCount: number = 0;

  getBusinessIdeaStatusName = getBusinessIdeaStatusLabel;
  getStageName = getStageLabel;

  public Math = Math;

  isDarkMode: boolean = false;
  private darkModeSubscription: Subscription = new Subscription();

  activeTab: 'details' | 'pdf' | 'standardAnswers' = 'details'; 

  categories: Category[] = [];
  tempCategoryFilter: number | null = null;
  searchInput: string = '';
  tempStageFilter: number | null = null;

  constructor(
    private businessService: BusinessService,
    private toastr: ToastrService,
    private darkModeService: DarkModeService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.searchParams.pageSize = 5;
    this.loadBusinessIdeas();
    this.loadIdeasCount();
    this.loadCategories();
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }

  loadBusinessIdeas(): void {
    this.isLoading = true;
    this.error = null;
    this.businessService.getAllBusinesses(this.searchParams)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load business ideas. Please try again.';
          this.isLoading = false;
          console.error('Error loading businesses:', err);
          return of(new Response<BusinessListDto>({ businesses: [], totalCount: 0 }, false, this.error, 500));
        })
      )
      .subscribe(response => {
        if (response && response.isSuccess) {
          this.businessList = response.data;
          this.businessIdeas = response.data?.businesses || [];
          this.dropdownStates = Array(this.businessIdeas.length).fill(false);
        } else if (response) {
          this.error = response.message || 'Failed to load business ideas.';
        }
        this.isLoading = false;
      });
  }

  loadCategories(): void {
    this.categoryService.GetAllCategories().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.categories = res.data;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load categories.');
      }
    });
  }

  onSearch(): void {
    this.searchParams.pageNumber = 1;
    this.searchParams.search = this.searchInput || undefined;
    this.loadBusinessIdeas();
  }

  onSearchInputChange(): void {
    if (!this.searchInput) {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchParams = new BusinessSearchDto();
    this.searchParams.pageSize = 5;
    this.tempCategoryFilter = null;
    this.tempStageFilter = null;
    this.tempStatusFilter = null;
    this.loadBusinessIdeas();
  }

  onPageSizeChange(): void {
    this.searchParams.pageNumber = 1;
    this.loadBusinessIdeas();
  }


  nextPage(): void {
    if (this.businessList && this.searchParams.pageNumber * this.searchParams.pageSize < this.businessList.totalCount) {
      this.searchParams.pageNumber++;
      this.loadBusinessIdeas();

    }
  }

  prevPage(): void {
    if (this.searchParams.pageNumber > 1) {
      this.searchParams.pageNumber--;
      this.loadBusinessIdeas();

    }
  }
 @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const actionDropdown = target.closest('.action-dropdown');
    const advancedSearch = target.closest('.advanced-search-dropdown');
    if (!actionDropdown) {
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
    if (!advancedSearch) {
      this.isAdvancedSearchOpen = false;
    }
  }

  openSoftDeleteModal(businessId: number): void {
    this.selectedIdeaIdForSoftDelete = businessId;
    this.isSoftDeleteModalOpen = true;
    this.dropdownStates = this.dropdownStates.map(() => false);

  }

  closeSoftDeleteModal(): void {
    this.isSoftDeleteModalOpen = false;
    this.selectedIdeaIdForSoftDelete = null;
  }

  performSoftDelete(): void {
    if (this.selectedIdeaIdForSoftDelete !== null) {
      this.businessService.softDeleteBusiness(this.selectedIdeaIdForSoftDelete)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastr.success('Business idea has been deleted.', 'Deleted!');
              this.loadBusinessIdeas();
              this.closeSoftDeleteModal();
              this.loadIdeasCount();
            } else {
              this.toastr.error(res.message || 'Failed to delete business idea.', 'Error!');
            }
          },
          error: (err) => {
            this.toastr.error('An error occurred while deleting.', 'Error!');
            console.error('Soft delete error:', err);
          }
        });
    }
  }

  openStatusUpdateModal(businessId: number, currentStatus: BusinessIdeaStatus | undefined): void {
    this.selectedBusinessId = businessId;
    this.newStatus = null;
    this.dropdownStates = this.dropdownStates.map(() => false);
    this.currentStatusName = currentStatus !== undefined ? this.getBusinessIdeaStatusName(currentStatus) : 'N/A';

    const idea = this.businessIdeas.find(b => b.id === businessId);
    if (idea && idea.status === this.BusinessIdeaStatus.Rejected) {
      this.rejectedReasonInput = idea.rejectedReason || '';
    } else {
      this.rejectedReasonInput = '';
    }
    this.isStatusUpdateModalOpen = true;
    this.businessStatuses = (Object.values(BusinessIdeaStatus)
      .filter(value =>
        typeof value === 'number' &&
        value !== currentStatus &&
        value !== BusinessIdeaStatus.Deleted
      ) as BusinessIdeaStatus[]);
  }

  closeStatusUpdateModal(): void {
    this.isStatusUpdateModalOpen = false;
    this.selectedBusinessId = null;
    this.newStatus = null;
    this.currentStatusName = null;
    this.rejectedReasonInput = '';
  }

  submitStatusUpdate(): void {
    if (this.selectedBusinessId !== null && this.newStatus !== null) {
      if (this.newStatus === this.BusinessIdeaStatus.Rejected) {
        if (!this.rejectedReasonInput || !this.rejectedReasonInput.trim()) {
          this.toastr.error('Rejected reason is required.', 'Error!');
          console.error('Rejected reason is required.');
          return;
        }
      }
      const rejectedReason = this.newStatus === this.BusinessIdeaStatus.Rejected ? this.rejectedReasonInput : undefined;
      this.businessService.updateBusinessStatus(this.selectedBusinessId, this.newStatus, rejectedReason)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastr.success('Business idea status has been updated.', 'Updated!');
              this.closeStatusUpdateModal();
              this.loadBusinessIdeas();
              this.loadIdeasCount();
            } else {
              this.toastr.error(res.message || 'Failed to update status.', 'Error!');
              if (res.message && res.message.toLowerCase().includes('rejected status requires a reason')) {
                console.error('Rejected reason is required.');
              }
            }
          },
          error: (err) => {
            this.toastr.error('An error occurred while updating status.', 'Error!');
            console.error('Status update error:', err);
          }
        });
    } else {
      this.toastr.warning('Please select a status.', 'Warning');
    }
  }

  toggleDropdown(index: number, event: Event): void {
    event.stopPropagation();
    this.dropdownStates = this.dropdownStates.map((state, i) => (i === index ? !state : false));
  }

  toggleAdvancedSearch(event: Event): void {
    event.stopPropagation();
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
    this.tempCategoryFilter = this.searchParams.categoryId ?? null;
    this.tempStageFilter = this.searchParams.stage ?? null;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  clearAdvancedSearch(): void {
    this.tempCategoryFilter = null;
    this.tempStageFilter = null;
    this.tempStatusFilter = null;
    this.searchParams.categoryId = undefined;
    this.searchParams.status = undefined;
    this.searchParams.stage = undefined;
    this.onSearch();
    this.isAdvancedSearchOpen = false;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  applyAdvancedSearch(): void {
    this.searchParams.categoryId = this.tempCategoryFilter === null ? undefined : this.tempCategoryFilter;
    this.searchParams.stage = this.tempStageFilter === null ? undefined : this.tempStageFilter;
    this.searchParams.status = this.tempStatusFilter === null ? undefined : this.tempStatusFilter;
    this.onSearch();
    this.isAdvancedSearchOpen = false;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  openViewDetailsModal(idea: BusinessDto): void {
    this.selectedIdeaForDetails = idea;
    this.isViewDetailsModalOpen = true;
    this.dropdownStates = this.dropdownStates.map(() => false);
    this.activeTab = 'details';
  }

  closeViewDetailsModal(): void {
    this.isViewDetailsModalOpen = false;
    this.selectedIdeaForDetails = null;
    this.activeTab = 'details'; 
  }

  getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }

  loadIdeasCount() {
    var sum = this.businessService.GetBusinessIdeasCounts().subscribe({
      next: (response) => {
        this.displayActiveCount = response.data.totalActive;
        this.displayInactiveCount = response.data.totalInactive
        this.displayPendingCount = response.data.totalPending
        this.displayRejectedCount = response.data.totalRejected
      }, error: (err) => {
        console.log(err);
      }
    })
  }

 getFileDownloadUrl(filePath: string): string {
  const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${environment.apiUrl}/${cleanFilePath}`;
}

get filteredBusinessIdeas(): BusinessDto[] {
  if (!this.businessIdeas) return [];
  let filtered = this.businessIdeas;
  
  if (this.searchParams.categoryId != null && this.searchParams.categoryId !== undefined) {
    filtered = filtered.filter(idea => idea.categoryId === this.searchParams.categoryId);
  }
  if (this.searchParams.stage != null && this.searchParams.stage !== undefined) {
    filtered = filtered.filter(idea => idea.stage === this.searchParams.stage);
  }
   if (this.searchParams.status != null && this.searchParams.status !== undefined) {
    filtered = filtered.filter(idea => idea.status === this.searchParams.status);
  }
  return filtered;
}

}