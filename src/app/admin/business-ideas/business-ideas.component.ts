import { Component, OnInit ,HostListener, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { BusinessService } from '../_services/businesses.service'; 
import { BusinessDto, BusinessListDto, BusinessSearchDto } from '../../_models/businesses';
import { Response } from '../../_models/response';
import { getBusinessIdeaStatusLabel, getStageLabel } from '../../_shared/utils/enum.utils';
import { BusinessIdeaStatus, Stage } from '../../_shared/enums';

import { Observable, catchError, of, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../_services/dark-mode.service';

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

  stages: Stage[] = Object.values(Stage).filter(value => typeof value === 'number') as Stage[];
  businessStatuses: BusinessIdeaStatus[] = Object.values(BusinessIdeaStatus).filter(value => typeof value === 'number') as BusinessIdeaStatus[];

  isStatusUpdateModalOpen: boolean = false;
  selectedBusinessId: number | null = null;
  newStatus: BusinessIdeaStatus | null = null;
  currentStatusName: string | null = null;

  isSoftDeleteModalOpen: boolean = false;
  selectedIdeaIdForSoftDelete: number | null = null;

  dropdownStates: boolean[] = [];

  isAdvancedSearchOpen: boolean = false;

  public BusinessIdeaStatus = BusinessIdeaStatus; 
  public Stage = Stage;                           

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

  constructor(
    private businessService: BusinessService,
    private toastr: ToastrService,
    private darkModeService: DarkModeService // Inject DarkModeService
  ) { }

  ngOnInit(): void {
    this.loadBusinessIdeas();
    this.loadIdeasCount();
    // Subscribe to dark mode changes
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

  onSearch(): void {
    this.searchParams.pageNumber = 1;
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
  }


  applyAdvancedSearch(): void {
    this.onSearch(); 
    this.isAdvancedSearchOpen = false; 
  }
openViewDetailsModal(idea: BusinessDto): void {
        this.selectedIdeaForDetails = idea;
        this.isViewDetailsModalOpen = true;
        this.dropdownStates = this.dropdownStates.map(() => false);
    }

    closeViewDetailsModal(): void {
        this.isViewDetailsModalOpen = false;
        this.selectedIdeaForDetails = null;
    }
    getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }
loadIdeasCount(){
  var sum= this.businessService.GetBusinessIdeasCounts().subscribe({
    next:(response)=>{
      this.displayActiveCount=response.data.totalActive;
      this.displayInactiveCount=response.data.totalInactive
      this.displayPendingCount=response.data.totalPending
      this.displayRejectedCount=response.data.totalRejected
    },error:(err)=>{
       console.log(err);
    }
  })
}

}
