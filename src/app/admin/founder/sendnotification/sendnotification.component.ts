import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { notification, notificationSearch, sendnotification } from '../../../_models/notification';
import { NotificationService } from '../../_services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { Founder } from '../../../_models/founder';
import { LoggedInUser } from '../../../_models/user';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-sendnotification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sendnotification.component.html',
  styleUrl: './sendnotification.component.css'
})
export class SendnotificationComponent {
  @Input() selectedEntity!: Founder;

  @Input() entityName: string = 'Notifcation';
  @Input() notificationmodalMode = 'add';
 
  @Output() saveEntity = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();
  notificationToSend!:sendnotification;
  formData!: FormGroup;
  notifcationData!: notification;
  loggedInUser:LoggedInUser|null=null;

  constructor(private fb: FormBuilder, private notificationService: NotificationService, private toastrService: ToastrService,private auth:AuthService) { }

  ngOnInit(): void {
    this.initializeForm();
      var sub=this.auth.CurrentUser$.subscribe(user=>{
           this.loggedInUser=user;
     })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedEntity'] ) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    this.formData = this.fb.group({
      title: [ '',Validators.required],
      body: [ '',Validators.required],
    to: [
        (this.selectedEntity?.user.firstName || '') +
        ' ' +
        (this.selectedEntity?.user?.lastName || '')
      ],
     
      from: [this.loggedInUser?.name || '']
      
     
    });
  }


  resetForm(): void {
    this.formData = this.fb.group({
      Title: [''],
      Body: ['']
    });
  }
onSubmit(): void {
  if (!this.formData.valid) {
    this.formData.markAllAsTouched();
  } else {
    this.notificationToSend = {
      title: this.formData.value.title,
      body: this.formData.value.body,
      userIdTo: this.selectedEntity.userId,
      userTypeTo: this.selectedEntity.user.userType
    };
    this.notificationService.SendNotification(this.notificationToSend).subscribe({
      next: (response) => {
        this.resetForm();
        if (response.isSuccess) {
          this.toastrService.success(response.message, 'Success');
          this.saveEntity.emit(this.formData.value);
          this.closeModal.emit(); 
        } else {
          this.toastrService.error(response.message, 'Fail');
        }
      },
      error: (err) => {
        console.log(err);
        this.toastrService.error('An error occurred', 'Error');
      }
    });
  }
}

 
}

