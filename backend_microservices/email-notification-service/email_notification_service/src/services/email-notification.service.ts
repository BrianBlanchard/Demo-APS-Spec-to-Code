import { SendEmailRequest, EmailStatus, EmailStatusType } from '../dto/email-notification.dto';
import { IEmailTemplateRepository } from '../repositories/email-template.repository';
import { IEmailNotificationRepository } from '../repositories/email-notification.repository';
import { ISendGridService } from './sendgrid.service';
import { IAuditService } from './audit.service';
import { TemplateProcessor } from '../utils/template-processor';
import { generateNotificationId } from '../utils/id-generator';
import { TemplateError, EmailDeliveryError } from '../errors/custom-errors';
import { emailConfig } from '../config/app.config';
import { logger } from '../config/logger.config';

export interface EmailNotificationResult {
  notificationId: string;
  status: EmailStatusType;
  sentAt: string;
}

export interface IEmailNotificationService {
  sendEmail(request: SendEmailRequest): Promise<EmailNotificationResult>;
}

export class EmailNotificationService implements IEmailNotificationService {
  constructor(
    private readonly templateRepository: IEmailTemplateRepository,
    private readonly notificationRepository: IEmailNotificationRepository,
    private readonly sendGridService: ISendGridService,
    private readonly auditService: IAuditService
  ) {}

  async sendEmail(request: SendEmailRequest): Promise<EmailNotificationResult> {
    const notificationId = generateNotificationId();

    // Retrieve email template
    const template = await this.templateRepository.findByTemplateId(request.templateId);

    // Validate required fields
    const missingFields = TemplateProcessor.validateRequiredFields(
      request.templateData,
      template.requiredFields
    );

    if (missingFields.length > 0) {
      throw new TemplateError(
        `Missing required template fields: ${missingFields.join(', ')}`,
        'MISSING_TEMPLATE_FIELDS'
      );
    }

    // Populate template
    const subject = TemplateProcessor.populateTemplate(template.subject, request.templateData);
    const htmlContent = TemplateProcessor.populateTemplate(
      template.htmlContent,
      request.templateData
    );
    const textContent = TemplateProcessor.populateTemplate(
      template.textContent,
      request.templateData
    );

    // Create notification record
    await this.notificationRepository.create(notificationId, {
      to: request.to,
      templateId: request.templateId,
      templateData: request.templateData,
      priority: request.priority,
      status: EmailStatus.QUEUED,
      sentAt: null,
      retryCount: 0,
      errorMessage: null,
    });

    // Attempt to send email with retry logic
    const result = await this.sendEmailWithRetry(
      notificationId,
      request.to,
      subject,
      htmlContent,
      textContent,
      request.templateId
    );

    return result;
  }

  private async sendEmailWithRetry(
    notificationId: string,
    to: string,
    subject: string,
    html: string,
    text: string,
    templateId: string
  ): Promise<EmailNotificationResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < emailConfig.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          this.auditService.logRetryAttempt(notificationId, attempt);
          await this.notificationRepository.incrementRetryCount(notificationId);
          await this.delay(emailConfig.retryDelayMs * attempt);
        }

        await this.sendGridService.sendEmail(to, subject, html, text);

        const sentAt = new Date();
        await this.notificationRepository.updateStatus(
          notificationId,
          EmailStatus.SENT,
          sentAt
        );

        this.auditService.logEmailSent(notificationId, to, templateId);

        return {
          notificationId,
          status: EmailStatus.SENT,
          sentAt: sentAt.toISOString(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          { error: lastError, attempt, notificationId },
          'Email send attempt failed'
        );
        this.auditService.logEmailFailed(
          notificationId,
          to,
          lastError.message,
          attempt + 1
        );
      }
    }

    // All retries failed
    await this.notificationRepository.updateStatus(
      notificationId,
      EmailStatus.FAILED,
      undefined,
      lastError?.message || 'Unknown error'
    );

    this.auditService.logFinalFailure(notificationId, to);

    throw new EmailDeliveryError(
      `Failed to send email after ${emailConfig.retryAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
      'EMAIL_DELIVERY_FAILED'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
