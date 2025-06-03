import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Founder } from '../../../_models/founder';
import { Gender } from '../../../_shared/general';
import { FounderService } from '../../_services/founder.service';
import { ToastrService } from 'ngx-toastr';
import { Status } from '../../../_shared/enums';

@Component({
  selector: 'app-viewdetails',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './viewdetails.component.html',
  styleUrl: './viewdetails.component.css'
})
export class ViewdetailsComponent implements OnInit, OnChanges { 
@Input() selectedEntity!: Founder;
  @Input() entityName: string = 'Founder';
  @Input() modalMode:string= 'view';
  @Output() closeModal = new EventEmitter<any>();
    formData!: FormGroup;
  founderData!: Founder;


  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  showImageOverlay: boolean = false;
  Gender = Gender;

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
      userId: [this.selectedEntity?.userId || null],
      user: this.fb.group({
        id: [this.selectedEntity?.user?.id || 0],
        firstName: [this.selectedEntity?.user?.firstName || ''],
        lastName: [this.selectedEntity?.user?.lastName || ''],
        email: [this.selectedEntity?.user?.email || ''],
        phoneNumber: [this.selectedEntity?.user?.phoneNumber || ''],
        userType: [this.selectedEntity?.user?.userType || 0],
        nationalId: [this.selectedEntity?.user?.nationalId || ''],
        gender: [this.selectedEntity?.user?.gender || Gender.Male],
        dateOfBirth: [this.selectedEntity?.user?.dateOfBirth || ''],
        status: [this.selectedEntity?.user?.status || Status.Active],
        governmentId: [this.selectedEntity?.user?.governmentId || ''],
        cityId: [this.selectedEntity?.user?.cityId || '']
      })
    });
     if (this.modalMode === 'view') {
      this.formData.disable();
    }
  }
  
  
}
