import { catchError, map, Observable, of, startWith } from 'rxjs';
import { ReportService } from '../shared/services/report.service';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Report } from '../shared/models/report.interface';
import {
  AsyncPipe,
  DatePipe,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { BackNavigationService } from '../../shared/services/back-navigation.service';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinner,
    MatChipsModule,
    RouterLink,
    DatePipe,
  ],
  templateUrl: './report-details.component.html',
  styleUrl: './report-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsComponent implements OnInit {
  @Input() id?: number;
  public report$?: Observable<{ loading: boolean; value?: Report }>;

  constructor(
    private readonly reportService: ReportService,
    private readonly backNavigationService: BackNavigationService
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.report$ = this.reportService.getReportById(this.id).pipe(
        map(report => ({ loading: false, value: report })),
        startWith({ loading: true }),
        catchError(() => of({ loading: false }))
      );
    }
  }

  public goBack(): void {
    this.backNavigationService.back();
  }
}
