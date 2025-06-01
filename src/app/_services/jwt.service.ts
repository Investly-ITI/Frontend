import { Injectable } from '@angular/core';
import {  UserLogin } from '../_models/user';
import { HttpClient } from '@angular/common/http';
import { Response } from '../_models/response';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private baseUrl = `${environment.apiUrl}/api/auth`
  constructor(private httpClient: HttpClient){ }

  generateToken(data: UserLogin): Observable<Response<string>> {
    var result = this.httpClient.post<Response<string>>(`${this.baseUrl}/login`, data);
    return result;
  }



}
