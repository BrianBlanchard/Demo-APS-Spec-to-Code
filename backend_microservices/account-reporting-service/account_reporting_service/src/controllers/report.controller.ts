import { Request, Response, NextFunction } from 'express';
import { IReportService } from '../services/report.service';
import { GenerateReportRequestDto, GenerateReportResponseDto } from '../dtos/report.dto';

export class ReportController {
  constructor(private readonly reportService: IReportService) {}

  generateReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const request: GenerateReportRequestDto = req.body;
      const response: GenerateReportResponseDto = await this.reportService.generateReport(request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
