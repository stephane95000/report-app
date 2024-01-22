import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportListComponent } from './report-list.component';
import { ReportService } from '../shared/services/report.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Report } from '../shared/models/report.interface';
import { Gender } from '../shared/models/gender.enum';
import { of, Subject } from 'rxjs';
import { MockComponent } from 'ng-mocks';
import { ReportFilterFormComponent } from '../report-filter-form/report-filter-form.component';
import { ReportCardComponent } from '../report-card/report-card.component';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ReportListComponent', () => {
  let component: ReportListComponent;
  let fixture: ComponentFixture<ReportListComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  const selectors = {
    cardsBlock: '.report-list__cards',
    errorBlock: 'p.report-list__empty',
    loader: 'mat-spinner',
    cards: 'app-report-card',
    filterForm: 'app-report-filter-form',
    emptyList: 'p.report-list__empty',
  };

  beforeEach(async () => {
    reportService = jasmine.createSpyObj('ReportService', ['getReportList']);

    await TestBed.configureTestingModule({
      imports: [ReportListComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ReportService, useValue: reportService }],
    })
      .overrideComponent(ReportListComponent, {
        remove: {
          imports: [ReportFilterFormComponent, ReportCardComponent],
        },
        add: {
          imports: [
            MockComponent(ReportFilterFormComponent),
            MockComponent(ReportCardComponent),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReportListComponent);
    component = fixture.componentInstance;
  });

  it('should render the list of report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportsMock: Report[] = Array(8)
      .fill({})
      .map((_, index) => ({
        id: index,
        observations: [],
        author: {
          first_name: `firstName${index}`,
          last_name: `lastName${index}`,
          email: `email${index}@test.com`,
          birth_date: new Date(`1995-12-17`),
          sex: Gender.NB,
        },
        description: `description${index}`,
      }));
    const reports$ = new Subject<Report[]>();
    const reportSpy = reportService.getReportList.and.returnValue(
      reports$.asObservable()
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(reportSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();

    reports$.next(reportsMock);
    reports$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.cardsBlock)).toBeTruthy();
    expect(compiled.querySelectorAll(selectors.cards).length).toBe(8);
  });

  it('should render the empty list block', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportsMock: Report[] = [];
    const reports$ = new Subject<Report[]>();
    const reportSpy = reportService.getReportList.and.returnValue(
      reports$.asObservable()
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(reportSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.cardsBlock)).toBeFalsy();
    expect(compiled.querySelector(selectors.emptyList)).toBeFalsy();

    reports$.next(reportsMock);
    reports$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.cardsBlock)).toBeFalsy();
    expect(compiled.querySelector(selectors.emptyList)).toBeTruthy();
    expect(compiled.querySelector(selectors.emptyList)?.textContent).toContain(
      'No data to display'
    );
  });

  it('should render the error block', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorResponse = new HttpErrorResponse({
      status: 500,
    });
    const reports$ = new Subject<Report[]>();
    const reportSpy = reportService.getReportList.and.returnValue(
      reports$.asObservable()
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(reportSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.cardsBlock)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();

    reports$.error(errorResponse);
    reports$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.cardsBlock)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)?.textContent).toContain(
      'Error loading the list of reports.'
    );
  });

  it('should filter the list when formChangeEvent is emit', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportsMock: Report[] = Array(8)
      .fill({})
      .map((_, index) => ({
        id: index,
        observations: [],
        author: {
          first_name: `firstName${index}`,
          last_name: `lastName${index}`,
          email: `email${index}@test.com`,
          birth_date: new Date(`1995-12-17`),
          sex: Gender.NB,
        },
        description: `description${index}`,
      }));
    reportService.getReportList.and.returnValue(of(reportsMock));
    fixture.detectChanges();

    const filterForm = fixture.debugElement.query(By.css(selectors.filterForm));
    filterForm.triggerEventHandler('formChangeEvent', { id: '1' });
    fixture.detectChanges();

    expect(compiled.querySelectorAll(selectors.cards).length).toBe(1);

    filterForm.triggerEventHandler('formChangeEvent', {
      firstName: 'firstName',
    });
    fixture.detectChanges();

    expect(compiled.querySelectorAll(selectors.cards).length).toBe(8);
  });
});
