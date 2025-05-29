import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-update.component.html',
  styleUrl: './add-update.component.css'
})
export class AddUpdateComponent implements OnInit, OnChanges {
  @Input() selectedEntity: any = null;
  @Input() isEditMode: boolean = false;
  @Input() entityName: string = 'Investor';
  @Input() modalMode: 'add' | 'view' = 'view';
  @Output() saveEntity = new EventEmitter<any>();

  //* Form data
  formData = {
    name: '',
    age: '',
    stage: ''
  };

  //* Profile image
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  showImageOverlay: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedEntity'] || changes['isEditMode']) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.selectedEntity) {
      this.formData = {
        name: this.selectedEntity.name || 'Ahmed',
        age: this.selectedEntity.age || '25',
        stage: this.selectedEntity.stage || 'intermediate'
      };
    } else {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formData = {
      name: '',
      age: '',
      stage: ''
    };
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Save mode - submit the form
      this.onSubmit();
    } else {
      // Enable edit mode
      this.isEditMode = true;
    }
  }

  onSubmit(): void {
    const entityData = {
      ...this.formData,
      id: this.selectedEntity?.id || null
    };
    
    // Emit the save event with the form data
    //! TODO: data will be emitted to investor component, i am not sure if sarah wants to implement service here in this component on in the parent one , i will ask her
    this.saveEntity.emit(entityData);
    
    // Only disable edit mode for view mode, add mode should close modal
    if (this.modalMode === 'view' && this.selectedEntity) {
      this.isEditMode = false;
    }
  }
}
