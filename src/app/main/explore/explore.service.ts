import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusinessSearchRequest, BusinessListDto, InvestorPreferencesApiResponse } from '../../_models/businesses';
import { Response } from '../../_models/response';

export interface ExploreResponse {
  businesses: any[];
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
  investorPreferences?: InvestorPreferencesApiResponse;
}

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  constructor(private http: HttpClient) { }

  getBusinesses(searchRequest: BusinessSearchRequest): Observable<Response<ExploreResponse>> {
    return this.http.post<Response<ExploreResponse>>(
      `${environment.apiUrl}/api/Business/GetAllBusinesses`,
      searchRequest
    );
  }

  createContactRequest(businessId: number): Observable<Response<{ contactRequestId: number }>> {
    return this.http.post<Response<{ contactRequestId: number }>>(
      `${environment.apiUrl}/api/InvestorContactRequest/create`,
      { businessId }
    );
  }
}
