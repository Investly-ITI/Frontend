import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Governorate } from '../../../../_models/governorate';
import { City } from '../../../../_models/city';
import { GovernrateService } from '../../../../_services/governorate.service';

@Component({
  selector: 'app-add-by-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-by-document.component.html',
  styleUrl: './add-by-document.component.css'
})
export class AddByDocumentComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  
  title = '';
  category = '';
  stage = '';
  governmentId = '';
  cityId = '';
  uploadedFiles: File[] = [];

  categories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Food & Beverage', 'Real Estate', 'Entertainment', 'Transportation', 'Other'
  ];

  stages = [
    'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth Stage', 'Expansion'
  ];

  // Replace static governments with dynamic data
  governorates: Governorate[] = [];
  citiesByGovernorate: City[] = [];
  selectedGovernorate: boolean = false;

  constructor(private governorateService: GovernrateService) { }

  ngOnInit(): void {
    this.loadGovernorates();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  public loadGovernorates() {
    const subGov = this.governorateService.getGovernrates().subscribe({
      next: (response) => {
        if (response.isSuccess == true) {
          this.governorates = response.data;
        }
      },
      error: (err) => {
        console.log("Error loading governorates:", err);
      }
    });
    this.unsubscribe.push(subGov);
  }

  // Handle governorate selection change
  onGovernorateChange(governorateId: number) {
    const subcity = this.governorateService.getCitiesByGovernrateId(governorateId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.citiesByGovernorate = response.data;
          this.selectedGovernorate = true;
          // Reset city selection when governorate changes
          this.cityId = '';
        }
      }, 
      error: (err) => {
        console.log("Error loading cities:", err);
      }
    });
    this.unsubscribe.push(subcity);
  }

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
      governmentId: this.governmentId,
      cityId: this.cityId,
      files: this.uploadedFiles
    };
    
    console.log('Submitting document-based idea:', formData);
    // Submit to backend
  }
} 