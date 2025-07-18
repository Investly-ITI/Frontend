import { Component, Input, OnInit, OnChanges, HostListener, output, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { StandardAiResult } from '../../../_models/aiIdeaEvaluationResult';
import { IdeaService } from '../../_services/idea.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface ContactRequest {
  id: string;
  investorName: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface Idea {
  id: number;
  founderId:number;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'declined' | 'rejected-drafted'|'inactive';
  stage: string;
  submittedDate: string;
  government: string;
  city: string;
  fundingGoal?: string;
  declineReason?: string;
  formData?: any;
  AiRate?:number;
  documentFiles?: string[];
  contactRequests?: ContactRequest[];
  rejectionData?: {
    message: string;
    standards: StandardAiResult[];
  };
}

interface ReviewResult {
  isAccepted: boolean;
  generalFeedback: string,
  message: string;
  totalWeightScore: number;
  allStandards?: StandardReview[];
  rejectedStandards?: StandardReview[];
}

interface StandardReview {
  standardCategoryId: number,
  standard: string;
  weight: number;
  achievmentScore: number;
  weightContribution: number;
  feedback: string;
}

@Component({
  selector: 'app-my-ideas',
  imports: [CommonModule, FormsModule, EditIdeaComponent],
  templateUrl: './my-ideas.component.html',
  styleUrl: './my-ideas.component.css',
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
export class MyIdeasComponent implements OnInit, OnChanges {
  @Input() ideas: Idea[] = [];
  @Output() refresh = new EventEmitter<any>();
  @Output() addIdea = new EventEmitter<void>();
  
  // Filter properties
  selectedStatus: string = 'all';
  filteredIdeas: Idea[] = [];

  // Modal properties
  showDeclineModal: boolean = false;
  isClosingModal: boolean = false;
  selectedDeclineReason: string = '';
  
  // Delete confirmation modal properties
  showDeleteModal: boolean = false;
  isClosingDeleteModal: boolean = false;
  ideaToDelete: Idea | null = null;
  
  // Submit confirmation modal properties
  showSubmitModal: boolean = false;
  isClosingSubmitModal: boolean = false;
  ideaToSubmit: Idea | null = null;
  
  // Edit view properties
  showEditView: boolean = false;
  editingIdea: Idea | null = null;
  
  // Contact requests modal properties
  showContactRequestsModal: boolean = false;
  isClosingContactRequestsModal: boolean = false;
  selectedIdeaForContacts: Idea | null = null;
  
  // Dropdown management properties
  openDropdownId: string | null = null;

  // AI Review properties
  isLoading = false;
  loadingMessage = 'Analyzing your business idea...';
  showResultModal = false;
  reviewResult: ReviewResult | null = null;
  currentAction: 'submit' | 'edit' | 'submit-draft' | 'show-rejection' | null = null;
  unsubscribe: any[] = []; // For unsubscribing from observables if needed
  
  // Loading messages to cycle through
  private loadingMessages = [
    'Analyzing your business idea...',
    'Checking market viability...',
    'Evaluating innovation potential...',
    'Assessing financial projections...',
    'Reviewing competition analysis...',
    'Finalizing AI review...'
  ];

  statusOptions = [
    { value: 'all', label: 'All Ideas', icon: 'bx-list-ul' },
    { value: 'approved', label: 'Approved', icon: 'bx-check-circle' },
    { value: 'submitted', label: 'Under Review', icon: 'bx-time' },
    { value: 'draft', label: 'Draft', icon: 'bx-edit' },
    { value: 'declined', label: 'Declined', icon: 'bx-x-circle' },
    { value: 'rejected-drafted', label: 'Rejected - Drafted', icon: 'bx-error-circle' },
    {value: 'inactive', label: 'Inactive', icon: 'bx-x-circle' }
  ];


 constructor(private ideaService:IdeaService, private toastr:ToastrService, private router: Router){}

  ngOnInit(): void {
    this.filterIdeas();
  }

  ngOnChanges(): void {
    this.filterIdeas();
  }

  onStatusFilterChange(): void {
    this.filterIdeas();
  }

  filterIdeas(): void {
    if (this.selectedStatus === 'all') {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter(idea => idea.status === this.selectedStatus);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'draft': return 'status-draft';
      case 'submitted': return 'status-submitted';
      case 'declined': return 'status-declined';
      case 'rejected-drafted': return 'status-rejected-drafted';
      case 'inactive': return 'status-declined';
      default: return 'status-draft';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved': return 'bx-check-circle';
      case 'draft': return 'bx-edit';
      case 'submitted': return 'bx-time';
      case 'declined': return 'bx-x-circle';
      case 'rejected-drafted': return 'bx-error-circle';
      default: return 'bx-edit';
    }
  }

  canEdit(idea: Idea): boolean {
    return idea.status === 'draft' || idea.status === 'declined' || idea.status === 'rejected-drafted';
  }

  canDelete(idea: Idea): boolean {
    return idea.status === 'draft';
  }

  getStatusCount(status: string): number {
    if (status === 'all') {
      return this.ideas.length;
    }
    return this.ideas.filter(idea => idea.status === status).length;
  }

  getSelectedStatusLabel(): string {
    const option = this.statusOptions.find(opt => opt.value === this.selectedStatus);
    return option ? option.label : 'Ideas';
  }

  onViewDetails(idea: Idea): void {
    this.router.navigate(['/idea', idea.id]);
  }

  onEditIdea(idea: Idea): void {
    this.editingIdea = idea;
    this.showEditView = true;
  }

  onDeleteIdea(idea: Idea): void {
    this.ideaToDelete = idea;
    this.showDeleteModal = true;
  }

  onShowDeclineReason(idea: Idea): void {
    this.selectedDeclineReason = idea.declineReason || 'No decline reason provided.';
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

  onShowDeleteConfirmation(idea: Idea): void {
    this.ideaToDelete = idea;
    this.showDeleteModal = true;
  }

  onCloseDeleteModal(): void {
    this.isClosingDeleteModal = true;
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.showDeleteModal = false;
      this.isClosingDeleteModal = false;
      this.ideaToDelete = null;
    }, 300); // Match animation duration
  }

  onConfirmDelete(): void {
    if (this.ideaToDelete) {
      // Remove the idea from the array
      const index = this.ideas.findIndex(idea => idea.id === this.ideaToDelete!.id);
      if (index !== -1) {
        this.ideas.splice(index, 1);
        this.filterIdeas(); // Refresh filtered list
        var sub= this.ideaService.DeleteIdea(this.ideaToDelete.id).subscribe({
           next:(response)=>{
             if(response.isSuccess){
              this.toastr.success(response.message,'success');
              this.refresh.emit();
             }else{
              this.toastr.error(response.message,'error');
             }
           },error:(err)=>{
               this.toastr.error(err.error.message,'error');
           }
        })
        this.unsubscribe.push(sub);
      }

    }
    
    this.onCloseDeleteModal();
  }

  onSubmitIdea(idea: Idea): void {
    this.ideaToSubmit = idea;
    this.showSubmitModal = true;
  }

  onCloseSubmitModal(): void {
    this.isClosingSubmitModal = true;
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.showSubmitModal = false;
      this.isClosingSubmitModal = false;
      this.ideaToSubmit = null;
    }, 300); // Match animation duration
  }

  onConfirmSubmit(): void {
    if (this.ideaToSubmit) {
      this.onCloseSubmitModal();
      this.startAIReview('submit-draft', this.ideaToSubmit);
    }
  }

  onCloseEditView(): void {
    this.showEditView = false;
    this.editingIdea = null;
    this.refresh.emit();

  }

  onEditSaveStarted(): void {
    // Close edit view before starting AI review\
    this.router.navigate(['/profile'], {
  queryParams: { section: 'ideas', tab: 'myIdeas' }
});
    this.onCloseEditView();
  }

  onSaveIdeaChanges(updatedIdea: Idea): void {
    this.startAIReview('edit', updatedIdea);
  }

  // Contact requests modal methods
  onShowContactRequests(idea: Idea): void {
    this.selectedIdeaForContacts = idea;
    this.showContactRequestsModal = true;
    this.isClosingContactRequestsModal = false;
  }

  onCloseContactRequestsModal(): void {
    this.isClosingContactRequestsModal = true;
    
    setTimeout(() => {
      this.showContactRequestsModal = false;
      this.isClosingContactRequestsModal = false;
      this.selectedIdeaForContacts = null;
    }, 200);
  }

  getContactRequestsCount(idea: Idea): number {
    console.log(idea.contactRequests?.length);
    return (idea.contactRequests?.length || 0);
  }

  getPendingContactRequestsCount(idea: Idea): number {
    return idea.contactRequests?.filter(request => request.status === 'pending').length || 0;
  }
  
  // Dropdown management methods
  isDropdownOpen(ideaId: string): boolean {
    return this.openDropdownId === ideaId;
  }
  
  toggleDropdown(ideaId: string): void {
    if (this.openDropdownId === ideaId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = ideaId;
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

  startAIReview(action: 'submit' | 'edit' | 'submit-draft', idea: Idea): void {
    this.currentAction = action;
    this.isLoading = true;
    this.showResultModal = false;
    let messageIndex = 0;
    
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % this.loadingMessages.length;
      this.loadingMessage = this.loadingMessages[messageIndex];
    }, 2000);

    // Simulate AI review process (3-6 seconds)
    const reviewTime = Math.random() * 3000 + 3000; // 3-6 seconds
    
    setTimeout(() => {
      clearInterval(messageInterval);
      this.isLoading = false;
     // this.simulateAIReview(action, idea);
    }, reviewTime);
  }

  // private simulateAIReview(action: 'submit' | 'edit' | 'submit-draft', idea: Idea): void {
  //   // 50% chance of acceptance, 50% chance of rejection for simulation
  //   const isAccepted = Math.random() > 0.5;
    
  //   if (isAccepted) {
  //     // Apply changes if accepted
  //     if (action === 'submit' || action === 'submit-draft') {
  //       const index = this.ideas.findIndex(i => i.id === idea.id);
  //       if (index !== -1) {
  //         this.ideas[index].status = 'submitted';
  //         this.filterIdeas();
  //       }
  //       this.reviewResult = {
  //         isAccepted: true,
  //         message: 'Congratulations! Your business idea meets our standards and has been submitted for review by our investment team. You will receive updates on the evaluation progress.'
  //       };
  //     } else {
  //       // Update idea changes
  //       const index = this.ideas.findIndex(i => i.id === idea.id);
  //       if (index !== -1) {
  //         this.ideas[index] = idea;
  //         this.filterIdeas();
  //       }
  //       this.reviewResult = {
  //         isAccepted: true,
  //         message: 'Great! Your idea changes have been saved successfully and meet our quality standards. The updated information is now available.'
  //       };
  //     }
  //   } else {
  //     // Random rejection reasons
  //     const rejectionStandards = [
  //       'Market research lacks sufficient depth and competitor analysis',
  //       'Financial projections are unrealistic or missing key assumptions',
  //       'Business model does not demonstrate clear revenue streams',
  //       'Innovation factor is insufficient compared to existing solutions',
  //       'Target market size is too narrow for sustainable growth',
  //       'Technical feasibility concerns regarding implementation',
  //       'Risk assessment and mitigation strategies are inadequate'
  //     ];
      
  //     // Select 2-4 random standards that weren't met
  //     const selectedStandards = rejectionStandards
  //       .sort(() => 0.5 - Math.random())
  //       .slice(0, Math.floor(Math.random() * 3) + 2);
      
  //     // For draft submissions that are rejected, automatically change status to rejected-drafted
  //     if (action === 'submit-draft') {
  //       const index = this.ideas.findIndex(i => i.id === idea.id);
  //       if (index !== -1) {
  //         this.ideas[index].status = 'rejected-drafted';
  //         this.ideas[index].rejectionData = {
  //           message: 'Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal.',
  //           standards: selectedStandards,
  //           rejectedAt: new Date().toISOString()
  //         };
  //         this.filterIdeas();
  //       }
  //     }
      
  //     this.reviewResult = {
  //       isAccepted: false,
  //       message: (action === 'submit' || action === 'submit-draft')
  //         ? 'Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal.'
  //         : 'Our AI System has reviewed your changes and found that they don\'t meet the required standards. Please review the feedback below and make necessary improvements.',
  //       standards: selectedStandards
  //     };
  //   }
    
  //   this.showResultModal = true;
  // }

  closeModal(): void {
    this.showResultModal = false;
    this.reviewResult = null;
    this.currentAction = null;
  }

  // saveAsDraft(): void {
  //   if (this.currentAction === 'submit' && this.reviewResult && !this.reviewResult.isAccepted) {
  //     // Create a rejected-drafted idea with rejection data (only for new submissions, not draft submissions)
  //     const rejectedIdeaIndex = this.ideas.findIndex(idea => idea.status === 'draft');
  //     if (rejectedIdeaIndex !== -1) {
  //       this.ideas[rejectedIdeaIndex].status = 'rejected-drafted';
  //       this.ideas[rejectedIdeaIndex].rejectionData = {
  //         message: this.reviewResult.message,
  //         standards: this.reviewResult.standards || [],
  //         rejectedAt: new Date().toISOString()
  //       };
  //       this.filterIdeas(); // Update filtered list to reflect status change
  //     }
  //   }
  //   this.closeModal();
  // }



 onShowRejectionDetails(idea: Idea): void {
  if (idea.rejectionData) {
    var allStandards: StandardReview[] = idea.rejectionData.standards.map((item: StandardAiResult) => {
      return {
        standardCategoryId: item.standardCategoryId,
        standard: item.name,
        weight: item.weight,
        achievmentScore: item.achievementScore,
        weightContribution: item.weightedContribution,
        feedback: item.feedback
      }
    });
    this.reviewResult = {
      isAccepted: false,
      totalWeightScore: parseInt(idea.AiRate !== undefined ? idea.AiRate.toString() : '0') ?? 0,
      generalFeedback: idea.rejectionData.message,
      allStandards: allStandards,
      rejectedStandards: allStandards.filter(s => s.weightContribution < (s.weight * .5)),
      message: parseInt(idea.AiRate !== undefined ? idea.AiRate.toString() : '0') ?? 0 ? "Congratulations! Your business idea meets our standards" :
        "Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal."
    };
  }
  this.showResultModal = true;
  this.currentAction = 'show-rejection';
  console.log(this.reviewResult);
}

  continueEditing(): void {
    // For edit scenarios - reopen the edit view
    if (this.editingIdea) {
      this.showEditView = true;
    }
    this.closeModal();
  }

  onAddFirstIdea(): void {
    this.addIdea.emit();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
} 