import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { notification, notificationSearch } from '../../../_models/notification';
import { RouterLink } from '@angular/router';
import { UserType } from '../../../_shared/enums'

@Component({
  selector: 'app-notification-drop-down',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './notification-drop-down.component.html',
  styleUrl: './notification-drop-down.component.css'
})
export class NotificationDropDownComponent {
  @Input() isNotificationsOpen: boolean = false;
  @Input() isNotificationsClosing: boolean = false;
  @Input() notifications: notification[] = [];
  @Output() seeMoreClicked = new EventEmitter<void>();
  @Output() clickOutside = new EventEmitter<void>();

  UserType = UserType;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Only emit if dropdown is open
    // The parent container handles stopPropagation for clicks inside the notification area
    if (this.isNotificationsOpen) {
      this.clickOutside.emit();
    }
  }

  onSeeMoreClick() {
    this.seeMoreClicked.emit();
  }
}
            