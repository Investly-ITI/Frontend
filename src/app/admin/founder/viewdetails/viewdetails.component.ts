import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Founder } from '../../../_models/founder';
import { Gender } from '../../../_shared/general';
import { ToastrService } from 'ngx-toastr';
import { Status } from '../../../_shared/enums';
import { environment } from '../../../../environments/environment';
import { Governorate } from '../../../_models/governorate';
import { GovernrateService } from '../../../_services/governorate.service';
import { City } from '../../../_models/city';
import { Subscription } from 'rxjs';

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
  activeTab: 'information' | 'documentation' = 'information';
    formData!: FormGroup;
  founderData!: Founder;
 private unsubscribe: Subscription[] = [];


  ApiUrl: string = environment.apiUrl;

  profileImageUrl: string = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  showImageOverlay: boolean = false;
  Gender = Gender;
frontIdImageUrl: string | null = null;
  backIdImageUrl: string | null = null;
  showFrontIdOverlay: boolean = false;
  showBackIdOverlay: boolean = false;
  
      Cities: City[] = [];
      governorates: Governorate[] = [];
   
  constructor(
  private fb: FormBuilder,
  private toastrService: ToastrService,
  private governorateService: GovernrateService
) { }
 
   ngOnChanges(): void {
  if (this.selectedEntity) {
    this.initializeForm();
  }
}

 ngOnInit(): void {
  this.loadGovernorates();
    this.initializeForm();
}

loadGovernorates(): void {
  this.governorateService.getGovernrates().subscribe({
    next: (response) => {
      this.governorates = response.data;
    
    },
    error: (err) => {
      this.governorates = [];
      this.toastrService.error('Failed to load governorates', 'Error');
      
    }
  });
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
      cityId: [this.selectedEntity?.user?.cityId|| ''],
      address: [this.selectedEntity?.user?.address || ''],
    })
  });
  if (this.modalMode === 'view') {
    this.formData.disable();
  }
   const govId = this.formData.get('user.governmentId')?.value;
    if (govId) {
      this.loadCities(govId);
    }
  if(this.selectedEntity?.user?.profilePicPath!=null && this.selectedEntity?.user?.profilePicPath!=''){
    this.profileImageUrl=this.ApiUrl+"/"+this.selectedEntity?.user?.profilePicPath;
  }else
  {
    this.profileImageUrl='https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';
  }
  if (this.selectedEntity?.user?.frontIdPicPath) {
    this.frontIdImageUrl = this.ApiUrl + '/' + this.selectedEntity.user.frontIdPicPath;
  } else {
    this.frontIdImageUrl = null;
  }
  if (this.selectedEntity?.user?.backIdPicPath) {
    this.backIdImageUrl = this.ApiUrl + '/' + this.selectedEntity.user.backIdPicPath;
  } else {
    this.backIdImageUrl = null;
  }

}
  
  switchTab(tab: 'information' | 'documentation'): void {
    this.activeTab = tab;
  }
  
  loadCities(goveId: number) {
    console.log(goveId);
    var sub = this.governorateService.getCitiesByGovernrateId(goveId).subscribe({
      next: (response) => {
        this.Cities = response.data;
      },
      error: (err) => {
        console.log("something went wrong");
      }
    })


  }
   ngOnDestroy() {
      this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
 
}
