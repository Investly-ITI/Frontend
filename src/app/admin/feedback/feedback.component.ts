import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { Subscription } from 'rxjs';
import { FeedbackService } from '../_services/feedback.service';
import { FeedbackDto, FeedbackListDto, FeedbackSearchDto, FeedbackCountsDto } from '../../_models/feedback';
import { getUserTypeLabel, getStatusLabel } from '../../_shared/utils/enum.utils';
import { UserType, Status } from '../../_shared/enums';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../_services/dark-mode.service';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    MatSelectModule,
    MatCheckboxModule,
    StatusLabelPipe
  ],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbacksComponent implements OnInit, OnDestroy {
  isDarkMode: boolean = false;
  private darkModeSubscription: Subscription = new Subscription();
  isLoading: boolean = false;
  isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [];
  animationComplete: boolean = false;
  isAdvancedSearchOpen: boolean = false;
  error: string | null = null;

  feedbackList: FeedbackListDto | null = null;
  feedbacks: FeedbackDto[] = [];
  feedbackCounts: FeedbackCountsDto = new FeedbackCountsDto();
  searchParams: FeedbackSearchDto = new FeedbackSearchDto();
  userTypes: UserType[] = Object.values(UserType).filter(value => typeof value === 'number') as UserType[];
  statuses: Status[] = [Status.Active, Status.Inactive]; 

  isSoftDeleteModalOpen: boolean = false;
  selectedFeedbackIdForSoftDelete: number | null = null;
  selectedFeedbackDescription: string | null = null;

  isHardDeleteModalOpen: boolean = false;
  selectedFeedbackForHardDelete: FeedbackDto | null = null;

  tempStatusFilter: number | null = null;
  tempUserTypeFromFilter: number | null = null;
  tempUserTypeToFilter: number | null = null;

  entityNamePlural: string = 'Feedbacks';
  entityName: string = 'Feedback';
  public UserType = UserType;
  public Status = Status;
  public Math = Math;
  getUserTypeLabel = getUserTypeLabel;
  getStatusLabel = getStatusLabel;

  isDetailsModalOpen: boolean = false;
  selectedFeedbackForDetails: FeedbackDto | null = null;

  sortDirection: 'asc' | 'desc' = 'desc';
  sortField: string = 'createdAt';

  constructor(
    private feedbackService: FeedbackService,
    private darkModeService: DarkModeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.loadFeedbackStatisticsCounts();
    setTimeout(() => { this.animationComplete = true; }, 100);
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.error = null;
    this.feedbackService.getAllFeedbacks(this.searchParams)
      .subscribe({
        next: (response) => {
          if (response && response.isSuccess) {
            this.feedbackList = response.data;
            this.feedbacks = response.data?.list || [];
            this.dropdownStates = Array(this.feedbacks.length).fill(false);
            this.showNoResults = this.feedbacks.length === 0;
          } else if (response) {
            this.error = response.message || 'Failed to load feedbacks.';
            this.toastr.error(this.error);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load feedbacks. Please try again.';
          this.toastr.error(this.error);
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.searchParams.pageNumber = 1;
    this.loadFeedbacks();
  }

  onPageSizeChange(): void {
    this.searchParams.pageNumber = 1;
    this.loadFeedbacks();
  }

  nextPage(): void {
    if (this.feedbackList && this.searchParams.pageNumber * this.searchParams.pageSize < this.feedbackList.totalCount) {
      this.searchParams.pageNumber++;
      this.loadFeedbacks();
    }
  }

  prevPage(): void {
    if (this.searchParams.pageNumber > 1) {
      this.searchParams.pageNumber--;
      this.loadFeedbacks();
    }
  }

  loadFeedbackStatisticsCounts(): void {
    this.feedbackService.getFeedbackStatisticsCounts().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.feedbackCounts = response.data;
        } else {
          this.toastr.error(response?.message || 'Failed to load feedback statistics.');
        }
      },
      error: (err) => {
        this.toastr.error('Error loading feedback statistics.');
      }
    });
  }

  openSoftDeleteModal(feedbackId: number, description: string): void {
    this.selectedFeedbackIdForSoftDelete = feedbackId;
    this.selectedFeedbackDescription = description;
    this.isSoftDeleteModalOpen = true;
    this.dropdownStates.fill(false);
  }

  closeSoftDeleteModal(): void {
    this.isSoftDeleteModalOpen = false;
    this.selectedFeedbackIdForSoftDelete = null;
    this.selectedFeedbackDescription = null;
  }

  openHardDeleteModal(feedback: FeedbackDto): void {
    this.selectedFeedbackForHardDelete = feedback;
    this.isHardDeleteModalOpen = true;
    this.dropdownStates.fill(false);
  }

  closeHardDeleteModal(): void {
    this.isHardDeleteModalOpen = false;
    this.selectedFeedbackForHardDelete = null;
  }

  performHardDelete(): void {
    if (this.selectedFeedbackForHardDelete) {
      this.feedbackService.updateFeedbackStatus(this.selectedFeedbackForHardDelete.id, 'deleted').subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Feedback deleted.');
            this.loadFeedbacks();
            this.loadFeedbackStatisticsCounts();
            this.closeHardDeleteModal();
          } else {
            this.toastr.error(res.message || 'Failed to delete feedback.');
          }
        },
        error: () => {
          this.toastr.error('An error occurred while deleting feedback.');
        }
      });
    }
  }

  // --- New: Toggle Active/Inactive ---
  toggleActiveInactive(feedback: FeedbackDto): void {
    const actionType = feedback.status === Status.Active ? 'inactive' : 'active';
    this.feedbackService.updateFeedbackStatus(feedback.id, actionType).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(`Feedback marked as ${actionType}.`);
          this.loadFeedbacks();
          this.loadFeedbackStatisticsCounts();
        } else {
          this.toastr.error(res.message || `Failed to mark feedback as ${actionType}.`);
        }
      },
      error: () => {
        this.toastr.error('An error occurred while updating feedback status.');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isAdvancedSearchOpen) {
      const advancedSearchElement = document.querySelector('.advanced-search-menu');
      const filterButton = document.querySelector('.bx-filter');
      if (advancedSearchElement && !advancedSearchElement.contains(event.target as Node) &&
          filterButton && !filterButton.contains(event.target as Node)) {
        this.isAdvancedSearchOpen = false;
      }
    }
    if (this.dropdownStates.some(state => state)) {
        const actionDropdowns = document.querySelectorAll('.action-dropdown.active');
        actionDropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target as Node)) {
                this.dropdownStates.fill(false);
            }
        });
    }
  }

  toggleAdvancedSearch(event: Event): void {
    event.stopPropagation();
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
    this.dropdownStates.fill(false);
  }

  clearAdvancedSearch(): void {
    this.tempStatusFilter = null;
    this.tempUserTypeFromFilter = null;
    this.tempUserTypeToFilter = null;
  }

  applyAdvancedSearch(): void {
    this.searchParams.statusFilter = this.tempStatusFilter === null ? undefined : this.tempStatusFilter;
    this.searchParams.userTypeFromFilter = this.tempUserTypeFromFilter === null ? undefined : this.tempUserTypeFromFilter;
    this.searchParams.userTypeToFilter = this.tempUserTypeToFilter === null ? undefined : this.tempUserTypeToFilter;
    this.searchParams.pageNumber = 1;
    this.loadFeedbacks();
    this.isAdvancedSearchOpen = false;
  }

  toggleDropdown(index: number, event: Event): void {
    event.stopPropagation();
    this.dropdownStates = this.dropdownStates.map((state, i) => (i === index ? !state : false));
    this.isAdvancedSearchOpen = false;
  }

  getDigitsArray(num: number): string[] {
    return num.toString().split('');
  }

  isModalOpen: boolean = false; selectedEntity: any = null; isEditMode: boolean = false; modalMode: 'add' | 'edit' | 'view' = 'add';
  openAddModal(): void { this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  onSaveEntity(entity: any): void { }

  openDetailsModal(feedback: FeedbackDto): void {
    this.selectedFeedbackForDetails = feedback;
    this.isDetailsModalOpen = true;
    this.dropdownStates.fill(false);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedFeedbackForDetails = null;
  }

  sortByCreatedAt(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.feedbacks.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  get filteredFeedbacks(): FeedbackDto[] {
    let filtered = this.feedbacks.filter(f => f.status === Status.Active || f.status === Status.Inactive);
    if (this.sortField === 'createdAt') {
      filtered = filtered.slice().sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    return filtered;
  }
}