import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportWithId, Observation, CreateReport } from './reporting.dto';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('observations')
  getObservations(): Observation[] {
    return this.reportingService.getObservations();
  }

  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() report: CreateReport) {
    return this.reportingService.update(+id, report);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportingService.findById(+id);
  }

  @Get()
  findAll(): ReportWithId[] {
    return this.reportingService.findAll();
  }

  @Post()
  @HttpCode(204)
  add(@Body() report: CreateReport): ReportWithId {
    return this.reportingService.add(report);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportingService.remove(+id);
  }
}
