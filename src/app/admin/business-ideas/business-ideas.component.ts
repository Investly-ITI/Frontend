import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { BusinessService } from '../_services/businesses.service'; 
import { BusinessDto, BusinessListDto, BusinessSearchDto, ResponseDto } from '../../_models/businesses';
import { getBusinessIdeaStatusLabel, getStageLabel } from '../../_shared/utils/enum.utils';
import { BusinessIdeaStatus, Stage } from '../../_shared/enums';

import { Observable, catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-ideas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-ideas.component.html',
  styleUrls: ['./business-ideas.component.css']
})
export class BusinessIdeasComponent implements OnInit {

  businessList: BusinessListDto | null = null;
  businessIdeas: BusinessDto[] = [];
  isLoading: boolean = false;
  error: string | null = null;

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

  getBusinessIdeaStatusName = getBusinessIdeaStatusLabel;
  getStageName = getStageLabel;

  public Math = Math;

  isDarkMode: boolean = false; 

  constructor(private businessService: BusinessService) { }

  ngOnInit(): void {
    this.loadBusinessIdeas();

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
          return of(new ResponseDto<BusinessListDto>());
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


  openSoftDeleteModal(businessId: number): void {
    this.selectedIdeaIdForSoftDelete = businessId;
    this.isSoftDeleteModalOpen = true;
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
              Swal.fire('Deleted!', 'Business idea has been soft-deleted.', 'success');
              this.loadBusinessIdeas(); 
              this.closeSoftDeleteModal();
            } else {
              Swal.fire('Error!', res.message || 'Failed to soft-delete business idea.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error!', 'An error occurred while soft-deleting.', 'error');
            console.error('Soft delete error:', err);
          }
        });
    }
  }

  openStatusUpdateModal(businessId: number, currentStatus: BusinessIdeaStatus | undefined): void {
    this.selectedBusinessId = businessId;
    this.newStatus = currentStatus !== undefined ? currentStatus : null;
    this.currentStatusName = currentStatus !== undefined ? this.getBusinessIdeaStatusName(currentStatus) : 'N/A';
    this.isStatusUpdateModalOpen = true;
  }

  closeStatusUpdateModal(): void {
    this.isStatusUpdateModalOpen = false;
    this.selectedBusinessId = null;
    this.newStatus = null;
    this.currentStatusName = null;
  }

  submitStatusUpdate(): void {
    if (this.selectedBusinessId !== null && this.newStatus !== null) {
      this.businessService.updateBusinessStatus(this.selectedBusinessId, this.newStatus)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              Swal.fire('Updated!', 'Business idea status has been updated.', 'success');
              this.closeStatusUpdateModal();
              this.loadBusinessIdeas(); 
            } else {
              Swal.fire('Error!', res.message || 'Failed to update status.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error!', 'An error occurred while updating status.', 'error');
            console.error('Status update error:', err);
          }
        });
    } else {
      Swal.fire('Warning', 'Please select a status.', 'warning');
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

  
}
