import { z } from 'zod';
import { ReportTypeEnum } from './report-request.dto';

export const ReportResponseSchema = z.object({
  reportId: z.string().regex(/^RPT-\d{8}-[A-Z0-9]{6}$/),
  reportType: ReportTypeEnum,
  generatedAt: z.string().datetime(),
  downloadUrl: z.string().url().regex(/^https?:\/\//),
  expiresAt: z.string().datetime(),
});

export type ReportResponseDto = z.infer<typeof ReportResponseSchema>;
