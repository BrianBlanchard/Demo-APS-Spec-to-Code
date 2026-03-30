import Twilio from 'twilio';
import { config } from '../config/config';
import { TwilioApiError } from '../types/errors';

export interface SmsResult {
  messageId: string;
  status: string;
}

export interface ITwilioService {
  sendSms(to: string, message: string): Promise<SmsResult>;
}

export class TwilioService implements ITwilioService {
  private readonly client: Twilio.Twilio;

  constructor() {
    this.client = Twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async sendSms(to: string, message: string): Promise<SmsResult> {
    try {
      const result = await this.client.messages.create({
        from: config.twilio.fromNumber,
        to,
        body: message,
      });

      return {
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Twilio error';
      throw new TwilioApiError(`Failed to send SMS via Twilio: ${errorMessage}`);
    }
  }
}
