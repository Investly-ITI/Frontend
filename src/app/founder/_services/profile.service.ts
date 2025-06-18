import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Founder } from '../../_models/founder';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private ApiUrl=environment.apiUrl;
  constructor(private http :HttpClient) {}

  getProfileData():Observable<Response<Founder>>{
    var res=this.http.get<Response<Founder>>(`${this.ApiUrl}/api/founder/profile`);
    return res;
  }

}
