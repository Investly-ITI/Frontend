import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { Investor, InvestorSearch } from '../../_models/investor';

@Injectable({
  providedIn: 'root'
})
export class InvestorService {
  private baseUrl = `${environment.apiUrl}/api/admin/investor`
  constructor(private httpClient: HttpClient) { }

  getpagintedData(dataSearch: InvestorSearch): Observable<Response<any>> {
    var result = this.httpClient.post<Response<any>>(`${this.baseUrl}/paginated`, dataSearch);
    return result;
  }

  add(data: Investor): Observable<Response<Investor>> {
    var result = this.httpClient.post<Response<Investor>>(`${this.baseUrl}`, data);
    return result;
  }
  
  getTotalActiveInactive(): Observable<Response<any>> {
    var result = this.httpClient.get<Response<any>>(`${this.baseUrl}/total-active-inactive`);
    return result;
  }

}
