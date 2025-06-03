import { Injectable } from '@angular/core';
import { UserLogin } from '../_models/user';
import { HttpClient } from '@angular/common/http';
import { Response } from '../_models/response';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Investor } from '../_models/investor';


@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private baseUrl = `${environment.apiUrl}/api/auth`
  constructor(private httpClient: HttpClient) { }

  generateToken(data: UserLogin): Observable<Response<string>> {
    var result = this.httpClient.post<Response<string>>(`${this.baseUrl}/login`, data);
    return result;
  }


  registerInvestor(data:FormData): Observable<Response<Investor>> {
    var result = this.httpClient.post<Response<Investor>>(`${this.baseUrl}/register-investor`, data);
    return result;
  }
  registerFounder(data: FormData): Observable<Response<Investor>> {
    var result = this.httpClient.post<Response<Investor>>(`${this.baseUrl}/register-founder`, data);
    return result;
  }



}
