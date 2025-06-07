import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Founder, FounderSearch } from '../../_models/founder';
import { Status } from '../../_shared/enums';
import { Gender } from '../../_shared/general';
import { FounderService } from '../_services/founder.service';
import { DarkModeService } from '../_services/dark-mode.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { FormsModule } from '@angular/forms';
import { ViewdetailsComponent } from './viewdetails/viewdetails.component';
import { GovernrateService } from '../../_services/governorate.service';
import { Governorate } from '../../_models/governorate';
import { City } from '../../_models/city';
import { SendnotificationComponent } from "./sendnotification/sendnotification.component";

@Component({
  selector: 'app-founder',
  imports: [CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    MatSelectModule,
    MatCheckboxModule,
    StatusLabelPipe,
    ViewdetailsComponent, SendnotificationComponent],
  templateUrl: './founder.component.html',
  styleUrl: './founder.component.css'
})
export class FounderComponent implements OnInit {
  
  isDarkMode: boolean = true;
  isLoading: boolean = false;
isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [false]; 
  animationComplete: boolean = true;
  isAdvancedSearchOpen: boolean = false; 
  currentFilter:string='';
  governorates: Governorate[] = [];
  cities: City[] = [];
  isNotitficationModalOpen: boolean = false;

 private darkModeSubscription: Subscription = new Subscription();
   isModalOpen: boolean = false;
  isEditMode: boolean = false;
  modalMode: 'add' | 'view' = 'view';
  notificationmodalMode= 'add';
  selectedEntity: any = null;

  isActivateDeactivateModalOpen: boolean = false;
  entityToModify: any = null; 
  modifyAction: 'deactivate' | 'activate' |'delete'= 'deactivate'; 
  entityIdToChangeStatus:number=0;
  StatusChangedTo:number=0;

   profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
   searchData: FounderSearch = {
       PageNumber: 1,
       PageSize: 5,
       SearchInput: '',
       GovernmentId: 0,
       Gender: null,
       status:0
     }
      pageSize:number=5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;

    selectedGovernrate: string = '';
     selectedCity: string = '';
  selectedGender: string = '';
  selectedSearchType: string = 'name'; 
  searchQuery: string = '';

  entityName: string = 'Founder';
  entityNamePlural: string = 'Founders';

    displayActiveCount: number = 0;
  displayInactiveCount: number = 0;
    loadedListData: Founder[] = [];
    Status = Status
    Gender=Gender
     
  constructor(private FounderService:FounderService,  private darkModeService: DarkModeService,
      private toastr: ToastrService,private governrateService:GovernrateService) { }

  ngOnInit(): void {
    this.loadData();
  
    this.loadactiveInactiveCount();
     this.loadGovernments();
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      }
    );
  }
loadData()
 {  
  this.searchData.PageNumber = this.currentPage;
  console.log('Loading data with searchData:', this.searchData);
    this.isLoading = true;
    this.FounderService.GetAllFoundersPaginated(this.searchData).subscribe({
      next: (response) => {
           console.log('Response:', response);
        this.loadedListData = response.data.founders;
            console.log('loadedListData:', this.loadedListData);
        this.totalCount = response.data.totalCount;
        this.isLoading = false;
        this.currentPage = response.data.currentPage;
          this.totalPages=Math.ceil(this.totalCount / this.pageSize);
          this.showNoResults = response.data.totalCount=== 0 ? true : false;
          console.log('result:', this.showNoResults);
          this.dropdownStates=new Array(this.loadedListData.length).fill(false);
          this.isAdvancedSearchOpen = false;
      },
      error: (error) => {
        console.error('Error loading founders:', error);
        this.toastr.error('Failed to load founders.');
        this.isLoading = false;
      }
    });

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
loadactiveInactiveCount(): void
  {
    this.FounderService.GetTotalFoundersActiveIactive().subscribe({
      next: (response) => {
        this.displayActiveCount = response.data.totalActive;
        this.displayInactiveCount = response.data.totalInactive;
      },
      error: (error) => {
        console.error('Error loading active/inactive counts:', error);
        this.toastr.error('Failed to load active/inactive counts.');
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
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
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
    setFilter(filter: string, status:number): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.searchData.status=status;
    this.loadData();
  }
 

  toggleAdvancedSearch(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
  }

  
  applyAdvancedSearch(): void {
    this.loadData();
  }

  clearAdvancedSearch(): void {
  this.searchData.Gender=null;
  this.searchData.status=0;
  this.searchData.GovernmentId=0;
  this.loadData();
  }
    openActivateDeactivateModal(id:number,entity: any, action: 'deactivate' | 'activate'|'delete',status:number): void {

    this.entityToModify = entity;
    this.modifyAction = action;
    this.entityIdToChangeStatus=id;
    this.StatusChangedTo=status;
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
     var res3= this.FounderService.ChangeFounderStatus(this.entityIdToChangeStatus,this.StatusChangedTo).subscribe({
      next:(response)=>{
       if(response.isSuccess){
        this.toastr.success(response.message,"Success");
        this.loadData();
        this.loadactiveInactiveCount();
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
    onSearchClear(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value === '') {
   
      this.searchData.SearchInput = '';
      this.searchData.PageNumber=1;
      this.loadData();
      
    }
  }
    getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }
  openModal(item:Founder): void {
      this.isModalOpen = true;
      this.modalMode = 'view';
      this.selectedEntity = item;
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
    
  
    openAddModal(): void {
      this.isModalOpen = true;
      this.modalMode = 'view';
      this.selectedEntity = null;
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
  
    closeModal(): void {
      this.isModalOpen = false;
      setTimeout(() => {

        this.modalMode = 'view';
        this.selectedEntity = null;
      }, 300); 
    }
     SendNotificationModal(item: Founder): void {
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
 onGovernorateChange(governorateId: number): void {
    this.selectedCity = ''; 
    this.cities = [];
    
    if (governorateId>0) {
      
      this.loadCities(governorateId);
      this.searchData.GovernmentId = governorateId;
    } else {
      this.searchData.GovernmentId = 0;
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

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }
    
}