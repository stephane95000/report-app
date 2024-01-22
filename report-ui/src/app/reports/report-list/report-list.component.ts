import {
  ReportCard,
  ReportCardComponent,
} from '../report-card/report-card.component';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ReportFilterFormComponent } from '../report-filter-form/report-filter-form.component';
import { ReportService } from '../shared/services/report.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { IFilterForm } from '../shared/models/filter-form.interface';
import { Report } from '../shared/models/report.interface';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    ReportCardComponent,
    NgFor,
    NgIf,
    NgTemplateOutlet,
    RouterLink,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    ReportFilterFormComponent,
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public cards$?: Observable<{ loading: boolean; value?: ReportCard[] }>;
  public dataSource?: MatTableDataSource<ReportCard>;

  constructor(private readonly reportService: ReportService) {}

  ngOnInit(): void {
    this.cards$ = this.getCards();
  }

  ngOnDestroy(): void {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  public applyFilter(value: IFilterForm): void {
    if (this.dataSource) {
      this.dataSource.filter = JSON.stringify(value);
    }
  }

  private getCards(): Observable<{ loading: boolean; value?: ReportCard[] }> {
    return this.reportService.getReportList().pipe(
      map(reports => {
        const reportCards = this.reportsToReportCardList(reports);
        return this.createDataSource(reportCards);
      }),
      switchMap(datasource => {
        this.dataSource = datasource;
        return this.dataSource.connect();
      }),
      map(reports => ({ loading: false, value: reports })),
      startWith({ loading: true }),
      catchError(() => of({ loading: false }))
    );
  }

  private createDataSource(
    reportCards: ReportCard[]
  ): MatTableDataSource<ReportCard> {
    const dataSource = new MatTableDataSource<ReportCard>();
    dataSource.data = reportCards;
    dataSource.paginator = this.paginator;
    dataSource.filterPredicate = (data: ReportCard, filter: string) => {
      const filterForm: IFilterForm = JSON.parse(filter);
      const idFilter = !filterForm.id || data.id === filterForm.id;
      const firstNameFilter =
        !filterForm.firstName ||
        data.firstName
          .toLowerCase()
          .includes(filterForm.firstName.toLowerCase());
      const lastNameFilter =
        !filterForm.lastName ||
        data.lastName.toLowerCase().includes(filterForm.lastName.toLowerCase());
      const emailFilter =
        !filterForm.email ||
        data.email.toLowerCase().includes(filterForm.email.toLowerCase());
      return firstNameFilter && lastNameFilter && emailFilter && idFilter;
    };
    return dataSource;
  }

  private reportsToReportCardList(reports: Report[]): ReportCard[] {
    return reports.map(report => {
      const reportCard: ReportCard = {
        id: report.id + '',
        firstName: report.author.first_name,
        lastName: report.author.last_name,
        email: report.author.email,
        description: report.description,
        observations: report.observations,
        modifyPath: `/update-report/${report.id}`,
        consultPath: `/report/${report.id}`,
      };
      return reportCard;
    });
  }
}
