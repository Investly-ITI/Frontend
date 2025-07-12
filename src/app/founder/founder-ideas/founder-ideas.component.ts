import { Component, Input, Output, EventEmitter, OnInit, IterableDiffers } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MyIdeasComponent } from './my-ideas/my-ideas.component';
import { AddIdeaComponent } from './add-idea/add-idea.component';
import { Subscription } from 'rxjs';
import { IdeaService } from '../_services/idea.service';
import { getStageLabel } from '../../_shared/utils/enum.utils';
import { BusinessIdeaStatus, ContactRequestStatus, DesiredInvestmentType } from '../../_shared/enums';
import { StandardAiResult } from '../../_models/aiIdeaEvaluationResult';
import { BusinessDto } from '../../_models/businesses';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

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
  status: 'draft' | 'submitted' | 'approved' | 'declined' | 'rejected-drafted';
  stage: string;
  submittedDate: string;
  government: string;
  city: string;
  fundingGoal?: string;
  declineReason?: string;
  formData?: any;
  documentFiles?: string[];
  AiRate?:number,
  contactRequests?: ContactRequest[];
  rejectionData?: {
    message: string;
    standards: StandardAiResult[];
  };
}

@Component({
  selector: 'app-founder-ideas',
  imports: [
    CommonModule,
    MyIdeasComponent,
    AddIdeaComponent
  ],
  templateUrl: './founder-ideas.component.html',
  styleUrl: './founder-ideas.component.css'
})
export class FounderIdeasComponent implements OnInit {
  @Input() ideas: Idea[] = [];
  @Output() ideasChange = new EventEmitter<Idea[]>();
  @Output() ideasCountChange = new EventEmitter<number>();

  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  activeTab: 'myIdeas' | 'addIdea' = 'myIdeas';
  apiUrl=environment.apiUrl;
  //loading = true;

  constructor(private ideaService: IdeaService, private route:ActivatedRoute) { }

  // Sample data for testing
  // sampleIdeas: Idea[] = [
  //   {
  //     id: '1',
  //     title: 'Smart Agriculture Platform',
  //     description: 'IoT-based platform for optimizing crop yields and water usage',
  //     category: 'Technology',
  //     status: 'approved',
  //     stage: 'Startup',
  //     submittedDate: '2024-01-10',
  //     government: 'Cairo',
  //     city: 'Nasr City',
  //     fundingGoal: '500000',
  //     submissionType: 'form',
  //     contactRequests: [
  //       {
  //         id: '1',
  //         investorName: 'Ahmed Hassan',
  //         requestDate: '2024-03-01',
  //         status: 'pending'
  //       },
  //       {
  //         id: '2',
  //         investorName: 'Sarah Mohamed',
  //         requestDate: '2024-02-28',
  //         status: 'accepted'
  //       },
  //       {
  //         id: '3',
  //         investorName: 'Omar El-Rashid',
  //         requestDate: '2024-02-25',
  //         status: 'pending'
  //       }
  //     ],
  //     formData: {
  //       title: 'Smart Agriculture Platform',
  //       category: 'Technology',
  //       stage: 'Startup',
  //       investmentType: 'Both',
  //       fundingGoal: '500000',
  //       location: 'Nasr City, Cairo',
  //       images: ['smart-agriculture-demo.jpg', 'iot-sensors.jpg'],
  //       techStack: 'IoT sensors, React, Node.js',
  //       targetMarket: 'Small to medium farms',
  //       problemSolving: 'Optimizing water usage and monitoring crop conditions',
  //       competitiveAdvantage: 'Real-time IoT monitoring with AI predictions',
  //       scalability: 'Expand to different crop types and regions'
  //     }
  //   },
  //   {
  //     id: '2',
  //     title: 'EcoDelivery Service',
  //     description: 'Electric vehicle delivery service for sustainable logistics',
  //     category: 'E-commerce',
  //     status: 'submitted',
  //     stage: 'Intermediate',
  //     submittedDate: '2024-02-05',
  //     government: 'Alexandria',
  //     city: 'Roushdy',
  //     fundingGoal: '750000',
  //     submissionType: 'document',
  //     documentFiles: ['business-plan.pdf'],
  //     formData: {
  //       investmentType: 'Funding',
  //       location: 'Roushdy, Alexandria',
  //       images: ['eco-delivery-fleet.jpg']
  //     }
  //   },
  //   {
  //     id: '3',
  //     title: 'EdTech Learning Platform',
  //     description: 'AI-powered personalized learning platform for students',
  //     category: 'Education',
  //     status: 'declined',
  //     stage: 'Ideation',
  //     submittedDate: '2024-02-20',
  //     government: 'Giza',
  //     city: 'Dokki',
  //     fundingGoal: '300000',
  //     submissionType: 'form',
  //     declineReason: 'The market analysis was insufficient and the monetization strategy was not clear. Please provide more detailed financial projections and competitive analysis.',
  //     formData: {
  //       title: 'EdTech Learning Platform',
  //       category: 'Education',
  //       stage: 'Ideation',
  //       investmentType: 'Both',
  //       fundingGoal: '300000',
  //       location: 'Dokki, Giza',
  //       images: ['edtech-platform-ui.jpg', 'student-dashboard.jpg'],
  //       educationLevel: 'K-12',
  //       subjectArea: 'Mathematics and Science',
  //       learningMethod: 'AI-powered adaptive learning',
  //       assessmentStrategy: 'Real-time progress tracking',
  //       institutionPartnerships: 'Local schools and educational centers'
  //     }
  //   },
  //   {
  //     id: '4',
  //     title: 'FinTech Mobile App',
  //     description: 'Digital banking solution for small businesses with expense tracking and automated bookkeeping',
  //     category: 'Financial Technology',
  //     status: 'draft',
  //     stage: 'Startup',
  //     submittedDate: '2024-03-01',
  //     government: 'Cairo',
  //     city: 'New Cairo',
  //     fundingGoal: '800000',
  //     submissionType: 'form',
  //     formData: {
  //       title: 'FinTech Mobile App',
  //       category: 'Financial Technology',
  //       stage: 'Startup',
  //       investmentType: 'Funding',
  //       fundingGoal: '800000',
  //       location: 'New Cairo, Cairo',
  //       images: ['fintech-app-mockup.jpg', 'dashboard-screenshot.jpg'],
  //       techStack: 'React Native, Node.js, PostgreSQL',
  //       targetMarket: 'Small and medium businesses',
  //       problemSolving: 'Simplifying financial management for businesses',
  //       competitiveAdvantage: 'AI-powered expense categorization and insights',
  //       scalability: 'Expand to enterprise solutions and international markets'
  //     }
  //   },
  //   {
  //     id: '5',
  //     title: 'Healthcare Mentorship Network',
  //     description: 'Platform connecting healthcare startups with experienced industry mentors for guidance and expertise',
  //     category: 'Healthcare',
  //     status: 'draft',
  //     stage: 'Ideation',
  //     submittedDate: '2024-03-05',
  //     government: 'Giza',
  //     city: 'Giza',
  //     submissionType: 'document',
  //     documentFiles: ['healthcare-mentorship-proposal.pdf'],
  //     formData: {
  //       title: 'Healthcare Mentorship Network',
  //       category: 'Healthcare',
  //       stage: 'Ideation',
  //       investmentType: 'Industrial Experience',
  //       location: 'Giza, Giza',
  //       images: ['healthcare-network-diagram.jpg'],
  //       medicalSpecialty: 'General Healthcare Innovation',
  //       targetPatients: 'Healthcare startups and entrepreneurs',
  //       regulatoryCompliance: 'Focus on mentorship and knowledge sharing, no direct patient care',
  //       clinicalValidation: 'Validation through mentor expertise and startup success metrics',
  //       healthcarePartners: 'Leading hospitals, healthcare accelerators, and industry experts'
  //     }
  //   },
  //   {
  //     id: '6',
  //     title: 'Social Media Analytics Tool',
  //     description: 'AI-powered analytics platform for social media marketing optimization',
  //     category: 'Technology',
  //     status: 'rejected-drafted',
  //     stage: 'Startup',
  //     submittedDate: '2024-03-02',
  //     government: 'Cairo',
  //     city: 'Maadi',
  //     fundingGoal: '400000',
  //     submissionType: 'form',
  //     rejectionData: {
  //       message: 'Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal.',
  //       standards: [
  //         'Market analysis lacks comprehensive competitor research and differentiation strategy',
  //         'Financial projections are unrealistic and don\'t account for customer acquisition costs',
  //         'Technology implementation plan is vague and lacks technical feasibility assessment',
  //         'Business model doesn\'t clearly address monetization strategy and revenue streams'
  //       ],
  //       rejectedAt: '2024-03-02T14:30:00.000Z'
  //     },
  //     formData: {
  //       title: 'Social Media Analytics Tool',
  //       category: 'Technology',
  //       stage: 'Startup',
  //       investmentType: 'Both',
  //       fundingGoal: '400000',
  //       location: 'Maadi, Cairo',
  //       images: ['analytics-dashboard.jpg', 'social-media-insights.jpg'],
  //       techStack: 'Python, React, MongoDB, TensorFlow',
  //       targetMarket: 'Small to medium marketing agencies',
  //       problemSolving: 'Providing insights from social media data for better marketing decisions',
  //       competitiveAdvantage: 'AI-powered sentiment analysis and trend prediction',
  //       scalability: 'Expand to enterprise clients and add more social platforms'
  //     }
  //   }
  // ];


  
  getInvestmentTypeName(type: number): string {
    switch (type) {
      case DesiredInvestmentType.IndustrialExperience: return 'Industrial Experience';
      case DesiredInvestmentType.Funding: return 'Funding';
      case DesiredInvestmentType.Both: return 'Both';
      default: return 'Industrial Experience';
    }
  }
  ngOnInit(): void {
    var sub = this.ideaService.GetAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          //this.loading = false;
          const ideasArr: Idea[] = response.data.map((item: BusinessDto) => {
            let status = '';
            if(item.status==BusinessIdeaStatus.Inactive){
              status = 'inactive';
            }
            else if (item.isDrafted && item.airate == null) {
              status = 'draft';
            } else if (item.isDrafted && item.airate!=null && item.airate > 50) {
              status = 'draft';
            } else if (item.isDrafted && item.airate!=null && item.airate < 50) {
              status = 'rejected-drafted';
            } else if (!item.isDrafted && item.airate!=null &&item.airate>50 && item.status == BusinessIdeaStatus.Pending) {
              status = 'submitted';
            } else if (!item.isDrafted && item.airate!=null && item.status == BusinessIdeaStatus.Rejected) {
              status = 'declined';
            } else {
              status = 'approved';
            }

            
            console.log(item.location);
            return {
              id: item.id??0,
              founderId:item.founderId??0,
              title: item.title ?? '',
              description: item.description ?? '',
              category: item.categoryName ?? '',
              stage: getStageLabel(item.status ?? 0) ?? '',
              status: status as Idea['status'],
              submittedDate: item.createdAt?.toString() ?? '',
              government: item.government?.nameEn ?? '',
              city: item.city?.nameEn ?? '',
              fundingGoal: item.capital?.toString() ?? '',
              declineReason: item.rejectedReason ?? '',
              formData:{
                location:item.location,
                images: (() => {
                  if (!item.images) return [];
                  if (Array.isArray(item.images)) {
                    return item.images.map((image: string) => this.apiUrl + '/' + image);
                  }
                  return item.images.split(";").map((image: string) => this.apiUrl + '/' + image);
                })(),
                standards:item.businessStandardAnswers,
                investmentType:this.getInvestmentTypeName(item.desiredInvestmentType??0)                
              },
              documentFiles: item.filePath ? [this.apiUrl + '/' + item.filePath] : [],
              AiRate: item.airate,
              rejectionData: {
                message: item.aiBusinessEvaluations?.generalFeedback ?? "",
                standards: item.aiBusinessEvaluations?.standards ?? []
              },
              contactRequests: item.investorContactRequests?.map((request) => ({
                id: request.id.toString(),
                investorName: request.investorName,
                requestDate: request.createdAt?.toString() ?? '',
                status: request.status === ContactRequestStatus.Pending ? 'pending' : request.status === ContactRequestStatus.Accepted? 'accepted' : 'declined'
              })) ?? []
            };
          });
          this.ideas = ideasArr;
          this.emitIdeasCount();
          console.log(this.ideas);
        }
      }, error: (err) => {
        console.log(err);
      }

    })
    this.unsubscribe.push(sub);

   this.route.queryParams.subscribe(params => {
    const tab = params['tab'];
    if (tab === 'myIdeas' || tab === 'addIdea') {
      this.activeTab = tab;
    }
  });

  }

  switchTab(tab: 'myIdeas' | 'addIdea'): void {
    this.activeTab = tab;
  }
  getIdeas(){
    this.ngOnInit();
  }

  activteAllIdeas(){
    this.activeTab='myIdeas';
    this.ngOnInit();
  }

  private emitIdeasCount(): void {
    console.log(this.ideas.length);
    
    this.ideasCountChange.emit(this.ideas.length);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
} 