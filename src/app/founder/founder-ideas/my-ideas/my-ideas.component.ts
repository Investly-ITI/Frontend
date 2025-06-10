import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Idea {
  id: string;
  title: string;
  category: string;
  status: 'approved' | 'draft' | 'submitted' | 'declined';
  stage: string;
  description: string;
  submittedDate: string;
  government: string;
  city: string;
}

@Component({
  selector: 'app-my-ideas',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-ideas.component.html',
  styleUrl: './my-ideas.component.css'
})
export class MyIdeasComponent implements OnInit, OnChanges {
  @Input() ideas: Idea[] = [];
  
  // Filter properties
  selectedStatus: string = 'all';
  filteredIdeas: Idea[] = [];

  statusOptions = [
    { value: 'all', label: 'All Ideas', icon: 'bx-list-ul' },
    { value: 'approved', label: 'Approved', icon: 'bx-check-circle' },
    { value: 'submitted', label: 'Under Review', icon: 'bx-time' },
    { value: 'draft', label: 'Draft', icon: 'bx-edit' },
    { value: 'declined', label: 'Declined', icon: 'bx-x-circle' }
  ];

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
      default: return 'status-draft';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved': return 'bx-check-circle';
      case 'draft': return 'bx-edit';
      case 'submitted': return 'bx-time';
      case 'declined': return 'bx-x-circle';
      default: return 'bx-edit';
    }
  }

  canEdit(idea: Idea): boolean {
    return idea.status === 'draft' || idea.status === 'declined';
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
    console.log('View details for idea:', idea);
    // Navigate to idea details
  }

  onEditIdea(idea: Idea): void {
    console.log('Edit idea:', idea);
    // Navigate to edit idea form
  }

  onDeleteIdea(idea: Idea): void {
    console.log('Delete idea:', idea);
    // Show confirmation dialog and delete
  }
} 