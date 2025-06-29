import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddByDocumentComponent } from './add-by-document/add-by-document.component';
import { AddByFormComponent } from './add-by-form/add-by-form.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IdeaService } from '../../_services/idea.service';
import { AiIdeaEvaluationResult } from '../../../_models/aiIdeaEvaluationResult';

interface ReviewResult {
  isAccepted: boolean;
  message: string;
  totalWeightScore: number;
  allStandards?: StandardReview[];
  rejectedStandards?: StandardReview[];
}
interface StandardReview {
  standard: string;
  weight: number;
  achievmentScore: number;
  weightContribuation: number;
  feedback: string;
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

  constructor(private AddIdeaService: IdeaService, private ToastrService: ToastrService) { }
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


  private unsubscribe: Subscription[] = [];
  switchTab(tab: 'document' | 'form'): void {
    this.activeTab = tab;
  }

  startAIReview(formPayload: any): void {
    this.isLoading = true;
    this.showResultModal = false;
    //let messageIndex = 0;

    // Cycle through loading messages
    // const messageInterval = setInterval(() => {
    //   messageIndex = (messageIndex + 1) % this.loadingMessages.length;
    //   this.loadingMessage = this.loadingMessages[messageIndex];
    // }, 2000);



    var res = this.AddIdeaService.Evaluate(formPayload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // this.ToastrService.success(response.message, 'Success');
          this.isLoading = false;
          this.AIReview(response.data);


        } else {
          this.ToastrService.error(response.message, "Error");

        }
      }, error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
        this.ToastrService.error(errorMsg, 'Error');
        this.isLoading = false;
      }
    })
    this.unsubscribe.push(res);
  }

  private AIReview(aiResponse: AiIdeaEvaluationResult): void {
    const result = this.ParseStandaredFromAiResponse(aiResponse);
    this.reviewResult = result;
    this.showResultModal = true;
    console.log(this.reviewResult);
  }


  private getAiTotalRate(response: AiIdeaEvaluationResult): number {
   return response.totalWeightedScore;

  }

  private ParseStandaredFromAiResponse(response: AiIdeaEvaluationResult): ReviewResult {
    var standards: StandardReview[] = [];
    var result: ReviewResult | null = null;
   
    var totalWeightScore = this.getAiTotalRate(response);
    response.standards?.map(s=>{
      standards.push({
        standard:s.name,
        weight:s.weight,
        weightContribuation:s.weightedContribution,
        feedback:s.feedback,
        achievmentScore:s.achievementScore
      })
    })

    result = {
      isAccepted: totalWeightScore > 50,
      totalWeightScore: totalWeightScore,
      allStandards: standards,
      rejectedStandards: standards.filter(s => s.weightContribuation < (s.weight * .5)),
      message: totalWeightScore>50  ? "Congratulations! Your business idea meets our standards":
        "Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal."
    };

    return result;

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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
} 