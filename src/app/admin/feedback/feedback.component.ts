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
import { getUserTypeLabel, getStatusLabel, getFeedbackTargetTypeLabel } from '../../_shared/utils/enum.utils';
import { UserType, Status } from '../../_shared/enums';
import {FeedbackTargetType} from '../../_models/feedback'
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
        MatCheckboxModule
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
    currentFilter: string = '';
    error: string | null = null;

    feedbackList: FeedbackListDto | null = null;
    feedbacks: FeedbackDto[] = [];
    feedbackCounts: FeedbackCountsDto = new FeedbackCountsDto();
    searchParams: FeedbackSearchDto = new FeedbackSearchDto();

    // Helper properties for pagination
    get totalPages(): number {
        if (!this.feedbackList || this.feedbackList.totalCount === 0) return 0;
        return Math.ceil(this.feedbackList.totalCount / this.searchParams.pageSize);
    }

    get totalCount(): number {
        return this.feedbackList?.totalCount || 0;
    }
    userTypes: UserType[] = Object.values(UserType).filter(value => typeof value === 'number') as UserType[];
    statuses: Status[] = [Status.Active, Status.Inactive];
    feedbackTargetTypes: FeedbackTargetType[] = Object.values(FeedbackTargetType).filter(value => typeof value === 'number') as FeedbackTargetType[];



    tempStatusFilter: number | null = null;
    tempUserTypeFromFilter: number | null = null;
    tempUserTypeToFilter: number | null = null; 

    entityNamePlural: string = 'Feedbacks';
    entityName: string = 'Feedback';
    public UserType = UserType;
    public Status = Status;
    public FeedbackTargetType = FeedbackTargetType;
    public Math = Math;
    getUserTypeLabel = getUserTypeLabel;
    getStatusLabel = getStatusLabel;
    getFeedbackTargetTypeLabel = getFeedbackTargetTypeLabel;

    isDetailsModalOpen: boolean = false;
    selectedFeedbackForDetails: FeedbackDto | null = null;

    isActivateDeactivateModalOpen: boolean = false;
    entityToModify: any = null;
    modifyAction!: string;
    entityIdToChangeStatus: number = 0;
    StatusChangedTo: number = 0;

    sortDirection: 'asc' | 'desc' = 'desc';
    sortField: string = 'createdAt';

    constructor(
        private feedbackService: FeedbackService,
        private darkModeService: DarkModeService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.searchParams.pageSize = 5;
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
        this.feedbacks = []; // Clear data immediately when loading starts
        this.feedbackList = null; // Clear list data as well
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
                        this.toastr.error(this.error, "Error");
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    this.error = 'Failed to load feedbacks. Please try again.';
                    this.toastr.error(this.error, "Error");
                    this.isLoading = false;
                }
            });
    }

    onSearch(): void {
        this.searchParams.pageNumber = 1;
        this.loadFeedbacks();
    }

    onSearchInputChange(): void {
        if (!this.searchParams.searchInput) {
            this.clearSearch();
        }
    }

    clearSearch(): void {
        this.searchParams = new FeedbackSearchDto();
        this.searchParams.pageSize = 5;
        this.tempStatusFilter = null;
        this.tempUserTypeFromFilter = null;
        this.tempUserTypeToFilter = null;
        this.loadFeedbacks();
    }

    onPageSizeChange(): void {
        this.searchParams.pageNumber = 1;
        this.loadFeedbacks();
    }

    nextPage(): void {
        if (this.feedbackList && this.searchParams.pageNumber * this.searchParams.pageSize < this.feedbackList.totalCount && !this.showNoResults && this.totalPages > 0) {
            this.searchParams.pageNumber++;
            this.loadFeedbacks();
        }
    }

    prevPage(): void {
        if (this.searchParams.pageNumber > 1 && !this.showNoResults) {
            this.searchParams.pageNumber--;
            this.loadFeedbacks();
        }
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages && page !== this.searchParams.pageNumber && page !== -1) {
            this.searchParams.pageNumber = page;
            this.loadFeedbacks();
        }
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const totalPages = this.totalPages;
        const current = this.searchParams.pageNumber;

        if (totalPages <= 7) {
            // Show all pages if total is 7 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current > 4) {
                // Add dots if current page is far from start
                pages.push(-1); // -1 represents dots
            }

            // Show pages around current page
            let start = Math.max(2, current - 1);
            let end = Math.min(totalPages - 1, current + 1);

            // Adjust range to always show 3 numbers around current
            if (current <= 3) {
                end = Math.min(totalPages - 1, 4);
            }
            if (current >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (current < totalPages - 3) {
                // Add dots if current page is far from end
                pages.push(-1); // -1 represents dots
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    }

    loadFeedbackStatisticsCounts(): void {
        this.feedbackService.getFeedbackStatisticsCounts().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.feedbackCounts = response.data;
                } else {
                    this.toastr.error(response?.message || 'Failed to load feedback statistics.', "Error");
                }
            },
            error: (err) => {
                this.toastr.error('Error loading feedback statistics.', "Error");
            }
        });
    }



    toggleActiveInactive(feedback: FeedbackDto): void {
        let actionType: number;
        if (feedback.status === Status.Active) {
            actionType = Status.Inactive;
        } else {
            actionType = Status.Active;
        }
        this.feedbackService.updateFeedbackStatus(feedback.id, actionType).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastr.success(`Feedback marked as ${this.getStatusLabel(actionType)}.`, 'Success');
                    this.loadFeedbacks();
                    this.loadFeedbackStatisticsCounts();
                } else {
                    this.toastr.error(res.message || `Failed to mark feedback as ${this.getStatusLabel(actionType)}.`, 'Error');
                }
            },
            error: () => {
                this.toastr.error('An error occurred while updating feedback status.', 'Error');
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
        this.currentFilter = ''; // Clear the status filter dots visual state
        this.clearSearch();
        this.isAdvancedSearchOpen = false;
    }

    setFilter(filter: string, status: number): void {
        this.currentFilter = this.currentFilter === filter ? '' : filter;
        this.searchParams.statusFilter = this.currentFilter ? status : undefined;
        this.searchParams.pageNumber = 1;
        this.loadFeedbacks();
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

    openActivateDeactivateModal(id: number, entity: any, action: string, status: number): void {
        this.entityToModify = entity;
        this.modifyAction = action;
        this.entityIdToChangeStatus = id;
        this.StatusChangedTo = status;
        this.dropdownStates = this.dropdownStates.map(() => false);
        this.isActivateDeactivateModalOpen = true;
    }

    closeActivateDeactivateModal(): void {
        this.isActivateDeactivateModalOpen = false;
        setTimeout(() => {
            this.entityToModify = null;
            this.modifyAction = 'deactivate';
        }, 300);
    }

    confirmActivateDeactivate(): void {
        if (this.entityToModify) {
            if (this.StatusChangedTo === Status.Deleted) {
                // Handle delete action
                this.feedbackService.updateFeedbackStatus(this.entityIdToChangeStatus, Status.Deleted).subscribe({
                    next: (res) => {
                        if (res.isSuccess) {
                            this.toastr.success('Feedback deleted successfully.', 'Success');
                            this.loadFeedbacks();
                            this.loadFeedbackStatisticsCounts();
                        } else {
                            this.toastr.error(res.message || 'Failed to delete feedback.', 'Error');
                        }
                    },
                    error: () => {
                        this.toastr.error('An error occurred while deleting feedback.', 'Error');
                    }
                });
            } else {
                // Handle activate/deactivate action
                const feedbackToToggle = this.feedbacks.find(f => f.id === this.entityIdToChangeStatus);
                if (feedbackToToggle) {
                    this.toggleActiveInactive(feedbackToToggle);
                }
            }
            this.closeActivateDeactivateModal();
        }
    }

    getUserStatusColor(status: number): string {
        switch (status) {
            case Status.Active: return '#2ed134';   // Green
            case Status.Inactive: return '#f0ad4e'; // Yellow/Orange
            case Status.Deleted: return '#6c757d';  // Gray
            case Status.Pending: return '#17a2b8';  // Blue
            case Status.Rejected: return '#e6382f'; // Red
            default: return '#000000';                   
        }
    }

    getActionLabel(status: number): string {
        switch (status) {
            case Status.Active: return 'Deactivate';
            case Status.Inactive: return 'Activate';
            case Status.Pending: return 'Approve';
            case Status.Rejected: return 'reject';
            case Status.Deleted: return 'delete';
            default: return 'Update';
        }
    }

    getToggledStatus(status: number): number {
        switch (status) {
            case Status.Active: return Status.Inactive;
            case Status.Inactive: return Status.Active;
            case Status.Pending: return Status.Active; 
            case Status.Rejected: return Status.Rejected; 
            case Status.Deleted: return Status.Deleted; 
            default: return Status.Pending;
        }
    }

    getStatusIcon(status: number): string {
        switch (status) {
            case Status.Active: return 'bx-x-circle';
            case Status.Inactive: return 'bx-check-circle';
            case Status.Pending: return 'bx-check-circle';
            case Status.Rejected: return 'bx-x-circle';
            case Status.Deleted: return 'bx-x';
            default: return 'bx-cog';
        }
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
        let filtered = this.feedbacks;

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