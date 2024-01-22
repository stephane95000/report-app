import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportFormComponent } from '../report-form/report-form.component';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [ReportFormComponent],
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateReportComponent {}
