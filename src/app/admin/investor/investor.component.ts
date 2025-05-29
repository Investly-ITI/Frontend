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
import { Investor, InvestorSearch } from '../../_models/investor';
import { StatusLabelPipe } from '../../_shared/pipes/enum.pipe';
import { Status } from '../../_shared/enums';
import { ArrayDataSource } from '@angular/cdk/collections';
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
    AddUpdateComponent, // Add this import
  ],
  templateUrl: './investor.component.html',
  styleUrl: './investor.component.css'
})
export class InvestorComponent implements OnInit {

  //* State management (Flags)
  isDarkMode: boolean = false;
  isLoading: boolean = false;
  isLoading2: boolean = true;
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [false]; 
  animationComplete: boolean = true;

  //* Modal state
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  modalMode: 'add' | 'view' = 'view';
  selectedEntity: any = null; // Entity data to pass to add-update component

  //* Activate/Deactivate Modal state
  isActivateDeactivateModalOpen: boolean = false;
  entityToModify: any = null; // Store the entity being modified
  modifyAction: 'deactivate' | 'activate' = 'deactivate'; // Track the action type


  //* Profile image
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';

  //* Pagination and filtering
  searchData: InvestorSearch = {
    pageNumber: 1,
    PageSize: 5,
    SearchInput: '',
    governmentId: 0,
    gender: null
  }
  pageSize:number=5;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;

  //* Generic entity configuration
  entityName: string = 'Investor';
  entityNamePlural: string = 'Investors';

  //* Animation states for statistics
  displayActiveCount: number = 0;
  displayInactiveCount: number = 0;

  //*Data
  loadedListData: Investor[] = [];
  Status = Status


  //* Constructor
  constructor(private InvestorService: InvestorService) { }

  ngOnInit(): void {
    this.loadData();
    this.loadActiveInactiveCount();
  }


  loadData() {
    this.searchData.pageNumber=this.currentPage;
    console.log(this.searchData);
    this.isLoading = true;
    this.InvestorService.getpagintedData(this.searchData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.loadedListData = response.data.list;
          this.pageSize=response.data.pageSize;
          this.totalCount=response.data.totalCount;
          this.currentPage=response.data.currentPage;
          this.totalPages=Math.ceil(this.totalCount / this.pageSize);
          this.showNoResults = response.data.list.length === 0 ? true : false;
          this.dropdownStates=new Array(this.loadedListData.length).fill(false);
          console.log(this.showNoResults);
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
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


  //! METHODS:

  //* Toggle dark mode
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  //* Toggle dropdown
  toggleDropdown(index: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    //? Close all other dropdowns first, then toggle the clicked one
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  //* Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');

    if (!dropdown) {
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
  }

  //* Setting filter of search
  // setFilter(filter: string): void {
  //   this.currentFilter = this.currentFilter === filter ? '' : filter;
  // }

  //? MatMenu toggle (It's needed for the MatMenu dropdown but I don't remember what it does)
  hideSingleSelectionIndicator = signal(true);




  //* Modal methods:
  openModal(): void {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.modalMode = 'view';
    this.selectedEntity = { name: 'Ahmed', age: '25', stage: 'intermediate', id: 1 }; // Sample data
    // Close all dropdowns when modal opens
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  openAddModal(): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.modalMode = 'add';
    this.selectedEntity = null;
    // Ensure dropdowns are closed
    this.dropdownStates = this.dropdownStates.map(() => false);
  }

  closeModal(): void {
    this.isModalOpen = false;
    // Delay resetting modal state until after animation completes
    setTimeout(() => {
      this.isEditMode = false;
      this.modalMode = 'view';
      this.selectedEntity = null;
    }, 300); // Match the CSS transition duration
  }

  onSaveEntity(entityData: any): void {
    console.log('Saving entity:', entityData);
    this.closeModal();

  }

  //* Activate/Deactivate Modal methods
  openActivateDeactivateModal(entity: any, action: 'deactivate' | 'activate'): void {

    this.entityToModify = entity;
    this.modifyAction = action;

    // Close all dropdowns when modal opens
    this.dropdownStates = this.dropdownStates.map(() => false);

    this.isActivateDeactivateModalOpen = true;
  }

  closeActivateDeactivateModal(): void {

    this.isActivateDeactivateModalOpen = false;
    // Delay resetting modal state until after animation completes

    setTimeout(() => {
      this.entityToModify = null;
      this.modifyAction = 'deactivate';
    }, 300); // Match the CSS transition duration
  }

  confirmActivateDeactivate(): void {

    if (this.entityToModify) {
      console.log(`${this.modifyAction === 'deactivate' ? 'Deactivating' : 'Activating'} entity:`, this.entityToModify);

      // Add your activate/deactivate logic/service here

      this.closeActivateDeactivateModal();
    }

  }


  //* Animate statistics numbers

  //* Get digits array for flip animation
  getDigitsArray(number: number): string[] {
    return number.toString().split('');
  }

}
