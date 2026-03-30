import { z } from 'zod';
import { Channel } from './channel.type';

const channelSchema = z.enum([Channel.EMAIL, Channel.SMS, Channel.PUSH]);

const transactionAlertsSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().nonnegative(),
  channels: z.array(channelSchema).min(1),
});

const notificationSettingSchema = z.object({
  enabled: z.boolean(),
  channels: z.array(channelSchema).min(1),
});

const marketingEmailsSchema = z.object({
  enabled: z.boolean(),
});

export const updateNotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  transactionAlerts: transactionAlertsSchema,
  paymentConfirmations: notificationSettingSchema,
  monthlyStatements: notificationSettingSchema,
  marketingEmails: marketingEmailsSchema,
});

export type UpdateNotificationPreferenceDto = z.infer<typeof updateNotificationPreferenceSchema>;

export interface TransactionAlerts {
  enabled: boolean;
  threshold: number;
  channels: string[];
}

export interface NotificationSetting {
  enabled: boolean;
  channels: string[];
}

export interface MarketingEmails {
  enabled: boolean;
}

export interface NotificationPreferenceResponseDto {
  customerId: string;
  preferences: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    transactionAlerts: TransactionAlerts;
    paymentConfirmations: NotificationSetting;
    monthlyStatements: NotificationSetting;
    marketingEmails: MarketingEmails;
  };
  updatedAt: string;
}
