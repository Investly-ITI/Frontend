import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../_services/profile.service';
import { InvestorContactItem, UpdateContactRequestStatusDto } from '../../_models/contact-request';
import { ContactRequestStatus ,DesiredInvestmentType,InvestingStages} from '../../_shared/enums';
import { Router } from '@angular/router';



@Component({
  selector: 'app-investor-idea-requests',
  imports: [CommonModule,FormsModule],
  templateUrl: './investor-idea-requests.component.html',
  styleUrl: './investor-idea-requests.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class InvestorIdeaRequestsComponent {
  @Output() onRequestCountChange = new EventEmitter<number>();
  constructor(private toastr:ToastrService,private profileservice:ProfileService,private router:Router) { }

  
  // Filter properties
  filterByStatus :number = 0;
  FilteredRequests: InvestorContactItem[] = [];
  requests: InvestorContactItem[] = [];
  ContactRequestStatus = ContactRequestStatus;
  DesiredInvestmentType=DesiredInvestmentType
InvestingStages=InvestingStages;
  // Modal properties
  showDeclineModal: boolean = false;
  isClosingModal: boolean = false;
  selectedDeclineReason: string = '';
  
  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  isClosingDeleteModal: boolean = false;
  RequestToDelete: UpdateContactRequestStatusDto = { contactRequestId: 0, newStatus: ContactRequestStatus.Deleted };
  showResultModal = false;

  currentAction: 'show-rejection' | null = null;
  
  // Dropdown management properties
  openDropdownId: number | null = null;

  
  isLoading = false;
 showEditView=false;
  
 

  statusOptions = [
    { value: 0, label: 'All Requests', icon: 'bx-list-ul' },
    { value: ContactRequestStatus.Accepted, label: 'Approved', icon: 'bx-check-circle' },
    { value: ContactRequestStatus.Pending, label: 'Pending', icon: 'bx-time' },
    { value: ContactRequestStatus.Declined, label: 'Declined', icon: 'bx-x-circle' },
  ];

  ngOnInit(): void {
    this.LoadContactRequests();
    
  }

  LoadContactRequests(): void
   {
      this.isLoading = true;
     this.profileservice.GetContactRequestsData().subscribe({
        next: (res) => {
        
          if (res.isSuccess ) {
             this.requests= res.data;
             this.filterRequest();
           
          } else {
           this.toastr.error('Failed to load contact requests', 'Error');
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastr.error('Failed to load contact requests', 'Error');
        }
      });
  }

  ngOnChanges(): void {
    this.filterRequest();
    
  }

  onStatusFilterChange(): void {
    this.filterRequest();
  }

  filterRequest(): void {
     if( +this.filterByStatus === 0) {
      this.FilteredRequests = this.requests; 
     }else{
    this.FilteredRequests = this.requests.filter(r => r.status === +this.filterByStatus);
     }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case ContactRequestStatus.Accepted: return 'status-approved';
      case ContactRequestStatus.Pending: return 'status-pending';
      case ContactRequestStatus.Declined: return 'status-declined';

      default: return 'status-pending';
    }
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case ContactRequestStatus.Accepted: return 'bx-check-circle';
      case ContactRequestStatus.Pending: return 'bx-time';
      case ContactRequestStatus.Declined: return 'bx-x-circle';
      default: return 'bx-time';
    }
  }

 

  canDelete(request: InvestorContactItem): boolean {
    return request.status === ContactRequestStatus.Pending ;
  }

  getStatusCount(status: number): number {
  
    if (status === 0) {
      return this.requests.length;
    }
    return this.requests.filter(r => r.status === status).length;



  }

  getSelectedStatusLabel(): string {
   const option = this.statusOptions.find(opt => opt.value === this.filterByStatus);
    return option ? option.label : 'All Requests';
   
  }

 


  onDeleteIdea(request: InvestorContactItem): void {
    this.RequestToDelete.contactRequestId = request.id;
    this.RequestToDelete.newStatus = ContactRequestStatus.Deleted;
    this.showDeleteModal = true;
  }

  onShowDeclineReason(request: InvestorContactItem): void {
    this.selectedDeclineReason = request.declineReason || 'No decline reason provided.';
    this.showDeclineModal = true;
  }

  onCloseDeclineModal(): void {
    this.isClosingModal = true;
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.showDeclineModal = false;
      this.isClosingModal = false;
      this.selectedDeclineReason = '';
    }, 300); // Match animation duration
  }

  onShowDeleteConfirmation(request: InvestorContactItem): void {
   this.RequestToDelete.contactRequestId = request.id;
    this.RequestToDelete.newStatus = ContactRequestStatus.Deleted;
    this.showDeleteModal = true;
  }

  onCloseDeleteModal(): void {
    this.isClosingDeleteModal = true;
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.showDeleteModal = false;
      this.isClosingDeleteModal = false;
      this.RequestToDelete = { contactRequestId: 0, newStatus: ContactRequestStatus.Deleted };
    }, 300); // Match animation duration
  }


  onConfirmDelete(): void {
    this.isLoading = true;
    this.profileservice.ChangeContactRequestsStatus(this.RequestToDelete).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
         
       this.toastr.success('Contact request deleted successfully', 'Success');
       this.filterByStatus = 0; 
       this.profileservice.GetContactRequestsData().subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.requests = res.data;
              this.filterRequest();
              this.onRequestCountChange.emit(this.requests.length);

            }
          },
          error: () => {
            this.toastr.error('Failed to refresh request list');
          }
        });
        
        
        } else {
          this.toastr.error('Failed to delete contact request', 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to delete contact request', 'Error');
      }
    });
    this.onCloseDeleteModal();
  }

 onViewDetails(requestid: number): void 
 {
     
  this.router.navigate(['/idea', requestid]);
  }


  // Dropdown management methods
  isDropdownOpen(requestId: number): boolean {
    return this.openDropdownId === requestId;
  }
  
  toggleDropdown(requestId: number): void {
    if (this.openDropdownId === requestId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = requestId;
    }
  }
  
  closeDropdown(): void {
    this.openDropdownId = null;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-dropdown')) {
      this.openDropdownId = null;
    }
  }

  
  onShowRejectionDetails(request:InvestorContactItem): void {
    if (request.status === ContactRequestStatus.Declined ) {
    
   this.selectedDeclineReason = request.declineReason || 'No reason provided',
    
      
      this.showDeclineModal = true;
      this.currentAction = 'show-rejection';
      
    }
  }

  
}
