import { Knex } from 'knex';
import { ReportEntity } from '../entities/report.entity';
import { DatabaseError } from '../errors/application.error';
import { createLogger } from '../utils/logger';

const logger = createLogger('ReportRepository');

export interface IReportRepository {
  saveReport(report: ReportEntity): Promise<ReportEntity>;
  getReportById(reportId: string): Promise<ReportEntity | null>;
}

export class ReportRepository implements IReportRepository {
  constructor(private readonly db: Knex) {}

  async saveReport(report: ReportEntity): Promise<ReportEntity> {
    try {
      logger.info({ reportId: report.reportId }, 'Saving report to database');

      await this.db('reports').insert({
        report_id: report.reportId,
        report_type: report.reportType,
        as_of_date: report.asOfDate,
        format: report.format,
        total_accounts: report.totalAccounts,
        active_accounts: report.activeAccounts,
        suspended_accounts: report.suspendedAccounts,
        closed_accounts: report.closedAccounts,
        download_url: report.downloadUrl,
        created_at: report.createdAt,
      });

      logger.info({ reportId: report.reportId }, 'Report saved successfully');
      return report;
    } catch (error) {
      logger.error({ error, reportId: report.reportId }, 'Failed to save report');
      throw new DatabaseError('Failed to save report to database');
    }
  }

  async getReportById(reportId: string): Promise<ReportEntity | null> {
    try {
      logger.info({ reportId }, 'Fetching report from database');

      const row = await this.db('reports').select('*').where('report_id', reportId).first();

      if (!row) {
        logger.info({ reportId }, 'Report not found');
        return null;
      }

      const report: ReportEntity = {
        reportId: row.report_id,
        reportType: row.report_type,
        asOfDate: row.as_of_date,
        format: row.format,
        totalAccounts: row.total_accounts,
        activeAccounts: row.active_accounts,
        suspendedAccounts: row.suspended_accounts,
        closedAccounts: row.closed_accounts,
        downloadUrl: row.download_url,
        createdAt: row.created_at,
      };

      logger.info({ reportId }, 'Report fetched successfully');
      return report;
    } catch (error) {
      logger.error({ error, reportId }, 'Failed to fetch report');
      throw new DatabaseError('Failed to fetch report from database');
    }
  }
}
