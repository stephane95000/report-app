import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Report } from '../models/report.interface';
import { IReportForm } from '../models/report-form.interface';
import { Observation } from '../models/observation.interface';
import { environment } from '../../../../environments/environment';

const BASE_PATH = environment.reportApiUrl;

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private readonly http: HttpClient) {}

  public getReportList(): Observable<Report[]> {
    return this.http.get<Report[]>(BASE_PATH);
  }

  public getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${BASE_PATH}/${id}`);
  }

  public getObservations(): Observable<Observation[]> {
    return this.http.get<Observation[]>(`${BASE_PATH}/observations`);
  }

  public createReport(report: IReportForm): Observable<void> {
    return this.http.post<void>(BASE_PATH, report);
  }

  public updateReport(id: number, report: IReportForm): Observable<void> {
    return this.http.put<void>(`${BASE_PATH}/${id}`, report);
  }
}
