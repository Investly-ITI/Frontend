import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../_models/response';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {
  private hubConnection!: signalR.HubConnection;
  private ApiUrl = environment.apiUrl;

  constructor(private Http:HttpClient, private auth:AuthService, private notificationService:NotificationService) { }

  public startConnection():void {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiUrl}/notificationHub`, {
        accessTokenFactory: () => this.auth.getToken()??""
      })
      .withAutomaticReconnect()
      .build();


    this.hubConnection.start().catch(err => console.error("error hub",err));
    this.hubConnection.on('RecieveNotificationCount', (count: number) => {
      this.notificationService.updateCountFromSignalR(count);
    })
  }
  public stopConnection() {
    this.hubConnection?.stop();
  }



}
