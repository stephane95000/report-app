import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReport,
  Observation,
  Report,
  ReportWithId,
} from './reporting.dto';

@Injectable()
export class ReportingService {
  private idCount = 1;
  private reports: ReportWithId[] = [];
  private observations: Observation[] = [
    { id: 1, name: 'Observation 1' },
    { id: 2, name: 'Observation 2' },
    { id: 3, name: 'Observation 3' },
  ];

  public findAll(): ReportWithId[] {
    return this.reports;
  }

  public findById(id: number): ReportWithId | null {
    const report = this.reports.find((report) => report.id === id);
    if (report) {
      return report;
    } else {
      throw new NotFoundException();
    }
  }

  public getObservations(): Observation[] {
    return this.observations;
  }

  public add(report: CreateReport): ReportWithId {
    if (
      !this.reports.find((value) => value.author.email === report.author.email)
    ) {
      const { observations, ...rest } = report;
      const obs = this.observations.filter((v) => observations.includes(v.id));
      const newReport = { id: this.idCount, observations: obs, ...rest };
      this.reports.push(newReport);
      this.idCount++;
      return newReport;
    } else {
      const error = { author: { email: ['This value already exist'] } };
      throw new BadRequestException(error);
    }
  }

  public update(id: number, report: CreateReport): Report {
    const currReport = this.findById(id);
    if (currReport) {
      if (
        !this.reports.find(
          (value) =>
            value.id !== id && value.author.email === report.author.email,
        )
      ) {
        const { observations } = report;
        const obs = this.observations.filter((v) =>
          observations.includes(v.id),
        );
        currReport.author = report.author;
        currReport.description = report.description;
        currReport.observations = obs;
      } else {
        const error = { author: { email: ['This value already exist'] } };
        throw new BadRequestException(error);
      }
    }
    return currReport;
  }

  public remove(id: number): void {
    this.reports = this.reports.filter((report) => report.id !== id);
  }
}
