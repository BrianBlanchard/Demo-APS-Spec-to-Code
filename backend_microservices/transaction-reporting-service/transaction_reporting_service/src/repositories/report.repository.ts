import { Knex } from 'knex';
import { ReportEntity } from '../entities/report.entity';
import { DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export interface IReportRepository {
  create(report: ReportEntity): Promise<ReportEntity>;
  findByReportId(reportId: string): Promise<ReportEntity | null>;
}

export class ReportRepository implements IReportRepository {
  private readonly tableName = 'reports';

  constructor(private readonly db: Knex) {}

  async create(report: ReportEntity): Promise<ReportEntity> {
    try {
      const [inserted] = await this.db(this.tableName)
        .insert({
          report_id: report.reportId,
          report_type: report.reportType,
          start_date: report.startDate,
          end_date: report.endDate,
          format: report.format,
          include_graphs: report.includeGraphs,
          generated_at: report.generatedAt,
          expires_at: report.expiresAt,
          download_url: report.downloadUrl,
          status: report.status,
        })
        .returning('*');

      return this.mapToEntity(inserted);
    } catch (error) {
      logger.error({ error }, 'Failed to create report in database');
      throw new DatabaseError('Failed to create report');
    }
  }

  async findByReportId(reportId: string): Promise<ReportEntity | null> {
    try {
      const row = await this.db(this.tableName).where({ report_id: reportId }).first();

      if (!row) {
        return null;
      }

      return this.mapToEntity(row);
    } catch (error) {
      logger.error({ error, reportId }, 'Failed to find report in database');
      throw new DatabaseError('Failed to find report');
    }
  }

  private mapToEntity(row: Record<string, unknown>): ReportEntity {
    return {
      id: row.id as string,
      reportId: row.report_id as string,
      reportType: row.report_type as ReportEntity['reportType'],
      startDate: new Date(row.start_date as string),
      endDate: new Date(row.end_date as string),
      format: row.format as ReportEntity['format'],
      includeGraphs: row.include_graphs as boolean,
      generatedAt: new Date(row.generated_at as string),
      expiresAt: new Date(row.expires_at as string),
      downloadUrl: row.download_url as string,
      status: row.status as ReportEntity['status'],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
