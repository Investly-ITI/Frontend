import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InvestorContactRequestService } from '../_services/investor-contact-request.service';
import { DarkModeService } from '../_services/dark-mode.service';
import { InvestorContactRequest, InvestorContactItem, InvestorContactResponse, UpdateContactRequestStatusDto } from '../../_models/contact-request';
import { ContactRequestStatus } from '../../_shared/enums';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { DropdownDto } from '../../_models/user';
import { InvestorService } from '../_services/investor.service';
import { FounderService } from '../_services/founder.service';

@Component({
  selector: 'app-contact-request',
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
    StatusLabelPipe,
  ],
  templateUrl: './contact-request.component.html',
  styleUrls: ['./contact-request.component.css']
})
export class ContactRequestComponent implements OnInit, OnDestroy {
  //* State management (Flags)
  isDarkMode: boolean = true;
  isLoading: boolean = false;
  isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [false]; 
  animationComplete: boolean = true;
  isAdvancedSearchOpen: boolean = false;
  currentFilter: string = '';

  //* Subscription for dark mode
  private darkModeSubscription: Subscription = new Subscription();

  //* Modal state
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  modalMode: 'add' | 'view' = 'view';
  selectedEntity: InvestorContactItem | null = null;

  //* Status change modal
  isStatusChangeModalOpen = false;
  selectedRequest: InvestorContactItem | null = null;
  statusChangeAction: 'accept' | 'decline' | 'pending'| null = null;
  declineReason = '';
  
  //* Pagination and filtering
  searchData: InvestorContactRequest = {
    pageNumber: 1,
    pageSize: 5,
    searchTerm: '',
    investorIdFilter: undefined,
    founderIdFilter: undefined,
    statusFilter: undefined,
    columnOrderBy: '',
    orderByDirection: undefined
  };

  pageSize: number = 5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;

  //* Advanced search filters
  selectedInvestorId: string = '';
  selectedFounderId: string = '';
  selectedStatus: string = '';
  searchQuery: string = '';
  
  //* Entity configuration
  entityName: string = 'Contact Request';
  entityNamePlural: string = 'Contact Requests';

  //* Statistics
  pendingCount: number = 0;
  acceptedCount: number = 0;
  declinedCount: number = 0;
  //* Data
  loadedListData: InvestorContactItem[] = [];
  ContactRequestStatus = ContactRequestStatus; // Make enum available in template
  investors: DropdownDto[] = [];
  founders: DropdownDto[] = [];


  constructor(
    private contactRequestService: InvestorContactRequestService,
    private darkModeService: DarkModeService,
    private toastr: ToastrService,
    private investorService: InvestorService,
    private founderService: FounderService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadInvestors();
    this.loadFounders()
    this.loadStatusCounts();
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      }
    );
  }

  loadData(): void {
    this.searchData.pageNumber = this.currentPage;
    this.isLoading = true;
    
    this.contactRequestService.getInvestorContacts(this.searchData).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.loadedListData = response.data.items;
          this.pageSize = response.data.pageSize;
          this.totalCount = response.data.totalFilteredItems;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.totalPages;
          this.showNoResults = response.data.items.length === 0;
          this.dropdownStates = new Array(this.loadedListData.length).fill(false);
          this.isAdvancedSearchOpen = false;
          console.log(response.data)
        } else {
          this.toastr.error(response.message || 'Failed to load contact requests');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load contact requests');
        this.isLoading = false;
      }
    });
  }

  loadInvestors(): void {
    this.isLoading = true;    
    this.investorService.getInvestorsForDropdown().subscribe({
      next: (response) => {
          this.investors = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading investors:', error);
        this.isLoading = false;
      }
    });
  }

  loadFounders(): void {
    this.isLoading = true;    
    this.founderService.getFoundersForDropdown().subscribe({
      next: (response) => {
          this.founders = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading investors:', error);
        this.isLoading = false;
      }
    });
  }


  loadStatusCounts(): void {
    this.contactRequestService.getPendingContactsCount().subscribe({
      next: (response) => {
          this.pendingCount = response;
      },
      error: (err) => console.error('Failed to load pending count', err)
    });

    this.contactRequestService.getAcceptedContactsCount().subscribe({
      next: (response) => {
          this.acceptedCount = response;
      },
      error: (err) => console.error('Failed to load accepted count', err)
    });

    this.contactRequestService.getDeclinedContactsCount().subscribe({
      next: (response) => {
          this.declinedCount = response;
      },
      error: (err) => console.error('Failed to load declined count', err)
    });
  }

  //* Pagination
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  //* Status change methods
  openStatusChangeModal(item: InvestorContactItem, action: 'accept' | 'decline' | 'pending'): void {
    this.selectedRequest = item;
    this.statusChangeAction = action;
    this.isStatusChangeModalOpen = true;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  closeStatusChangeModal(): void {
    this.isStatusChangeModalOpen = false;
    this.selectedRequest = null;
    this.statusChangeAction = null;
    this.declineReason = '';
  }

  confirmStatusChange(): void {
    if (!this.selectedRequest) return;

    let newStatus: ContactRequestStatus;
    switch (this.statusChangeAction) {
      case 'pending':
        newStatus = ContactRequestStatus.Pending;
        break;
      case 'accept':
        newStatus = ContactRequestStatus.Accepted;
        break;
      case 'decline':
        newStatus = ContactRequestStatus.Declined;
        break;
      default:
        console.error('Unknown status change action:', this.statusChangeAction);
        return;
    }

    const dto: UpdateContactRequestStatusDto = {
      contactRequestId: this.selectedRequest.id,
      newStatus,
      declineReason: this.statusChangeAction === 'decline' ? this.declineReason : undefined
    };

    this.isLoading = true;
    this.contactRequestService.updateContactRequestStatus(dto).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastr.success(response.message || 'Status updated successfully');
          this.loadData();
          this.loadStatusCounts();
        } else {
          this.toastr.error(response.message || 'Failed to update status');
        }
        this.closeStatusChangeModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update status');
        this.isLoading = false;
      }
    });
  }

  //* Filter methods
  setFilter(filter: string, status: ContactRequestStatus): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.searchData.statusFilter = this.currentFilter ? status : undefined;
    this.loadData();
  }

  //* Search methods
  applyAdvancedSearch(): void {
    this.searchData.investorIdFilter = this.selectedInvestorId ? Number(this.selectedInvestorId) : undefined;
    this.searchData.founderIdFilter = this.selectedFounderId ? Number(this.selectedFounderId) : undefined;
    this.searchData.statusFilter = this.selectedStatus ? Number(this.selectedStatus) : undefined;
    this.searchData.searchTerm = this.searchQuery;
    console.log(this.selectedFounderId)
    this.loadData();
  }

  clearAdvancedSearch(): void {
    this.searchData.investorIdFilter = undefined;
    this.searchData.founderIdFilter = undefined;
    this.searchData.statusFilter = undefined;
    this.searchData.searchTerm = '';
    this.selectedInvestorId = '';
    this.selectedFounderId = '';
    this.selectedStatus = '';
    this.searchQuery = '';
    this.currentFilter = '';
    this.loadData();
  }

  //* UI helpers
  toggleDropdown(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  toggleAdvancedSearch(event?: Event): void {
    if (event) event.stopPropagation();
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-dropdown')) {
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
    if (!target.closest('.advanced-search-dropdown')) {
      this.isAdvancedSearchOpen = false;
    }
  }

  //* Modal methods
  openModal(item: InvestorContactItem): void {
    this.isModalOpen = true;
    this.modalMode = 'view';
    this.selectedEntity = item;
  }

  closeModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedEntity = null;
    }, 300);
  }

  //* Handle search clear event
  onSearchClear(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value === '') {
      this.searchData.searchTerm = '';
      this.searchData.pageNumber = 1;
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }
}