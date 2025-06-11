import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddByDocumentComponent } from './add-by-document/add-by-document.component';
import { AddByFormComponent } from './add-by-form/add-by-form.component';
import { trigger, transition, style, animate } from '@angular/animations';

interface ReviewResult {
  isAccepted: boolean;
  message: string;
  standards?: string[];
}

@Component({
  selector: 'app-add-idea',
  imports: [CommonModule, AddByDocumentComponent, AddByFormComponent],
  templateUrl: './add-idea.component.html',
  styleUrl: './add-idea.component.css',
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
export class AddIdeaComponent {
  activeTab: 'document' | 'form' = 'form';
  
  // Loading overlay properties
  isLoading = false;
  loadingMessage = 'Analyzing your business idea...';
  
  // Result modal properties
  showResultModal = false;
  reviewResult: ReviewResult | null = null;

  // Loading messages to cycle through
  private loadingMessages = [
    'Analyzing your business idea...',
    'Checking market viability...',
    'Evaluating innovation potential...',
    'Assessing financial projections...',
    'Reviewing competition analysis...',
    'Finalizing AI review...'
  ];

  switchTab(tab: 'document' | 'form'): void {
    this.activeTab = tab;
  }

  startAIReview(): void {
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
      this.simulateAIReview();
    }, reviewTime);
  }

  private simulateAIReview(): void {
    // 50% chance of acceptance, 50% chance of rejection for simulation
    const isAccepted = Math.random() > 0.5;
    
    if (isAccepted) {
      this.reviewResult = {
        isAccepted: true,
        message: 'Congratulations! Your business idea meets our standards and has been submitted for review by our investment team. You will receive updates on the evaluation progress.'
      };
    } else {
      // Random rejection reasons
      const rejectionStandards = [
        'Market research lacks sufficient depth and competitor analysis',
        'Financial projections are unrealistic or missing key assumptions',
        'Business model does not demonstrate clear revenue streams',
        'Innovation factor is insufficient compared to existing solutions',
        'Target market size is too narrow for sustainable growth',
        'Technical feasibility concerns regarding implementation',
        'Risk assessment and mitigation strategies are inadequate'
      ];
      
      // Select 2-4 random standards that weren't met
      const selectedStandards = rejectionStandards
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 2);
      
      this.reviewResult = {
        isAccepted: false,
        message: 'Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal.',
        standards: selectedStandards
      };
    }
    
    this.showResultModal = true;
  }

  closeModal(): void {
    this.showResultModal = false;
    this.reviewResult = null;
  }

  saveAsDraft(): void {
    // Simulate saving as draft
    console.log('Saving idea as draft...');
    this.closeModal();
    // Here you would typically call a service to save the draft
  }
} 