import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDetailsComponent } from './report-details.component';
import { ReportService } from '../shared/services/report.service';
import { of, Subject, throwError } from 'rxjs';
import { Report } from '../shared/models/report.interface';
import { Gender } from '../shared/models/gender.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BackNavigationService } from '../../shared/services/back-navigation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MockComponent, MockModule } from 'ng-mocks';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

describe('ReportDetailsComponent', () => {
  let component: ReportDetailsComponent;
  let fixture: ComponentFixture<ReportDetailsComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let backNavService: jasmine.SpyObj<BackNavigationService>;

  const selectors = {
    authorLabels: '.report-details__card-info > p',
    description: '.report-details__description-block > p',
    observationBlock: '.report-details__card-observations',
    observations: 'mat-chip',
    updateLink: '.report-details__actions > a',
    goBackButton: '.report-details__actions > button',
    errorBlock: 'p.report-details__empty',
    loader: 'mat-spinner',
  };

  beforeEach(async () => {
    reportService = jasmine.createSpyObj('ReportService', ['getReportById']);
    backNavService = jasmine.createSpyObj('BackNavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [ReportDetailsComponent, RouterTestingModule],
      providers: [
        { provide: ReportService, useValue: reportService },
        { provide: BackNavigationService, useValue: backNavService },
        DatePipe,
      ],
    })
      .overrideComponent(ReportDetailsComponent, {
        remove: {
          imports: [
            MatCardModule,
            MatButtonModule,
            MatProgressSpinner,
            MatChipsModule,
          ],
        },
        add: {
          imports: [
            MockModule(MatCardModule),
            MockModule(MatButtonModule),
            MockModule(MatChipsModule),
            MockComponent(MatProgressSpinner),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReportDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create report details with all fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'Stef',
        last_name: 'Doe',
        email: 'xxxxaxa.xxxxxxxxxxs@txxestx.com',
        birth_date: new Date('1995-12-17T03:24:00'),
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
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();
    expect(compiled.querySelectorAll(selectors.authorLabels).length).toEqual(0);

    reportSubject.next(reportMock);
    reportSubject.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();
    expect(component.id).toEqual(1);
    expect(reportSpy).toHaveBeenCalledWith(1);
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[0].textContent
    ).toContain(reportMock.id);
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[1].textContent
    ).toContain(reportMock.author.first_name);
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[2].textContent
    ).toContain(reportMock.author.last_name);
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[3].textContent
    ).toContain(reportMock.author.email);
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[4].textContent
    ).toContain('December 17, 1995');
    expect(
      compiled.querySelectorAll(selectors.authorLabels)[5].textContent
    ).toContain(reportMock.author.sex);
    expect(
      compiled.querySelector(selectors.description)?.textContent
    ).toContain(reportMock.description);
    expect(
      compiled.querySelectorAll(selectors.observations)[0].textContent
    ).toContain(reportMock.observations[0].name);
    expect(
      compiled.querySelector(selectors.updateLink)?.getAttribute('href')
    ).toEqual(`/update-report/${reportMock.id}`);
  });

  it('should create report details without observations block', () => {
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
    reportService.getReportById.and.returnValue(reportSubject.asObservable());

    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();
    expect(compiled.querySelectorAll(selectors.authorLabels).length).toEqual(0);

    reportSubject.next(reportMock);
    reportSubject.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();
    expect(compiled.querySelector(selectors.observationBlock)).toBeFalsy();
  });

  it('should call backNavigationService when go back button clicked', () => {
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
    reportService.getReportById.and.returnValue(of(reportMock));
    const backSpy = backNavService.back.and.returnValue();

    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();

    const goBackButton = fixture.debugElement.query(
      By.css(selectors.goBackButton)
    );
    goBackButton.triggerEventHandler('click');

    expect(backSpy).toHaveBeenCalled();
  });

  it('should display error block', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorResponse = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
    });
    const reportSubject = new Subject<Report>();
    reportService.getReportById.and.returnValue(reportSubject.asObservable());

    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();
    expect(compiled.querySelectorAll(selectors.authorLabels).length).toEqual(0);

    reportSubject.error(throwError(() => errorResponse));
    reportSubject.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.errorBlock)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)?.textContent).toContain(
      'Error loading the report details'
    );
  });
});
