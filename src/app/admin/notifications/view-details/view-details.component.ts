import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { notification } from '../../../_models/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.css'
})
export class ViewDetailsComponent {
@Input() selectedEntity!: notification;
  @Input() entityName: string = 'Notification';
  @Input() modalMode:string= 'view';
  @Output() closeModal = new EventEmitter<any>();
    formData!: FormGroup;
  founderData!: notification;

  
  

  constructor(private fb: FormBuilder,  private toastrService: ToastrService) { }
 
  ngOnChanges(): void {
  if (this.selectedEntity) {
    this.initializeForm();
  }
}

 ngOnInit(): void {

    this.initializeForm();
  }
      initializeForm(): void {
    this.formData = this.fb.group({
      id: [this.selectedEntity?.id || null],
      body: [this.selectedEntity?.body || ''],
      title: [this.selectedEntity?.title || ''],
      to: [
        (this.selectedEntity?.userIdToNavigation?.firstName || '') +
        ' ' +
        (this.selectedEntity?.userIdToNavigation?.lastName || '')
      ],
      from: [
        (this.selectedEntity?.createdByNavigation?.firstName || '') +
        ' ' +
        (this.selectedEntity?.createdByNavigation?.lastName || '')
      ],
    });
     if (this.modalMode === 'view') {
      this.formData.disable();
    }
  }
  
  
}
