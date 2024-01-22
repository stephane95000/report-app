import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateReportComponent } from './update-report.component';
import { ReportService } from '../shared/services/report.service';
import { NotificationSnackbarService } from '../../shared/services/notification-snackbar.service';
import { Router } from '@angular/router';
import { ReportFormComponent } from '../report-form/report-form.component';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';
import { Report } from '../shared/models/report.interface';
import { Gender } from '../shared/models/gender.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpErrorResponse } from '@angular/common/http';

describe('UpdateReportComponent', () => {
  let component: UpdateReportComponent;
  let fixture: ComponentFixture<UpdateReportComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let notificationSnackbarService: jasmine.SpyObj<NotificationSnackbarService>;
  let router: jasmine.SpyObj<Router>;

  const selectors = {
    title: 'h1',
    form: 'app-report-form',
    loader: 'mat-spinner',
    errorBlock: 'p.update-report__empty',
  };

  beforeEach(async () => {
    reportService = jasmine.createSpyObj('ReportService', [
      'updateReport',
      'getReportById',
    ]);
    notificationSnackbarService = jasmine.createSpyObj(
      'NotificationSnackbarService',
      ['success']
    );
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [UpdateReportComponent, RouterTestingModule],
      providers: [
        { provide: ReportService, useValue: reportService },
        {
          provide: NotificationSnackbarService,
          useValue: notificationSnackbarService,
        },
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(UpdateReportComponent, {
        remove: {
          imports: [ReportFormComponent],
        },
        add: {
          imports: [MockComponent(ReportFormComponent)],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UpdateReportComponent);
    component = fixture.componentInstance;
  });

  it('should display the form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportMock: Report = {
      id: 1,
      observations: [],
      author: {
        first_name: 'firstName',
        last_name: 'LastName',
        email: 'email@.com',
        birth_date: new Date('1995-12-17'),
        sex: Gender.MALE,
      },
      description: 'description',
    };
    const reportSubject = new Subject<Report>();
    const reportSpy = reportService.getReportById.and.returnValue(
      reportSubject.asObservable()
    );

    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(compiled.querySelector(selectors.title)?.textContent).toContain(
      'Update report'
    );
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();

    reportSubject.next(reportMock);
    reportSubject.complete();
    fixture.detectChanges();

    expect(reportSpy).toHaveBeenCalledWith(1);
    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.form)).toBeTruthy();
  });

  it('should not display the form when report not found', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorResponse = new HttpErrorResponse({
      status: 404,
      error: {},
    });
    const reportSubject = new Subject<Report>();
    const reportSpy = reportService.getReportById.and.returnValue(
      reportSubject.asObservable()
    );

    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(compiled.querySelector(selectors.title)?.textContent).toContain(
      'Update report'
    );
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();

    reportSubject.error(errorResponse);
    reportSubject.complete();
    fixture.detectChanges();

    expect(reportSpy).toHaveBeenCalledWith(1);
    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeTruthy();
  });
});
