import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Investor } from '../../../_models/investor';
import { Status } from '../../../_shared/enums';
import { InvestorService } from '../../_services/investor.service';
import { Gender } from '../../../_shared/general';
import { ToastrService } from 'ngx-toastr';
import { identity } from 'rxjs';

@Component({
  selector: 'app-add-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-update.component.html',
  styleUrl: './add-update.component.css'
})
export class AddUpdateComponent implements OnInit, OnChanges {
  @Input() selectedEntity!: Investor;
  @Input() isEditMode: boolean = false;
  @Input() entityName: string = 'Investor';
  @Input() modalMode: 'add' | 'view' = 'view';
  @Output() saveEntity = new EventEmitter<any>();
  
  //* Tab functionality
  activeTab: 'information' | 'documentation' = 'information';
  
  //* Form data
  formData!: FormGroup;
  investorData!: Investor;

  //* Profile image
  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  showImageOverlay: boolean = false;
  Gender = Gender;

  //* Documentation images
  frontIdImageUrl: string | null = null;
  backIdImageUrl: string | null = null;
  showFrontIdOverlay: boolean = false;
  showBackIdOverlay: boolean = false;

  constructor(private fb: FormBuilder, private investorService: InvestorService, private toastrService: ToastrService) { }
  
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
      id: [this.selectedEntity?.id || null],
      userId: [this.selectedEntity?.userId || null],
      investingType: [this.selectedEntity?.investingType || '', Validators.required],
      user: this.fb.group({
        id: [this.selectedEntity?.user?.id || 0],
        firstName: [this.selectedEntity?.user?.firstName || '', Validators.required],
        lastName: [this.selectedEntity?.user?.lastName || '', Validators.required],
        email: [this.selectedEntity?.user?.email || '', [Validators.required, Validators.email]],
        phoneNumber: [this.selectedEntity?.user?.phoneNumber || ''],
        userType: [this.selectedEntity?.user?.userType || 0],
        nationalId: [this.selectedEntity?.user?.nationalId || '', Validators.required],
        gender: [this.selectedEntity?.user?.gender || Gender.Male, Validators.required],
        dateOfBirth: [this.selectedEntity?.user?.dateOfBirth || '',],
        status: [this.selectedEntity?.user?.status || Status.Active],
        governmentId: [this.selectedEntity?.user?.governmentId || ''],
        cityId: [this.selectedEntity?.user?.cityId || '']
      })
    });
    if (!this.isEditMode) {
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
        status: [1], 
        governmentId: [''],
        cityId: ['']
      })
    });
  }

  toggleEditMode(): void {
    if (!this.isEditMode) {
      this.formData.enable();
      this.isEditMode = true;
    } else {
      //update
      this.onSubmit();
      
    }
  }

  onSubmit(): void {
    if (!this.formData.valid) {
      this.formData.markAllAsTouched();
    } else {

      const investorPayload = {
        ...this.formData.value,
        user: {
          ...this.formData.value.user,
          cityId: this.formData.value.user.cityId || null,
          governmentId: this.formData.value.user.governmentId || null,

        }
      };
      //add
      if (this.selectedEntity?.id == null || this.selectedEntity?.id == 0) {
        var res = this.investorService.add(investorPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(response.message, 'Success');
              this.isEditMode = false;
              this.saveEntity.emit(this.formData.value);

            }
          }, error: (err) => {
            console.log(err);
          }
        })

        //edit
      } else {

        var res2 = this.investorService.update(investorPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(response.message, 'Success');
              this.isEditMode = false;
              this.saveEntity.emit(this.formData.value);

            }else{
              this.toastrService.error(response.message, 'Error');
              this.isEditMode = false;
            }
          }, error: (err) => {
            this.toastrService.error(err, 'Error');
          }
        })


      }

    }

  }

  switchTab(tab: 'information' | 'documentation'): void {
    this.activeTab = tab;
  }

  onFrontIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.frontIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onBackIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.backIdImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFrontIdUpload(): void {
    const fileInput = document.getElementById('frontIdInput') as HTMLInputElement;
    fileInput?.click();
  }

  triggerBackIdUpload(): void {
    const fileInput = document.getElementById('backIdInput') as HTMLInputElement;
    fileInput?.click();
  }
}
