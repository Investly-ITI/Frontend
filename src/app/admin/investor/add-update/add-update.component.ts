import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Investor } from '../../../_models/investor';
import {  Status } from '../../../_shared/enums';
import { InvestorService } from '../../_services/investor.service';
import { Gender } from '../../../_shared/general';

@Component({
  selector: 'app-add-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-update.component.html',
  styleUrl: './add-update.component.css'
})
export class AddUpdateComponent implements OnInit, OnChanges {
  @Input() selectedEntity!: Investor ;
  @Input() isEditMode: boolean = false;
  @Input() entityName: string = 'Investor';
  @Input() modalMode: 'add' | 'view' = 'view';
  @Output() saveEntity = new EventEmitter<any>();
  //* Form data
  formData!: FormGroup;
  investorData!: Investor;

  //* Profile image
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  showImageOverlay: boolean = false;
  Gender=Gender;

  constructor(private fb: FormBuilder, private investorService: InvestorService) { }


  ngOnInit(): void {
    
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.isEditMode);
    if (changes['selectedEntity'] || changes['isEditMode']) {
      this.initializeForm();
    }
  }
  initializeForm(): void {
    this.formData = this.fb.group({
      userId: [this.selectedEntity?.userId || ''],
      investingType: [this.selectedEntity?.investingType || '', Validators.required],
      user: this.fb.group({
        firstName: [this.selectedEntity?.user?.firstName || '', Validators.required],
        lastName: [this.selectedEntity?.user?.lastName || '', Validators.required],
        email: [this.selectedEntity?.user?.email || '', [Validators.required, Validators.email]],
        phoneNumber: [this.selectedEntity?.user?.phoneNumber || ''],
        userType: [this.selectedEntity?.user?.userType || ''],
        nationalId: [this.selectedEntity?.user?.nationalId || '', Validators.required],
        gender: [this.selectedEntity?.user?.gender || Gender.Male, Validators.required],
        dateOfBirth: [this.selectedEntity?.user?.dateOfBirth || '',],
        status: [this.selectedEntity?.user?.status || Status.Active],
        governmentId: [this.selectedEntity?.user?.governmentId || ''],
        cityId: [this.selectedEntity?.user?.cityId || '']
      })
    });
    if(!this.isEditMode){
      this.formData.disable()
    }
  }

  resetForm(): void {
    this.formData = this.fb.group({
      userId: [''],
      investingType: [''],
      user: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: [''],
        phoneNumber: [''],
        userType: [''],
        nationalId: [''],
        gender: [''],
        dateOfBirth: [''],
        status: [1], // Or Status.Active
        governmentId: [''],
        cityId: ['']
      })
    });
  }

  toggleEditMode(): void {
    if (!this.isEditMode) {
      this.formData.enable();
      this.isEditMode=true;
    } else {
     this.formData.disable();
    }
  }

  onSubmit(): void {
    if (!this.formData.valid) {
      this.formData.markAllAsTouched();
    } else {
      //add
      if (this.selectedEntity?.id == null || this.selectedEntity?.id==0) {
        const investorPayload = {
          ...this.formData.value,
          userId:0,
          user: {
            ...this.formData.value.user,
            cityId: this.formData.value.user.cityId || null,
            governmentId: this.formData.value.user.governmentId || null,
            userType: this.formData.value.user.userType || null,
            gender:this.formData.value.user.gender||null
          
          }
        };
        var res = this.investorService.add(investorPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.saveEntity.emit(this.formData.value);
            }
          }, error: (err) => {
            console.log(err);
          }
        })

        //edit
      }else{

        
      }
      
    }

  }
}
