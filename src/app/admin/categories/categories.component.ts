import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
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
import { AddUpdateComponent } from './add-update/add-update.component';
import { DarkModeService } from '../_services/dark-mode.service';
import { CategoriesService } from '../_services/categories.service';
import { Category, CategorySearch, StandardCategoryDto } from '../../_models/category';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { Status } from '../../_shared/enums';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categories',
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
    AddUpdateComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit, OnDestroy {

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
  selectedEntity: Category | null = null;



  //* Activate/Deactivate Modal state
  isActivateDeactivateModalOpen: boolean = false;
  entityToModify: Category | null = null;
  modifyAction!: string;
  entityIdToChangeStatus: number = 0;
  StatusChangedTo: number = 0;

  ApiUrl: string = environment.apiUrl;

  //* Pagination and filtering
  searchData: CategorySearch = {
    pageNumber: 1,
    PageSize: 5,
    SearchInput: '',
    status: 0
  }
  
  pageSize: number = 5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;

  //* Advanced search filters
  selectedSearchType: string = 'name';
  searchQuery: string = '';

  //* Generic entity configuration
  entityName: string = 'Category';
  entityNamePlural: string = 'Categories';

  //* Animation states for statistics
  displayActiveCount: number = 0;
  displayInactiveCount: number = 0;

  //* Data
  loadedListData: Category[] = [];
  Status = Status;

  //* Math for template
  Math = Math;

  //* Constructor
  constructor(
    private categoriesService: CategoriesService,
    private darkModeService: DarkModeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadActiveInactiveCount();
    
    // Subscribe to dark mode changes
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      }
    );
  }

  loadData() {
    this.searchData.pageNumber = this.currentPage;
    console.log('Search Data:', this.searchData);
    this.isLoading = true;
    
    this.categoriesService.getpagintedData(this.searchData).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.isLoading = false;
        
        if (response && response.isSuccess && response.data) {
          let items = response.data.items;
          
          console.log('Original items:', items);
          console.log('Search status:', this.searchData.status, typeof this.searchData.status);
          console.log('Status.Deleted:', Status.Deleted, typeof Status.Deleted);
          console.log('Should filter?', Number(this.searchData.status) !== Status.Deleted);
          
          // Filter out deleted categories unless specifically filtering for deleted status
          if (Number(this.searchData.status) !== Status.Deleted) {
            items = items.filter((category: Category) => category.status !== Status.Deleted);
            console.log('After filtering out deleted:', items);
          } else {
            console.log('Not filtering - showing all items including deleted');
          }
          
          this.loadedListData = items;
          this.pageSize = response.data.pageSize;
          this.totalCount = items.length; // Update count based on filtered items
          this.currentPage = response.data.currentPage;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.showNoResults = items.length === 0;
          this.dropdownStates = new Array(this.loadedListData.length).fill(false);
          this.isAdvancedSearchOpen = false;
        }
      },
      error: (err) => {
        console.log('API Error:', err);
      }
    });
  }

  getCategoryStatusColor(status: number) {
    switch (status) {
      case Status.Active: return '#2ed134';   // Green
      case Status.Inactive: return '#f0ad4e'; // Yellow
      case Status.Deleted: return '#6c757d';  // Gray
      case Status.Pending: return '#17a2b8';  // Blue
      case Status.Rejected: return '#e6382f'; // Red
      default: return '#000000';                   
    }
  }

  getActionLabel(status: number | string): string {
    if (status === 'delete') {
      return 'Delete';
    }
    
    switch (status) {
      case Status.Active: return 'Deactivate';
      case Status.Inactive: return 'Activate';
      case Status.Pending: return 'Approve';
      case Status.Rejected: return 'Reject';
      case Status.Deleted: return 'Delete';
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

  loadActiveInactiveCount() {
    this.categoriesService.getTotalActiveInactive().subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.displayActiveCount = response.data.totalActive || 0;
          this.displayInactiveCount = response.data.totalInactive || 0;
        }
      },
      error: (err: any) => {
        console.log('Error loading counts:', err);
        // Set default values if API fails
        this.displayActiveCount = 0;
        this.displayInactiveCount = 0;
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

  toggleDropdown(index: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownStates[index] = !this.dropdownStates[index];
    
    // Close other dropdowns
    for (let i = 0; i < this.dropdownStates.length; i++) {
      if (i !== index) {
        this.dropdownStates[i] = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-dropdown')) {
      this.dropdownStates.fill(false);
    }
  }

  setFilter(filter: string, status: number): void {
    this.currentFilter = filter;
    this.searchData.status = status;
    this.currentPage = 1;
    this.searchData.pageNumber = 1;
    this.loadData();
  }

  toggleAdvancedSearch(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
  }

  applyAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadData();
  }

  clearAdvancedSearch(): void {
    this.searchData = {
      pageNumber: 1,
      PageSize: this.searchData.PageSize,
      SearchInput: '',
      status: 0
    };
    this.currentPage = 1;
    this.loadData();
  }



  openModal(item: Category): void {
    this.selectedEntity = item;
    this.isEditMode = true;
    this.modalMode = 'view';
    this.isModalOpen = true;
  }

  openAddModal(): void {
    this.selectedEntity = null;
    this.isEditMode = false;
    this.modalMode = 'add';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    
    // Delay state reset until after modal animation completes (typically 300ms)
    setTimeout(() => {
      this.selectedEntity = null;
      this.isEditMode = false;
      this.modalMode = 'view';
    }, 300);
  }



  openActivateDeactivateModal(id: number, entity: Category, action: string, status: number): void {
    this.entityIdToChangeStatus = id;
    this.entityToModify = entity;
    this.modifyAction = action;
    this.StatusChangedTo = status;
    this.dropdownStates = this.dropdownStates.map(() => false);
    this.isActivateDeactivateModalOpen = true;
  }

  closeActivateDeactivateModal(): void {
    this.isActivateDeactivateModalOpen = false;
    setTimeout(() => {
      this.entityToModify = null;
      this.modifyAction = '';
      this.entityIdToChangeStatus = 0;
      this.StatusChangedTo = 0;
    }, 300); // Match the CSS transition duration
  }

  confirmActivateDeactivate(): void {
    if (this.entityToModify) {
      const newStatus = this.modifyAction === 'delete' 
        ? this.StatusChangedTo 
        : this.getToggledStatus(this.StatusChangedTo);
      
      this.categoriesService.changeStatus(this.entityIdToChangeStatus, newStatus).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toastr.success(response.message, 'Success');
            this.loadData();
            this.loadActiveInactiveCount();
          } else {
            this.toastr.error(response.message || 'Operation failed', 'Error');
          }
          this.closeActivateDeactivateModal();
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error('An error occurred while updating category status', 'Error');
          this.closeActivateDeactivateModal();
        }
      });
    }
  }

  onSearchClear(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      this.searchData.SearchInput = '';
      this.loadData();
    }
  }

  getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }
}
