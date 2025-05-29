import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { Investor } from '../../_models/investor';

@Injectable({
  providedIn: 'root'
})
export class InvestorService {
  private baseUrl=`${environment.apiUrl}/api/admin/investor`
  constructor(private httpClient:HttpClient ) {}
  getAllInvestors():Observable<Response<Investor[]>>{
    console.log("hhhhh");
    var result= this.httpClient.get<Response<Investor[]>>(`${this.baseUrl}`);
    return result;

  }
}
