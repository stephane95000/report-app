import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ReportFormComponent } from '../report-form/report-form.component';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { ReportService } from '../shared/services/report.service';
import { Report } from '../shared/models/report.interface';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-update-report',
  standalone: true,
  imports: [
    ReportFormComponent,
    AsyncPipe,
    NgIf,
    NgTemplateOutlet,
    MatProgressSpinner,
  ],
  templateUrl: './update-report.component.html',
  styleUrl: './update-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateReportComponent implements OnInit {
  @Input() id?: number;
  public report$?: Observable<{ loading: boolean; value?: Report }>;

  constructor(private readonly reportService: ReportService) {}

  ngOnInit(): void {
    if (this.id) {
      this.report$ = this.reportService.getReportById(this.id).pipe(
        map(report => ({ loading: false, value: report })),
        startWith({ loading: true }),
        catchError(() => of({ loading: false }))
      );
    }
  }
}
