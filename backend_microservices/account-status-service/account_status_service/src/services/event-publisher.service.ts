import { Kafka, Producer } from 'kafkajs';
import { logger } from '../utils/logger';
import { AccountStatus } from '../enums/account-status.enum';
import { StatusChangeReason } from '../enums/status-change-reason.enum';

export interface AccountStatusChangedEvent {
  accountId: string;
  previousStatus: AccountStatus;
  newStatus: AccountStatus;
  reason: StatusChangeReason;
  effectiveDate: Date;
  updatedBy: string;
}

export interface AccountClosedWithBalanceEvent {
  accountId: string;
  balance: number;
  closedDate: Date;
  closedBy: string;
}

export interface IEventPublisher {
  publishAccountStatusChanged(event: AccountStatusChangedEvent): Promise<void>;
  publishAccountClosedWithBalance(event: AccountClosedWithBalanceEvent): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export class EventPublisher implements IEventPublisher {
  private producer: Producer;
  private readonly statusChangedTopic: string;
  private readonly closedWithBalanceTopic: string;

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'account-status-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.producer = kafka.producer();
    this.statusChangedTopic =
      process.env.KAFKA_TOPIC_STATUS_CHANGED || 'account.status.changed';
    this.closedWithBalanceTopic =
      process.env.KAFKA_TOPIC_CLOSED_WITH_BALANCE || 'account.closed.with.balance';
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    logger.info('Kafka producer connected');
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    logger.info('Kafka producer disconnected');
  }

  async publishAccountStatusChanged(event: AccountStatusChangedEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: this.statusChangedTopic,
        messages: [
          {
            key: event.accountId,
            value: JSON.stringify(event),
            timestamp: new Date().getTime().toString(),
          },
        ],
      });

      logger.info('AccountStatusChanged event published', {
        accountId: event.accountId,
        newStatus: event.newStatus,
      });
    } catch (error) {
      logger.error('Failed to publish AccountStatusChanged event', error as Error, {
        accountId: event.accountId,
      });
      throw error;
    }
  }

  async publishAccountClosedWithBalance(event: AccountClosedWithBalanceEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: this.closedWithBalanceTopic,
        messages: [
          {
            key: event.accountId,
            value: JSON.stringify(event),
            timestamp: new Date().getTime().toString(),
          },
        ],
      });

      logger.info('AccountClosedWithBalance event published', {
        accountId: event.accountId,
        balance: event.balance,
      });
    } catch (error) {
      logger.error('Failed to publish AccountClosedWithBalance event', error as Error, {
        accountId: event.accountId,
      });
      throw error;
    }
  }
}
