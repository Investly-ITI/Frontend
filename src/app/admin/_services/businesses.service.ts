import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessSearchDto, BusinessListDto, BusinessDto } from '../../_models/businesses';
import { Response } from '../../_models/response';
import { BusinessIdeaStatus } from '../../_shared/enums';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private baseUrl = `${environment.apiUrl}/api/admin/Business`;

  constructor(private http: HttpClient) { }

  getAllBusinesses(searchDto: BusinessSearchDto): Observable<Response<BusinessListDto>> {
    let params = new HttpParams();

    if (searchDto.pageSize !== undefined && searchDto.pageSize !== null) {
      params = params.set('pageSize', searchDto.pageSize.toString());
    }
    if (searchDto.pageNumber !== undefined && searchDto.pageNumber !== null) {
      params = params.set('pageNumber', searchDto.pageNumber.toString());
    }
    if (searchDto.search) {
      params = params.set('searchInput', searchDto.search);
    }
    if (searchDto.categoryId !== undefined && searchDto.categoryId !== null && searchDto.categoryId > 0) {
      params = params.set('categoryId', searchDto.categoryId.toString());
    }
    if (searchDto.founderId !== undefined && searchDto.founderId !== null && searchDto.founderId > 0) {
      params = params.set('founderId', searchDto.founderId.toString());
    }
    if (searchDto.stage !== undefined && searchDto.stage !== null && searchDto.stage > 0) {
      params = params.set('stage', searchDto.stage.toString());
    }
    if (searchDto.status !== undefined && searchDto.status !== null) {
      params = params.set('status', searchDto.status.toString());
    }

    return this.http.get<Response<BusinessListDto>>(`${this.baseUrl}/All`, { params });
  }

  softDeleteBusiness(id: number): Observable<Response<object>> {
    return this.http.put<Response<object>>(`${this.baseUrl}/${id}/Delete`, {});
  }

  updateBusinessStatus(id: number, newStatus: BusinessIdeaStatus, rejectedReason?: string): Observable<Response<object>> {
    let params = new HttpParams().set('newStatus', newStatus.toString());
    if (newStatus === BusinessIdeaStatus.Rejected && rejectedReason) {
      params = params.set('rejectedReason', rejectedReason);
    }
    return this.http.put<Response<object>>(`${this.baseUrl}/${id}/Update`, {}, { params });
  }
  GetBusinessIdeasCounts(): Observable<Response<any>> {
      var result = this.http.get<Response<any>>(`${this.baseUrl}/ideas-counts`);
      return result;
    }
}