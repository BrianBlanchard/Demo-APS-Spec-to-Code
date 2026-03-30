import { GenerateReportRequestDto, GenerateReportResponseDto } from '../dtos/report.dto';
import { ReportEntity } from '../entities/report.entity';
import { IAccountRepository } from '../repositories/account.repository';
import { IReportRepository } from '../repositories/report.repository';
import { IAuditService } from './audit.service';
import { generateReportId } from '../utils/id-generator';
import { getAppConfig } from '../config/app.config';
import { ValidationError, ReportGenerationError } from '../errors/application.error';
import { createLogger } from '../utils/logger';

const logger = createLogger('ReportService');

export interface IReportService {
  generateReport(request: GenerateReportRequestDto): Promise<GenerateReportResponseDto>;
}

export class ReportService implements IReportService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly reportRepository: IReportRepository,
    private readonly auditService: IAuditService
  ) {}

  async generateReport(request: GenerateReportRequestDto): Promise<GenerateReportResponseDto> {
    logger.info({ request }, 'Starting report generation');

    this.auditService.logEvent({
      action: 'GENERATE_REPORT',
      resource: 'report',
      status: 'success',
      details: { reportType: request.reportType },
    });

    try {
      const asOfDate = this.parseDate(request.asOfDate);
      this.validateDate(asOfDate);

      const summary = await this.accountRepository.getAccountSummaryByDate(asOfDate);

      const reportId = generateReportId();
      const downloadUrl = this.generateDownloadUrl(reportId, request.format);

      const reportEntity: ReportEntity = {
        reportId,
        reportType: request.reportType,
        asOfDate,
        format: request.format,
        totalAccounts: summary.totalAccounts,
        activeAccounts: summary.activeAccounts,
        suspendedAccounts: summary.suspendedAccounts,
        closedAccounts: summary.closedAccounts,
        downloadUrl,
        createdAt: new Date(),
      };

      await this.reportRepository.saveReport(reportEntity);

      const response: GenerateReportResponseDto = {
        reportId: reportEntity.reportId,
        reportType: reportEntity.reportType,
        totalAccounts: reportEntity.totalAccounts,
        activeAccounts: reportEntity.activeAccounts,
        suspendedAccounts: reportEntity.suspendedAccounts,
        closedAccounts: reportEntity.closedAccounts,
        downloadUrl: reportEntity.downloadUrl,
      };

      this.auditService.logEvent({
        action: 'GENERATE_REPORT',
        resource: 'report',
        resourceId: reportId,
        status: 'success',
        details: { reportType: request.reportType },
      });

      logger.info({ reportId, response }, 'Report generated successfully');
      return response;
    } catch (error) {
      this.auditService.logEvent({
        action: 'GENERATE_REPORT',
        resource: 'report',
        status: 'failure',
        details: { reportType: request.reportType },
      });

      logger.error({ error, request }, 'Report generation failed');

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ReportGenerationError('Failed to generate report');
    }
  }

  private parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  private validateDate(date: Date): void {
    const now = new Date();
    if (date > now) {
      throw new ValidationError('Date cannot be in the future');
    }

    const minDate = new Date('2000-01-01');
    if (date < minDate) {
      throw new ValidationError('Date cannot be before 2000-01-01');
    }
  }

  private generateDownloadUrl(reportId: string, format: string): string {
    const config = getAppConfig();
    return `${config.reportBaseUrl}/${reportId}.${format}`;
  }
}
