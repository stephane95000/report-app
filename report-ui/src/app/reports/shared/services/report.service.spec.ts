import { TestBed } from '@angular/core/testing';

import { ReportService } from './report.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Observation } from '../models/observation.interface';
import { Gender } from '../models/gender.enum';
import { Report } from '../models/report.interface';

describe('ReportService', () => {
  let service: ReportService;
  let httpController: HttpTestingController;

  const basePath = '/api/reporting';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ReportService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getObservations and return a list of observation', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1' },
      { id: 2, name: 'observation 2' },
    ];

    service.getObservations().subscribe(res => {
      expect(res).toEqual(observationsMock);
    });

    const req = httpController.expectOne({
      method: 'GET',
      url: `${basePath}/observations`,
    });

    req.flush(observationsMock);
  });

  it('should call getReportList and return a list of report', () => {
    const reportsMock: Report[] = [
      {
        id: 1,
        observations: [{ id: 1, name: 'Observation 1' }],
        author: {
          first_name: 'firstName',
          last_name: 'lastName',
          email: 'email@test.com',
          birth_date: new Date('01-01-2023'),
          sex: Gender.MALE,
        },
        description: 'description',
      },
      {
        id: 2,
        observations: [{ id: 1, name: 'Observation 1' }],
        author: {
          first_name: 'firstName',
          last_name: 'lastName',
          email: 'email2@test.com',
          birth_date: new Date('01-01-2023'),
          sex: Gender.MALE,
        },
        description: 'description',
      },
    ];

    service.getReportList().subscribe(res => {
      expect(res).toEqual(reportsMock);
    });

    const req = httpController.expectOne({
      method: 'GET',
      url: basePath,
    });

    req.flush(reportsMock);
  });

  it('should call getReportById and return a report', () => {
    const id = 1;
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      description: 'description',
    };

    service.getReportById(id).subscribe(res => {
      expect(res).toEqual(reportMock);
    });

    const req = httpController.expectOne({
      method: 'GET',
      url: `${basePath}/${id}`,
    });

    req.flush(reportMock);
  });
});
