import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdeaDetailsApiResponse } from '../../_models/businesses';

@Injectable({
  providedIn: 'root'
})
export class IdeaDetailsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBusinessDetails(businessId: number): Observable<IdeaDetailsApiResponse> {
    return this.http.get<IdeaDetailsApiResponse>(`${this.apiUrl}/api/Business/${businessId}`);
  }

  createContactRequest(businessId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/InvestorContactRequest/create`, { businessId });
  }
}
