import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { Subscription } from 'rxjs';
import { notification, notificationSearch } from '../../_models/notification';
import { NotificationService } from '../_services/notification.service';
import { NotificationService as SharedNotificationService} from '../../_services/notification.service';
import { DarkModeService } from '../_services/dark-mode.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationsStatus, Status, UserType } from '../../_shared/enums';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notifications',
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
    ViewDetailsComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit,OnDestroy{

 isDarkMode: boolean = true;
  isLoading: boolean = false;
isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [false]; 
  animationComplete: boolean = true;
  isAdvancedSearchOpen: boolean = false; 
  currentFilter:string='';
 private darkModeSubscription: Subscription = new Subscription();
   isModalOpen: boolean = false;
  isEditMode: boolean = false;
  modalMode: 'add' | 'view' = 'view';
  selectedEntity: any = null;
 isActivateDeactivateModalOpen: boolean = false;
  entityToModify: any = null; 
  modifyAction: 'activate' | 'delete' = 'activate'; 
  entityIdToChangeStatus:number=0;
  StatusChangedTo:number=0;
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
     searchData: notificationSearch = {
    PageNumber: 1,
    PageSize: 5,
    SearchInput: '',
    UserTypeFrom: 0,
    UserTypeTo: 0,
    isRead: null,
    Status: 0 
  }
           pageSize:number=5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;
  selectedSearchType: string = 'name'; 
  searchQuery: string = '';
  entityName: string = 'Notification';
  entityNamePlural: string = 'Notifications';
  loadedListData: notification[] = [];
      Status = NotificationsStatus;
      userType = UserType;
        displayActiveCount: number = 0;
  displayDeletedCount: number = 0;
      
 constructor(private notficationService:NotificationService,  private darkModeService: DarkModeService,
       private toastr: ToastrService,private router:ActivatedRoute,private SharedNotificationService:SharedNotificationService) { }
  ngOnInit(): void {
      this.router.queryParams.subscribe(params => {
    if (params['UserTypeTo']) {
      this.searchData.UserTypeTo = this.userType.Staff; 
      this.searchData.isRead=0;
    
 this.SharedNotificationService.markAllAsRead().subscribe({
      next: () => {
        this.SharedNotificationService.setUnreadCount(0);
      
      },
      error: () => {
        this.SharedNotificationService.setUnreadCount(0);
       
      }
    });
    }
    this.loadData(); // now it will load filtered by staff
    this.loadactiveDeletedCount();
  });
    this.loadData();
  this.loadactiveDeletedCount();
    
     
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
  this.notficationService.getNotifications(this.searchData).subscribe({
    next: (response) => {
      console.log('Response:', response);
      this.loadedListData = response.data.notifications;
      console.log('loadedListData:', this.loadedListData);
      this.totalCount = response.data.totalCount;
      this.isLoading = false;
      this.currentPage = response.data.currentPage;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      this.showNoResults = response.data.totalCount === 0 ? true : false;
      console.log('result:', this.showNoResults);
      this.dropdownStates = new Array(this.loadedListData.length).fill(false);
      this.isAdvancedSearchOpen = false;
    
    },
    error: (error) => {
      console.error('Error loading notifications:', error);
      this.toastr.error('Failed to load notifications.');
      this.isLoading = false;
    }
  });

}
loadactiveDeletedCount(): void
  {
    this.notficationService.GetTotalNotificationsActiveDeleted().subscribe({
      next: (response) => {
        this.displayActiveCount = response.data.totalActive;
        this.displayDeletedCount = response.data.totalDeleted;
      },
      error: (error) => {
        console.error('Error loading active/deleted counts:', error);
        this.toastr.error('Failed to load active/delted counts.');
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
    setFilter(filter: string, status: number): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.searchData.Status = status;
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
  this.searchData.UserTypeFrom=0;
    this.searchData.UserTypeTo=0;
  this.searchData.Status=0;
  this.searchData.isRead=null;
  this.loadData();
  }
    openActivateDeleteModal(id: number, entity: any, action: 'activate' | 'delete', status: number): void {

    this.entityToModify = entity; 
    this.modifyAction = action;
    this.entityIdToChangeStatus=id;
    this.StatusChangedTo=status;
    this.dropdownStates = this.dropdownStates.map(() => false);
    this.isActivateDeactivateModalOpen = true;
  }
  closeActivateDeleteModal(): void {
    this.isActivateDeactivateModalOpen = false;
    setTimeout(() => {
      this.entityToModify = null;
      this.modifyAction = 'activate';
    }, 300); 

  }
    confirmActivateDelete(): void {
    if (this.entityToModify) {
      
     var res= this.notficationService.ChangeNotificationStatus(this.entityIdToChangeStatus,this.StatusChangedTo).subscribe({
      next:(response)=>{
        console.log(response);
       if(response.isSuccess){
        this.toastr.success(response.message,"Success");
        this.loadData();
        this.loadactiveDeletedCount();
       }else{
        this.toastr.error(response.message,"Error");
       }
         
      },error:(err)=>{
        this.toastr.error(err,"Error");
      }
     })

      this.closeActivateDeleteModal();
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
  openModal(item:notification): void {
      this.isModalOpen = true;
      this.modalMode = 'view';
      this.selectedEntity = item; 
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
  
   
    closeModal(): void {
      this.isModalOpen = false;
      setTimeout(() => {

        this.modalMode = 'view';
        this.selectedEntity = null;
      }, 300); 
    }

 ngOnDestroy(): void {
  this.darkModeSubscription.unsubscribe();
}
}
