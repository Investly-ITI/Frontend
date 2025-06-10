import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddByDocumentComponent } from './add-by-document/add-by-document.component';
import { AddByFormComponent } from './add-by-form/add-by-form.component';

@Component({
  selector: 'app-add-idea',
  imports: [CommonModule, AddByDocumentComponent, AddByFormComponent],
  templateUrl: './add-idea.component.html',
  styleUrl: './add-idea.component.css'
})
export class AddIdeaComponent {
  activeTab: 'document' | 'form' = 'form';

  switchTab(tab: 'document' | 'form'): void {
    this.activeTab = tab;
  }
} 