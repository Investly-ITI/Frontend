import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessSearchDto, BusinessListDto, ResponseDto, BusinessDto } from '../../_models/businesses';
import { BusinessIdeaStatus } from '../../_shared/enums';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private baseUrl = `${environment.apiUrl}/Business`;

  constructor(private http: HttpClient) { }

  getAllBusinesses(searchDto: BusinessSearchDto): Observable<ResponseDto<BusinessListDto>> {
    let params = new HttpParams();

    if (searchDto.pageSize !== undefined && searchDto.pageSize !== null) {
      params = params.set('pageSize', searchDto.pageSize.toString());
    }
    if (searchDto.pageNumber !== undefined && searchDto.pageNumber !== null) {
      params = params.set('pageNumber', searchDto.pageNumber.toString());
    }
    if (searchDto.searchInput) {
      params = params.set('searchInput', searchDto.searchInput);
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

    return this.http.get<ResponseDto<BusinessListDto>>(`${this.baseUrl}/All`, { params });
  }

  softDeleteBusiness(id: number): Observable<ResponseDto<object>> {
    return this.http.put<ResponseDto<object>>(`${this.baseUrl}/${id}/Delete`, {});
  }

  updateBusinessStatus(id: number, newStatus: BusinessIdeaStatus): Observable<ResponseDto<object>> {
    const params = new HttpParams().set('newStatus', newStatus.toString());
    return this.http.put<ResponseDto<object>>(`${this.baseUrl}/${id}/Update`, {}, { params });
  }
}