import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyIdeasComponent } from './my-ideas/my-ideas.component';
import { AddIdeaComponent } from './add-idea/add-idea.component';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'declined';
  stage: string;
  submittedDate: string;
  government: string;
  city: string;
}

@Component({
  selector: 'app-founder-ideas',
  imports: [CommonModule, MyIdeasComponent, AddIdeaComponent],
  templateUrl: './founder-ideas.component.html',
  styleUrl: './founder-ideas.component.css'
})
export class FounderIdeasComponent implements OnInit {
  @Input() ideas: Idea[] = [];
  @Output() ideasChange = new EventEmitter<Idea[]>();

  activeTab: 'myIdeas' | 'addIdea' = 'myIdeas';

  // Sample data for testing
  sampleIdeas: Idea[] = [
    {
      id: '1',
      title: 'Smart Agriculture Platform',
      description: 'IoT-based platform for optimizing crop yields and water usage',
      category: 'Technology',
      status: 'approved',
      stage: 'Prototype',
      submittedDate: '2024-01-10',
      government: 'Cairo',
      city: 'Nasr City'
    },
    {
      id: '2',
      title: 'EcoDelivery Service',
      description: 'Electric vehicle delivery service for sustainable logistics',
      category: 'E-commerce',
      status: 'submitted',
      stage: 'MVP',
      submittedDate: '2024-02-05',
      government: 'Alexandria',
      city: 'Roushdy'
    },
    {
      id: '3',
      title: 'EdTech Learning Platform',
      description: 'AI-powered personalized learning platform for students',
      category: 'Education',
      status: 'draft',
      stage: 'Idea',
      submittedDate: '2024-02-20',
      government: 'Giza',
      city: 'Dokki'
    }
  ];

  ngOnInit(): void {
    // Use sample data if no ideas provided
    if (this.ideas.length === 0) {
      this.ideas = [...this.sampleIdeas];
    }
  }

  switchTab(tab: 'myIdeas' | 'addIdea'): void {
    this.activeTab = tab;
  }

  onIdeasUpdated(updatedIdeas: Idea[]): void {
    this.ideas = updatedIdeas;
    this.ideasChange.emit(this.ideas);
  }
} 