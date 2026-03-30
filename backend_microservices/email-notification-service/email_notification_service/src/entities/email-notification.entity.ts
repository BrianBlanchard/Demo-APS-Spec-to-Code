import { EmailStatusType, EmailPriorityType } from '../dto/email-notification.dto';

export interface EmailNotification {
  id: string;
  to: string;
  templateId: string;
  templateData: Record<string, unknown>;
  priority: EmailPriorityType;
  status: EmailStatusType;
  sentAt: Date | null;
  retryCount: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  templateId: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  requiredFields: string[];
  createdAt: Date;
  updatedAt: Date;
}
