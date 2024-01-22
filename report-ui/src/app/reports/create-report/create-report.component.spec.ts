import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReportComponent } from './create-report.component';
import { MockComponent } from 'ng-mocks';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReportService } from '../shared/services/report.service';
import { NotificationSnackbarService } from '../../shared/services/notification-snackbar.service';
import { Router } from '@angular/router';

describe('CreateReportComponent', () => {
  let component: CreateReportComponent;
  let fixture: ComponentFixture<CreateReportComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let notificationSnackbarService: jasmine.SpyObj<NotificationSnackbarService>;
  let router: jasmine.SpyObj<Router>;

  const selectors = {
    title: 'h1',
    form: 'app-report-form',
  };

  beforeEach(async () => {
    reportService = jasmine.createSpyObj('ReportService', ['createReport']);
    notificationSnackbarService = jasmine.createSpyObj(
      'NotificationSnackbarService',
      ['success']
    );
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [CreateReportComponent, RouterTestingModule],
      providers: [
        { provide: ReportService, useValue: reportService },
        {
          provide: NotificationSnackbarService,
          useValue: notificationSnackbarService,
        },
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(CreateReportComponent, {
        remove: {
          imports: [ReportFormComponent],
        },
        add: {
          imports: [MockComponent(ReportFormComponent)],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display component and form', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(component).toBeTruthy();
    expect(compiled.querySelector(selectors.title)?.textContent).toContain(
      'Create report'
    );
    expect(compiled.querySelector(selectors.form)).toBeTruthy();
  });
});
