import { Request, Response, NextFunction } from 'express';
import { IReportService } from '../services/report.service';
import { ReportRequestDto } from '../dto/report-request.dto';

export class ReportController {
  constructor(private readonly reportService: IReportService) {}

  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestDto: ReportRequestDto = req.body;
      const response = await this.reportService.generateReport(requestDto);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
