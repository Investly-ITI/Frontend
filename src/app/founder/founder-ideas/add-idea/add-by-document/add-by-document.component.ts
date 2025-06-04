import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-by-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-by-document.component.html',
  styleUrl: './add-by-document.component.css'
})
export class AddByDocumentComponent {
  title = '';
  category = '';
  stage = '';
  government = '';
  city = '';
  uploadedFiles: File[] = [];

  categories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Food & Beverage', 'Real Estate', 'Entertainment', 'Transportation', 'Other'
  ];

  stages = [
    'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth Stage', 'Expansion'
  ];

  governments = [
    'Cairo', 'Alexandria', 'Giza', 'Sharkia', 'Dakahlia', 
    'Beheira', 'Kafr El Sheikh', 'Gharbia'
  ];

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.uploadedFiles = [...this.uploadedFiles, ...files];
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  onSubmit(): void {
    const formData = {
      title: this.title,
      category: this.category,
      stage: this.stage,
      government: this.government,
      city: this.city,
      files: this.uploadedFiles
    };
    
    console.log('Submitting document-based idea:', formData);
    // Submit to backend
  }
} 