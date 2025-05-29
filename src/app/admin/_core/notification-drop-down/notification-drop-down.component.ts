import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-drop-down',
  imports: [FormsModule,CommonModule],
  templateUrl: './notification-drop-down.component.html',
  styleUrl: './notification-drop-down.component.css'
})
export class NotificationDropDownComponent {
  @Input() isNotificationsOpen:boolean=false;
  @Input() isNotificationsClosing:boolean=false;
  @Input() notifications:Notification[]=[];
 
}
