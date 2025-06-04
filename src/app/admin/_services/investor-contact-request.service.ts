import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InvestorContactRequest, InvestorContactResponse } from '../../_models/contact-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestorContactRequestService {
  private baseUrl = `${environment.apiUrl}/api/admin/InvestorContact`
  constructor(private httpClient: HttpClient) { }

  getInvestorContacts(request?: InvestorContactRequest): Observable<InvestorContactResponse> {
    let params = new HttpParams();

    if (request) {
      if (request.pageNumber !== undefined) {
        params = params.set('pageNumber', request.pageNumber.toString());
      }
      
      if (request.pageSize !== undefined) {
        params = params.set('pageSize', request.pageSize.toString());
      }
      
      if (request.investorIdFilter !== undefined) {
        params = params.set('investorIdFilter', request.investorIdFilter.toString());
      }
      
      if (request.founderIdFilter !== undefined) {
        params = params.set('founderIdFilter', request.founderIdFilter.toString());
      }
      
      if (request.statusFilter !== undefined) {
        params = params.set('statusFilter', request.statusFilter.toString());
      }
      
      if (request.columnOrderBy) {
        params = params.set('columnOrderBy', request.columnOrderBy);
      }
      
      if (request.orderByDirection) {
        params = params.set('orderByDirection', request.orderByDirection);
      }
      
      if (request.searchTerm) {
        params = params.set('searchTerm', request.searchTerm);
      }
    }

    return this.httpClient.get<InvestorContactResponse>(`${this.baseUrl}`, { params });
  }

  // Helper method to get investor contacts with default pagination
  getInvestorContactsPaginated(pageNumber: number = 1, pageSize: number = 10): Observable<InvestorContactResponse> {
    return this.getInvestorContacts({ pageNumber, pageSize });
  }

  // Helper method to search investor contacts
  searchInvestorContacts(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<InvestorContactResponse> {
    return this.getInvestorContacts({ searchTerm, pageNumber, pageSize });
  }

  // Helper method to filter by status
  getInvestorContactsByStatus(status: boolean, pageNumber: number = 1, pageSize: number = 10): Observable<InvestorContactResponse> {
    return this.getInvestorContacts({ statusFilter: status, pageNumber, pageSize });
  }

  // Helper method to filter by investor
  getInvestorContactsByInvestor(investorId: number, pageNumber: number = 1, pageSize: number = 10): Observable<InvestorContactResponse> {
    return this.getInvestorContacts({ investorIdFilter: investorId, pageNumber, pageSize });
  }

  // Helper method to filter by founder
  getInvestorContactsByFounder(founderId: number, pageNumber: number = 1, pageSize: number = 10): Observable<InvestorContactResponse> {
    return this.getInvestorContacts({ founderIdFilter: founderId, pageNumber, pageSize });
  }

}
