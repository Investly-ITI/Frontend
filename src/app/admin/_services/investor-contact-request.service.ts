

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { InvestorContactItem, InvestorContactRequest, InvestorContactResponse, UpdateContactRequestStatusDto } from '../../_models/contact-request';
import { ContactRequestStatus } from '../../_shared/enums';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvestorContactRequestService {
  private baseUrl = `${environment.apiUrl}/api/admin/InvestorContact`;

  constructor(private httpClient: HttpClient) { }

  getInvestorContacts(request?: InvestorContactRequest): Observable<Response<InvestorContactResponse>> {
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
        const statusString = ContactRequestStatus[request.statusFilter];
        params = params.set('statusFilter', statusString);
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

    return this.httpClient.get<Response<InvestorContactResponse>>(`${this.baseUrl}`, { params });
  }

  updateContactRequestStatus(dto: UpdateContactRequestStatusDto): Observable<Response<InvestorContactItem>> {
    return this.httpClient.put<Response<InvestorContactItem>>(`${this.baseUrl}/update-status`, dto);
  }

  getContactRequestById(contactId: number): Observable<Response<InvestorContactItem>> {
    return this.httpClient.get<Response<InvestorContactItem>>(`${this.baseUrl}/${contactId}`);
  }

getContactsCountByStatus(status?: ContactRequestStatus): Observable<Response<InvestorContactResponse>> {
  let params = new HttpParams();
  if (status !== undefined) {
    params = params.set('statusFilter', status); // Adjust based on backend expectations
  }
  return this.httpClient.get<Response<InvestorContactResponse>>(
    `${this.baseUrl}`, // Ensure this matches the backend endpoint (e.g., `/api/admin/InvestorContactRequest`)
    { params }
  );
}

getPendingContactsCount(): Observable<number> {
  return this.getContactsCountByStatus(ContactRequestStatus.Pending).pipe(
    map((response: Response<InvestorContactResponse>) => response.data.totalFilteredItems)
  );
}

getAcceptedContactsCount(): Observable<number> {
  return this.getContactsCountByStatus(ContactRequestStatus.Accepted).pipe(
    map((response: Response<InvestorContactResponse>) => response.data.totalFilteredItems)
  );
}

getDeclinedContactsCount(): Observable<number> {
  return this.getContactsCountByStatus(ContactRequestStatus.Declined).pipe(
    map((response: Response<InvestorContactResponse>) => response.data.totalFilteredItems)
  );
}






}


