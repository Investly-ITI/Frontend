import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Investor } from '../../../_models/investor';
import { Status } from '../../../_shared/enums';
import { InvestorService } from '../../_services/investor.service';
import { Gender } from '../../../_shared/general';
import { ToastrService } from 'ngx-toastr';
import { identity, Subscription } from 'rxjs';
import { Governorate } from '../../../_models/governorate';
import { GovernrateService } from '../../../_services/governorate.service';
import { City } from '../../../_models/city';
import { InvestorInvestingType, InvestingStages } from '../../../_shared/enums';
import { environment } from '../../../../environments/environment';
import { CountryCodeService } from '../../../_services/country-code.service';

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
  @Input() Governorates!: Governorate[];
  @Output() saveEntity = new EventEmitter<any>();
  
  //* Tab functionality
  activeTab: 'information' | 'documentation' = 'information';
  

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

  ApiUrl: string = environment.apiUrl;

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
  Cities: City[] = [];
  investingTypes = InvestorInvestingType;
  businessStages = [
    { value: InvestingStages.ideation.toString(), label: 'Ideation' },
    { value: InvestingStages.startup.toString(), label: 'Startup' },
    { value: InvestingStages.intermediate.toString(), label: 'Intermediate' },
    { value: InvestingStages.advanced.toString(), label: 'Advanced' }
  ];
  private unsubscribe: Subscription[] = [];

  //files

  profilePicFile!:File
  FrontIdImageFile!: File;
  BackIdImageFile!: File;

  countryCodes: { code: string, country: string }[] = [];


  constructor(private fb: FormBuilder
    , private investorService: InvestorService
    , private toastrService: ToastrService
    , private governorateService: GovernrateService
    , private countryCodeService: CountryCodeService
    // , private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isEditMode=false;
    this.initializeForm();
    this.countryCodes = this.countryCodeService.getCountryCodes();
  }

  ngOnChanges(changes: SimpleChanges): void {
   
    if (changes['selectedEntity'] || changes['isEditMode']) {
      this.initializeForm();
    }
  }

  triggerInput() {
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profilePicFile=file;

      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.formData.get('user')?.get('')
    }
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

  // Custom validator for min/max funding
  minMaxFundingValidator(): ValidatorFn {
    return (group: AbstractControl): {[key: string]: any} | null => {
      const min = group.get('minFunding')?.value;
      const max = group.get('maxFunding')?.value;
      if (min !== null && min !== undefined && min !== '' && Number(min) <= 500) {
        return { minFundingTooLow: true };
      }
      if (
        min !== null && min !== undefined && min !== '' &&
        max !== null && max !== undefined && max !== '' &&
        Number(max) <= Number(min)
      ) {
        return { maxFundingNotGreater: true };
      }
      return null;
    };
  }

  initializeForm(): void {
    // Handle both InterestedBusinessStages and interestedBusinessStages
    let stages: string[] = [];
    const interestedStages: any = this.selectedEntity?.interestedBusinessStages ?? this.selectedEntity?.interestedBusinessStages;
    if (typeof interestedStages === 'string') {
      stages = interestedStages.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    } else if (Array.isArray(interestedStages)) {
      stages = interestedStages.map((s: any) => String(s));
    }
    this.formData = this.fb.group({
      id: [this.selectedEntity?.id || null],
      userId: [this.selectedEntity?.userId || null],
      investingType: [this.selectedEntity?.investingType || '', Validators.required],
      InterestedBusinessStages: [stages],
      minFunding: [this.selectedEntity?.minFunding || null, [Validators.min(501)]],
      maxFunding: [this.selectedEntity?.maxFunding || null],
      user: this.fb.group({
        id: [this.selectedEntity?.user?.id || 0],
        firstName: [this.selectedEntity?.user?.firstName || '', Validators.required],
        lastName: [this.selectedEntity?.user?.lastName || '', Validators.required],
        email: [this.selectedEntity?.user?.email || '', [Validators.required, Validators.email]],
        countryCode: [this.selectedEntity?.user?.countryCode || ''],
        phoneNumber: [this.selectedEntity?.user?.phoneNumber || ''],
        userType: [this.selectedEntity?.user?.userType || 0],
        nationalId: [this.selectedEntity?.user?.nationalId || '', Validators.required],
        gender: [this.selectedEntity?.user?.gender || Gender.Male, Validators.required],
        dateOfBirth: [this.selectedEntity?.user?.dateOfBirth || '',],
        status: [this.selectedEntity?.user?.status || Status.Active],
        governmentId: [this.selectedEntity?.user?.governmentId || null, Validators.required],
        cityId: [this.selectedEntity?.user?.cityId || null],
        address: [this.selectedEntity?.user?.address || ""]
      })
    }, { validators: this.minMaxFundingValidator() });
    // Enable form in edit mode, disable only in view mode
    if (this.modalMode === 'view' && !this.isEditMode) {
      this.formData.disable();
    } else {
      this.formData.enable();
    }
    // this.cdRef.detectChanges();
    const govId = this.formData.get('user.governmentId')?.value;
    if (govId) {
      this.loadCities(govId);
    }
    if(this.selectedEntity?.user?.profilePicPath!=null &&this.selectedEntity?.user?.profilePicPath!=''){
      this.profileImageUrl=this.ApiUrl+"/"+this.selectedEntity?.user?.profilePicPath;
    }
   else
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



  resetForm(): void {
    this.formData = this.fb.group({
      userId: [''],
      investingType: [''],
      InterestedBusinessStages: [[]],
      minFunding: [''],
      maxFunding: [''],
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
        cityId: [''],
        address:[''],
        
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
      const rawData = this.formData.value;
      const formPayload = new FormData();
      for (const key in rawData) {
        if (key !== 'user') {
          const value = rawData[key];
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'InterestedBusinessStages' && Array.isArray(value)) {
              formPayload.append('InterestedBusinessStages', value.join(','));
            } else {
              formPayload.append(`${key}`, value);
            }
          }
        }
      }
      if (rawData.user) {
        for (const key in rawData.user) {
          const value = rawData.user[key];
          if (value !== null && value !== undefined && value !== '') {
            formPayload.append(`user.${key}`, value);
          }
        }
      }
      //files
      formPayload.append('user.PicFile',this.profilePicFile);
     formPayload.append('user.FrontIdPicFile',this.FrontIdImageFile);
      formPayload.append('user.BackIdPicFile',this.BackIdImageFile);

      //add
      if (this.selectedEntity?.id == null || this.selectedEntity?.id == 0) {
        var res = this.investorService.add(formPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(response.message, 'Success');
              this.isEditMode = false;
              this.saveEntity.emit(this.formData.value);
              this.resetForm();

            } else {
              this.toastrService.error(response.message, "Error");

            }
          }, error: (err) => {
            const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
            this.toastrService.error(errorMsg, 'Error');
          }
        })
        this.unsubscribe.push(res);

        //edit
      } else {

        console.log("update"+formPayload);
        var res2 = this.investorService.update(formPayload).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(response.message, 'Success');
              this.isEditMode = false;
              this.saveEntity.emit(this.formData.value);

            } else {
              this.toastrService.error(response.message, 'Error');
              this.isEditMode = false;
            }
          }, error: (err) => {
            const errorMsg = err?.error?.message || err?.message || 'Unexpected error';
            this.toastrService.error(errorMsg, 'Error');
          }
        })
        this.unsubscribe.push(res2);

      }

    }

  }

  switchTab(tab: 'information' | 'documentation'): void {
    this.activeTab = tab;
  }

  onFrontIdFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.FrontIdImageFile = file; 
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
      this.BackIdImageFile = file; 
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}


