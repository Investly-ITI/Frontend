import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationDropDownComponent } from "./_core/notification-drop-down/notification-drop-down.component";


@Component({
  selector: 'app-admin',
  imports: [RouterModule, CommonModule, FormsModule, RouterOutlet, RouterLink, NotificationDropDownComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  //* Notifications Properties
  notificationsCount: number = 0;
  notifications: Notification[] = []; //! you need to define notification interface / model and import it then start populating this array with data from your service in loadNotifications method
  isNotificationsOpen: boolean = false;
  isNotificationsClosing: boolean = false;


  constructor(

  ){}


  //* Dark mode - sidebar - menu bar - notifications Toggles in onInit hook:
  ngOnInit() {
    
    // this.loadNotifications(); //+ Uncomment this line when you implement the loadNotifications method

    const allSideMenu = document.querySelectorAll(
      '#sidebar .side-menu.top li a'
    );

    allSideMenu.forEach((item) => {
      const li = item.parentElement;

      item.addEventListener('click', function () {
        allSideMenu.forEach((i) => {
          i.parentElement?.classList.remove('active');
        });
        li?.classList.add('active');
      });
    });

    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (menuBar && sidebar) {
      menuBar.addEventListener('click', function () {
        sidebar.classList.toggle('hide');
      });
    }

    const switchMode = document.getElementById('switch-mode') as HTMLInputElement;

    if (switchMode) {
      const parentDiv = document.querySelector('.parent3');
      switchMode.addEventListener('change', function (this: HTMLInputElement) {
        if (this.checked) {
          parentDiv?.classList.add('dark');
        } else {
          parentDiv?.classList.remove('dark');
        }
      });
    }

    
  }

  //* Notifications Methods:
  toggleNotifications() {
    if (this.isNotificationsOpen) {
      this.closeNotifications();
    } else {
      this.isNotificationsOpen = true;
      // this.loadNotifications(); //+ Uncomment this line when you implement the loadNotifications method
    }
  }

  closeNotifications() {
    this.isNotificationsClosing = true;
    setTimeout(() => {
      this.isNotificationsOpen = false;
      this.isNotificationsClosing = false;
    }, 280); 
  }

  loadNotifications() {
    //+ Implement your logic to load notifications here (Service Call)
  }




}
