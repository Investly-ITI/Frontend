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
import { InvestorService } from '../_services/investor.service';
import { DarkModeService } from '../_services/dark-mode.service';
import { Investor, InvestorSearch } from '../../_models/investor';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { Status } from '../../_shared/enums';
import { ArrayDataSource } from '@angular/cdk/collections';
import { Gender } from '../../_shared/general';
import { Governorate } from '../../_models/governorate';
import { City } from '../../_models/city';
import { GovernrateService } from '../../_services/governorate.service';
import { SendnotificationsComponent } from "./sendnotifications/sendnotifications.component";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-investor',
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
    AddUpdateComponent,
    SendnotificationsComponent
],
  templateUrl: './investor.component.html',
  styleUrl: './investor.component.css'
})

export class InvestorComponent implements OnInit, OnDestroy {

  //* State management (Flags)
  isDarkMode: boolean = true;
  isLoading: boolean = false;
  isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [false]; 
  animationComplete: boolean = true;
  isAdvancedSearchOpen: boolean = false; // Advanced search dropdown state
  currentFilter:string='';

  //* Subscription for dark mode
  private darkModeSubscription: Subscription = new Subscription();

  //* Modal state
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  modalMode: 'add' | 'view' = 'view';
  selectedEntity: any = null; // Entity data to pass to add-update component

  //* Activate/Deactivate Modal state
  isActivateDeactivateModalOpen: boolean = false;
  entityToModify: any = null; // Store the entity being modified
  modifyAction!:string; // Track the action type
  entityIdToChangeStatus:number=0;
  StatusChangedTo:number=0;
  

  ApiUrl: string = environment.apiUrl;
  


  //* Profile image
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';

  //* Pagination and filtering
  searchData: InvestorSearch = {
    pageNumber: 1,
    PageSize: 5,
    SearchInput: '',
    governmentId: 0,
    gender: null,
    status:0
  }
  
  pageSize:number=5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;

  //* Advanced search filters
    selectedGovernrate: string = '';
     selectedCity: string = '';
  selectedGender: string = '';
  selectedSearchType: string = 'name'; // 'name' or 'ssn'
  searchQuery: string = '';

  //* Dropdown data
  governorates: Governorate[] = [];
   cities: City[] = [];
  
  //* Generic entity configuration
  entityName: string = 'Investor';
  entityNamePlural: string = 'Investors';

  //* Animation states for statistics
  displayActiveCount: number = 0;
  displayInactiveCount: number = 0;

  //*Data
  loadedListData: Investor[] = [];
  Status = Status
  Gender=Gender
  //notifications
  isNotitficationModalOpen: boolean = false;
  notificationmodalMode= 'add';


  //* Constructor
  constructor(
    private InvestorService: InvestorService,
    private darkModeService: DarkModeService,
    private toastr: ToastrService,
    private governrateService:GovernrateService
  ) {}
  ngOnInit(): void {
    this.loadData();
    this.loadActiveInactiveCount();
    this.loadGovernments();
    // Subscribe to dark mode changes
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      }
    );
  }



  loadData() {
    this.searchData.pageNumber=this.currentPage;
    console.log(this.searchData);
    this.isLoading = true;
    this.loadedListData = []; // Clear data immediately when loading starts
    this.InvestorService.getpagintedData(this.searchData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.loadedListData = response.data.list;
          this.pageSize = response.data.pageSize;
          this.totalCount = response.data.totalCount || 0;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.list.length === 0 ? 0 : Math.ceil(this.totalCount / this.pageSize);
          this.showNoResults = response.data.list.length === 0;
          this.dropdownStates=new Array(this.loadedListData.length).fill(false);
          this.isAdvancedSearchOpen = false;
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  getUserStatusColor(status:number){
      switch (status) {
    case Status.Active: return '#2ed134';   // Green
    case Status.Inactive: return '#f0ad4e'; // Yellow
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
loadGovernments(){
  
    this.isLoading = true;
    this.governrateService.getGovernrates().subscribe({
      next: (response) => {   
        this.governorates = response.data;
        this.isLoading = false;
          this.isAdvancedSearchOpen = false;
      },
      error: (error) => {
        console.error('Error loading governates:', error);
        this.toastr.error('Failed to load governates.');
        this.isLoading = false;
      }
    });

    
}
goToNextPage() {
  if (this.currentPage < this.totalPages && !this.showNoResults && this.totalPages > 0) {
    this.currentPage++;
    this.loadData();
  }
}

goToPreviousPage() {
  if (this.currentPage > 1 && !this.showNoResults) {
    this.currentPage--;
    this.loadData();
  }
}

goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage && page !== -1) {
    this.currentPage = page;
    this.loadData();
  }
}

getPageNumbers(): number[] {
  const pages: number[] = [];
  const totalPages = this.totalPages;
  const current = this.currentPage;

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

loadActiveInactiveCount(){
  var sub2= this.InvestorService.getTotalActiveInactive().subscribe({
    next:(response)=>{
      this.displayActiveCount=response.data.totalActive;
      this.displayInactiveCount=response.data.totalInactive
    },error:(err)=>{
       console.log(err);
    }
  })
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
  setFilter(filter: string, status:number): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.searchData.status=status;
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
    this.loadData();
  }

  //* Clear advanced search filters
  clearAdvancedSearch(): void {
  this.searchData.gender=null;
  this.searchData.governmentId=0;
  this.searchData.status=0;
  this.currentFilter = ''; // Clear the status filter dots visual state
  this.loadData();
  }


  //* Modal methods:
  openModal(item:Investor): void {
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
    console.log("666666");
    this.isModalOpen = false;
    //setTimeout(() => {
      this.isEditMode = true;
      this.modalMode = 'view';
      this.selectedEntity = null;
    // }, 300); 
  }

  onSaveEntity(entityData: Investor): void {
    this.closeModal();
    this.loadData();
    this.loadActiveInactiveCount();

  }

  //* Activate/Deactivate Modal methods
  openActivateDeactivateModal(id:number,entity: any, action:string,status:number): void {

    this.entityToModify = entity;
    this.modifyAction = action;
    this.entityIdToChangeStatus=id;
    this.StatusChangedTo= status;
    this.dropdownStates = this.dropdownStates.map(() => false);
    this.isActivateDeactivateModalOpen = true;
  }

  closeActivateDeactivateModal(): void {
    this.isActivateDeactivateModalOpen = false;
    setTimeout(() => {
      this.entityToModify = null;
      this.modifyAction = 'deactivate';
    }, 300); // Match the CSS transition duration
  }

  confirmActivateDeactivate(): void {
    if (this.entityToModify) {
     
     var res3= this.InvestorService.changeStatus(this.entityIdToChangeStatus,this.getToggledStatus(this.StatusChangedTo)).subscribe({
      next:(response)=>{
       if(response.isSuccess){
        this.toastr.success(response.message,"Success");
        this.loadData();
        this.loadActiveInactiveCount();
       }else{
        this.toastr.error(response.message,"Error");
       }
         
      },error:(err)=>{
        this.toastr.error(err,"Error");
      }
     })

      this.closeActivateDeactivateModal();
    }

  }


  //* Handle search clear event (when X button is clicked)
  onSearchClear(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value === '') {
      console.log('test clear'); 
      this.searchData.SearchInput = '';
      this.searchData.pageNumber=1;
      this.loadData();
      
    }
  }
  
    //* Get digits array for flip animation
  getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }
   onGovernorateChange(governorateId: number): void {
    this.selectedCity = ''; 
    this.cities = [];
    
    if (governorateId>0) {
      
      this.loadCities(governorateId);
      this.searchData.governmentId = governorateId;
    } else {
      this.searchData.governmentId = 0;
    }
  }
 loadCities(governorateId: number): void {
    this.governrateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        this.cities = response.data;
        console.log('Cities loaded:', this.cities);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.toastr.error('Failed to load cities.');
      }
    });
  }
  SendNotificationModal(item: Investor): void {
      this.isNotitficationModalOpen = true;
      this.notificationmodalMode = 'add';
      this.selectedEntity = item;
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
      closeNotitifcationModal(): void {
      this.isNotitficationModalOpen = false;
      setTimeout(() => {
        this.notificationmodalMode = 'add';
        this.selectedEntity = null;
      }, 300); 
    }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }

}
