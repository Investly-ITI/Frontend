import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { notification } from '../../../_models/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-details',
  imports: [CommonModule],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.css'
})
export class ViewDetailsComponent {
@Input() selectedEntity!: notification;
  @Input() entityName: string = 'Notification';
  @Input() modalMode:string= 'view';
  @Output() closeModal = new EventEmitter<any>();
  
  founderData!: notification;

  
  

  constructor(private toastrService: ToastrService) { }
 
  ngOnChanges(): void {
    if (this.selectedEntity) {
      this.founderData = this.selectedEntity;
    }
  }

  ngOnInit(): void {
    if (this.selectedEntity) {
      this.founderData = this.selectedEntity;
    }
  }
  
  
}
