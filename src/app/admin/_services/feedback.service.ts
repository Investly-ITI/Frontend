import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackListDto, FeedbackSearchDto, FeedbackCountsDto } from '../../_models/feedback';
import { Response } from '../../_models/response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = `${environment.apiUrl}/api/admin/Feedback`;

  constructor(private http: HttpClient) { }

  getAllFeedbacks(searchDto: FeedbackSearchDto): Observable<Response<FeedbackListDto>> {
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
    if (searchDto.statusFilter !== undefined && searchDto.statusFilter !== null && searchDto.statusFilter > 0) {
      params = params.set('statusFilter', searchDto.statusFilter.toString());
    }
    if (searchDto.userTypeFromFilter !== undefined && searchDto.userTypeFromFilter !== null && searchDto.userTypeFromFilter > 0) {
      params = params.set('userTypeFromFilter', searchDto.userTypeFromFilter.toString());
    }
    if (searchDto.userTypeToFilter !== undefined && searchDto.userTypeToFilter !== null && searchDto.userTypeToFilter > 0) {
      params = params.set('userTypeToFilter', searchDto.userTypeToFilter.toString());
    }

    return this.http.get<Response<FeedbackListDto>>(`${this.baseUrl}/all`, { params });
  }


   updateFeedbackStatus(id: number, actionType: string): Observable<Response<object>> {
    const params = new HttpParams().set('actionType', actionType);
    return this.http.put<Response<object>>(`${this.baseUrl}/${id}/status-update`, {}, { params });
  }

 
  getFeedbackStatisticsCounts(): Observable<Response<FeedbackCountsDto>> {
    return this.http.get<Response<FeedbackCountsDto>>(`${this.baseUrl}/statistics-counts`);
  }
}