import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { InvestorContactItem, InvestorContactRequest, InvestorContactResponse, UpdateContactRequestStatusDto } from '../../_models/contact-request';
import { ContactRequestStatus } from '../../_shared/enums';


@Injectable({
  providedIn: 'root'
})
export class InvestorContactRequestService {
  private baseUrl = `${environment.apiUrl}/api/admin/InvestorContact`;

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
        const statusString = ContactRequestStatus[request.statusFilter]; // Convert number to string
        params = params.set('statusFilter', statusString); // e.g., "Pending"
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

  getInvestorContactsCount(status?: ContactRequestStatus): Observable<number> {
    let params = new HttpParams();

    if (status !== undefined) {
      params = params.set('statusFilter', status.toString());
    }

    return this.httpClient
      .get<InvestorContactResponse>(`${this.baseUrl}`, { params })
      .pipe(
        // If you want the count of filtered items from the server:
        map(response => response.totalFilteredItems)
      );
  }

  updateContactRequestStatus(dto: UpdateContactRequestStatusDto): Observable<InvestorContactItem> {
    // The dto.newStatus will automatically be the numeric value from the enum
    return this.httpClient.put<InvestorContactItem>(`${this.baseUrl}/update-status`, dto);
  }


  // Helper methods that pass the numeric enum values
  getPendingContactsCount(): Observable<number> {
    return this.getInvestorContactsCount(ContactRequestStatus.Pending); // Will pass 1
  }

  getAcceptedContactsCount(): Observable<number> {
    return this.getInvestorContactsCount(ContactRequestStatus.Accepted); // Will pass 2
  }

  getDeclinedContactsCount(): Observable<number> {
    return this.getInvestorContactsCount(ContactRequestStatus.Declined); // Will pass 3
  }
}