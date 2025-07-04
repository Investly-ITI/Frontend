import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { Investor, InvestorSearch } from '../../_models/investor';
import { DropdownDto } from '../../_models/user';

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

  add(data:FormData): Observable<Response<Investor>> {
    console.log(data);
    var result = this.httpClient.post<Response<Investor>>(`${this.baseUrl}`, data);
    return result;
  }

  getTotalActiveInactive(): Observable<Response<any>> {
    var result = this.httpClient.get<Response<any>>(`${this.baseUrl}/total-active-inactive`);
    return result;
  }

  update(data:FormData):Observable<Response<Investor>>{
    var result= this.httpClient.put<Response<Investor>>(`${this.baseUrl}`,data);
    return result;
  }

  changeStatus(id:number, status:number):Observable<Response<any>>{
    var result= this.httpClient.put<Response<any>>(`${this.baseUrl}/change-status/${id}?status=${status}`,null);
    return result;
  }

  getInvestorsForDropdown(): Observable<Response<DropdownDto[]>> {
    return this.httpClient.get<Response<DropdownDto[]>>(`${this.baseUrl}/dropdown`);
  }


}
