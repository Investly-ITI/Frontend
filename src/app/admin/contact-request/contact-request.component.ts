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
// import { AddUpdateComponent } from './add-update/add-update.component';
import { InvestorContactRequestService } from '../_services/investor-contact-request.service';
import { DarkModeService } from '../_services/dark-mode.service';
import { InvestorContactRequest, InvestorContactItem, InvestorContactResponse } from '../../_models/contact-request';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { Status } from '../../_shared/enums';

@Component({
  selector: 'app-contact-request',
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
    // AddUpdateComponent,
  ],
  templateUrl: './contact-request.component.html',
  styleUrl: './contact-request.component.css'
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

  //* Activate/Deactivate Modal state
  isActivateDeactivateModalOpen: boolean = false;
  entityToModify: InvestorContactItem | string | null = null;
  modifyAction: 'deactivate' | 'activate' | 'delete' = 'deactivate';
  entityIdToChangeStatus: number = 0;
  StatusChangedTo: number = 0;

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
  
  //* Generic entity configuration
  entityName: string = 'Contact Request';
  entityNamePlural: string = 'Contact Requests';

  //* Animation states for statistics
  displayActiveCount: number = 0;
  displayInactiveCount: number = 0;

  //* Data
  loadedListData: InvestorContactItem[] = [];
  Status = Status;

  //* Constructor
  constructor(
    private contactRequestService: InvestorContactRequestService,
    private darkModeService: DarkModeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadActiveInactiveCount();
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      }
    );
  }

  loadData() {
    this.searchData.pageNumber = this.currentPage;
    this.isLoading = true;
    
    this.contactRequestService.getInvestorContacts(this.searchData).subscribe({
      next: (response: InvestorContactResponse) => {
        this.isLoading = false;
        this.loadedListData = response.items;
        this.pageSize = response.pageSize;
        this.totalCount = response.totalFilteredItems;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.showNoResults = response.items.length === 0;
        this.dropdownStates = new Array(this.loadedListData.length).fill(false);
        this.isAdvancedSearchOpen = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  loadActiveInactiveCount() {
    // Load active count (status = true)
    this.contactRequestService.getInvestorContacts({ 
      pageNumber: 1,
      pageSize: 1,
      statusFilter: true 
    }).subscribe({
      next: (response: InvestorContactResponse) => {
        this.displayActiveCount = response.totalFilteredItems;
      },
      error: (err) => {
        console.log(err);
      }
    });

    // Load inactive count (status = false)
    this.contactRequestService.getInvestorContacts({ 
      pageNumber: 1,
      pageSize: 1,
      statusFilter: false 
    }).subscribe({
      next: (response: InvestorContactResponse) => {
        this.displayInactiveCount = response.totalFilteredItems;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  //* Toggle dropdown
  toggleDropdown(index: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  //* Close dropdowns when clicking outside
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

  //* Setting filter of search by status
  setFilter(filter: string, status: boolean): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.searchData.statusFilter = status;
    this.loadData();
  }

  //* Toggle advanced search dropdown
  toggleAdvancedSearch(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
  }

  //* Apply advanced search filters
  applyAdvancedSearch(): void {
    // Convert string inputs to numbers where needed
    this.searchData.investorIdFilter = this.selectedInvestorId ? Number(this.selectedInvestorId) : undefined;
    this.searchData.founderIdFilter = this.selectedFounderId ? Number(this.selectedFounderId) : undefined;
    this.searchData.statusFilter = this.selectedStatus ? this.selectedStatus === 'true' : undefined;
    this.searchData.searchTerm = this.searchQuery;
    
    this.loadData();
  }

  //* Clear advanced search filters
  clearAdvancedSearch(): void {
    this.searchData.investorIdFilter = undefined;
    this.searchData.founderIdFilter = undefined;
    this.searchData.statusFilter = undefined;
    this.searchData.searchTerm = '';
    this.selectedInvestorId = '';
    this.selectedFounderId = '';
    this.selectedStatus = '';
    this.searchQuery = '';
    this.loadData();
  }

  //* Modal methods:
  openModal(item: InvestorContactItem): void {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.modalMode = 'view';
    this.selectedEntity = item;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  openAddModal(): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.modalMode = 'add';
    this.selectedEntity = null;
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  closeModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.isEditMode = false;
      this.modalMode = 'view';
      this.selectedEntity = null;
    }, 300); 
  }

  onSaveEntity(entityData: InvestorContactItem): void {
    this.closeModal();
    this.loadData();
    this.loadActiveInactiveCount();
  }

  //* Activate/Deactivate Modal methods
  openActivateDeactivateModal(
    id: number, 
    entityName: string, 
    action: 'deactivate' | 'activate' | 'delete',
    status: number
  ): void {
    this.entityToModify = entityName;
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
      // Implement status change logic here
      // You'll need to call the appropriate service method
      this.toastr.success("Status changed successfully", "Success");
      this.loadData();
      this.loadActiveInactiveCount();
      this.closeActivateDeactivateModal();
    }
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

  //* Get digits array for flip animation
  getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }
}