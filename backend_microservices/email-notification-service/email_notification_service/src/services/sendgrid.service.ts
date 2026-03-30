import sgMail from '@sendgrid/mail';
import { sendGridConfig } from '../config/app.config';
import { ExternalServiceError } from '../errors/custom-errors';
import { logger } from '../config/logger.config';

export interface ISendGridService {
  sendEmail(to: string, subject: string, html: string, text: string): Promise<void>;
}

export class SendGridService implements ISendGridService {
  constructor() {
    if (!sendGridConfig.apiKey) {
      logger.warn('SendGrid API key not configured');
    } else {
      sgMail.setApiKey(sendGridConfig.apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: {
          email: sendGridConfig.fromEmail,
          name: sendGridConfig.fromName,
        },
        subject,
        html,
        text,
      });

      logger.info({ to, subject }, 'Email sent successfully via SendGrid');
    } catch (error) {
      logger.error({ error, to, subject }, 'Failed to send email via SendGrid');
      throw new ExternalServiceError(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SENDGRID_ERROR'
      );
    }
  }
}
