import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MyIdeasComponent } from './my-ideas/my-ideas.component';
interface ContactRequest {
  id: string;
  investorName: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'declined';
}
interface Idea {
  id: string;
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
  submissionType: 'form' | 'document';
  formData?: any;
  documentFiles?: string[];
  contactRequests?: ContactRequest[];
  rejectionData?: {
    message: string;
    standards: string[];
    rejectedAt: string;
  };
}

@Component({
  selector: 'app-investor-ideas-request',
  imports: [CommonModule,MyIdeasComponent],
  templateUrl: './investor-ideas-request.component.html',
  styleUrl: './investor-ideas-request.component.css'
})

export class InvestorIdeasRequestComponent {
 @Input() ideas: Idea[] = [];
  @Output() ideasChange = new EventEmitter<Idea[]>();
  @Output() ideasCountChange = new EventEmitter<number>();

  activeTab: 'myIdeas' | 'addIdea' = 'myIdeas';

  // Sample data for testing
  sampleIdeas: Idea[] = [
    {
      id: '1',
      title: 'Smart Agriculture Platform',
      description: 'IoT-based platform for optimizing crop yields and water usage',
      category: 'Technology',
      status: 'approved',
      stage: 'Startup',
      submittedDate: '2024-01-10',
      government: 'Cairo',
      city: 'Nasr City',
      fundingGoal: '500000',
      submissionType: 'form',
      contactRequests: [
        {
          id: '1',
          investorName: 'Ahmed Hassan',
          requestDate: '2024-03-01',
          status: 'pending'
        },
        {
          id: '2',
          investorName: 'Sarah Mohamed',
          requestDate: '2024-02-28',
          status: 'accepted'
        },
        {
          id: '3',
          investorName: 'Omar El-Rashid',
          requestDate: '2024-02-25',
          status: 'pending'
        }
      ],
      formData: {
        title: 'Smart Agriculture Platform',
        category: 'Technology',
        stage: 'Startup',
        investmentType: 'Both',
        fundingGoal: '500000',
        techStack: 'IoT sensors, React, Node.js',
        targetMarket: 'Small to medium farms',
        problemSolving: 'Optimizing water usage and monitoring crop conditions',
        competitiveAdvantage: 'Real-time IoT monitoring with AI predictions',
        scalability: 'Expand to different crop types and regions'
      }
    },
    {
      id: '2',
      title: 'EcoDelivery Service',
      description: 'Electric vehicle delivery service for sustainable logistics',
      category: 'E-commerce',
      status: 'submitted',
      stage: 'Intermediate',
      submittedDate: '2024-02-05',
      government: 'Alexandria',
      city: 'Roushdy',
      fundingGoal: '750000',
      submissionType: 'document',
      documentFiles: ['business-plan.pdf'],
      formData: {
        investmentType: 'Funding'
      }
    },
    {
      id: '3',
      title: 'EdTech Learning Platform',
      description: 'AI-powered personalized learning platform for students',
      category: 'Education',
      status: 'declined',
      stage: 'Ideation',
      submittedDate: '2024-02-20',
      government: 'Giza',
      city: 'Dokki',
      fundingGoal: '300000',
      submissionType: 'form',
      declineReason: 'The market analysis was insufficient and the monetization strategy was not clear. Please provide more detailed financial projections and competitive analysis.',
      formData: {
        title: 'EdTech Learning Platform',
        category: 'Education',
        stage: 'Ideation',
        investmentType: 'Both',
        fundingGoal: '300000',
        educationLevel: 'K-12',
        subjectArea: 'Mathematics and Science',
        learningMethod: 'AI-powered adaptive learning',
        assessmentStrategy: 'Real-time progress tracking',
        institutionPartnerships: 'Local schools and educational centers'
      }
    },
    {
      id: '4',
      title: 'FinTech Mobile App',
      description: 'Digital banking solution for small businesses with expense tracking and automated bookkeeping',
      category: 'Financial Technology',
      status: 'draft',
      stage: 'Startup',
      submittedDate: '2024-03-01',
      government: 'Cairo',
      city: 'New Cairo',
      fundingGoal: '800000',
      submissionType: 'form',
      formData: {
        title: 'FinTech Mobile App',
        category: 'Financial Technology',
        stage: 'Startup',
        investmentType: 'Funding',
        fundingGoal: '800000',
        techStack: 'React Native, Node.js, PostgreSQL',
        targetMarket: 'Small and medium businesses',
        problemSolving: 'Simplifying financial management for businesses',
        competitiveAdvantage: 'AI-powered expense categorization and insights',
        scalability: 'Expand to enterprise solutions and international markets'
      }
    },
    {
      id: '5',
      title: 'Healthcare Mentorship Network',
      description: 'Platform connecting healthcare startups with experienced industry mentors for guidance and expertise',
      category: 'Healthcare',
      status: 'draft',
      stage: 'Ideation',
      submittedDate: '2024-03-05',
      government: 'Giza',
      city: 'Giza',
      submissionType: 'document',
      documentFiles: ['healthcare-mentorship-proposal.pdf'],
      formData: {
        title: 'Healthcare Mentorship Network',
        category: 'Healthcare',
        stage: 'Ideation',
        investmentType: 'Industrial Experience',
        medicalSpecialty: 'General Healthcare Innovation',
        targetPatients: 'Healthcare startups and entrepreneurs',
        regulatoryCompliance: 'Focus on mentorship and knowledge sharing, no direct patient care',
        clinicalValidation: 'Validation through mentor expertise and startup success metrics',
        healthcarePartners: 'Leading hospitals, healthcare accelerators, and industry experts'
      }
    },
    {
      id: '6',
      title: 'Social Media Analytics Tool',
      description: 'AI-powered analytics platform for social media marketing optimization',
      category: 'Technology',
      status: 'rejected-drafted',
      stage: 'Startup',
      submittedDate: '2024-03-02',
      government: 'Cairo',
      city: 'Maadi',
      fundingGoal: '400000',
      submissionType: 'form',
      rejectionData: {
        message: 'Our AI System has reviewed your business idea and found that it doesn\'t meet the required standards for submission. Please review the feedback below and consider improving your proposal.',
        standards: [
          'Market analysis lacks comprehensive competitor research and differentiation strategy',
          'Financial projections are unrealistic and don\'t account for customer acquisition costs',
          'Technology implementation plan is vague and lacks technical feasibility assessment',
          'Business model doesn\'t clearly address monetization strategy and revenue streams'
        ],
        rejectedAt: '2024-03-02T14:30:00.000Z'
      },
      formData: {
        title: 'Social Media Analytics Tool',
        category: 'Technology',
        stage: 'Startup',
        investmentType: 'Both',
        fundingGoal: '400000',
        techStack: 'Python, React, MongoDB, TensorFlow',
        targetMarket: 'Small to medium marketing agencies',
        problemSolving: 'Providing insights from social media data for better marketing decisions',
        competitiveAdvantage: 'AI-powered sentiment analysis and trend prediction',
        scalability: 'Expand to enterprise clients and add more social platforms'
      }
    }
  ];

  ngOnInit(): void {
    // Initialize with sample data if no ideas provided from parent
    if (this.ideas.length === 0) {
      this.ideas = [...this.sampleIdeas];
    }
    
    // Emit initial count to parent
    this.emitIdeasCount();
  }

  switchTab(tab: 'myIdeas' | 'addIdea'): void {
    this.activeTab = tab;
  }

  private emitIdeasCount(): void {
    this.ideasCountChange.emit(this.ideas.length);
  }
}
