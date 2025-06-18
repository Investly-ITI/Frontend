import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationHubService } from './_services/notificationHub.service';
import { NotificationService } from './_services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Frontend';
  constructor(private NotificationHub:NotificationHubService, private NotificationService:NotificationService){}

  ngOnInit(){
   this.NotificationHub.startConnection();
   this.NotificationService.fetchUnreadCount();

  }
  
}
