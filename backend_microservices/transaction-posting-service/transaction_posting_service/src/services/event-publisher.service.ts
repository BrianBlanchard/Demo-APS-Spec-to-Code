import { Kafka, Producer } from 'kafkajs';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { Transaction } from '../models/transaction.model';

export interface TransactionPostedEvent {
  transactionId: string;
  accountId: string;
  cardNumber: string;
  amount: number;
  transactionType: string;
  merchantName: string;
  postedTimestamp: string;
  previousBalance: number;
  newBalance: number;
}

export interface EventPublisher {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishTransactionPosted(transaction: Transaction, previousBalance: number, newBalance: number): Promise<void>;
}

export class EventPublisherImpl implements EventPublisher {
  private producer: Producer;
  private kafka: Kafka;
  private connected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        retries: 3,
        initialRetryTime: 100,
        multiplier: 2,
      },
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.producer.connect();
      this.connected = true;
      logger.info('Kafka producer connected');
    } catch (error) {
      logger.error({ error }, 'Failed to connect Kafka producer');
      // Don't throw - allow service to start even if Kafka is down
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.connected = false;
      logger.info('Kafka producer disconnected');
    } catch (error) {
      logger.error({ error }, 'Failed to disconnect Kafka producer');
    }
  }

  async publishTransactionPosted(
    transaction: Transaction,
    previousBalance: number,
    newBalance: number,
  ): Promise<void> {
    const event: TransactionPostedEvent = {
      transactionId: transaction.transactionId,
      accountId: transaction.accountId,
      cardNumber: this.maskCardNumber(transaction.cardNumber),
      amount: transaction.transactionAmount,
      transactionType: transaction.transactionType,
      merchantName: transaction.merchantName,
      postedTimestamp: transaction.postedTimestamp.toISOString(),
      previousBalance,
      newBalance,
    };

    try {
      if (!this.connected) {
        logger.warn('Kafka producer not connected, event will be lost');
        // In production, implement a queue for retry
        return;
      }

      await this.producer.send({
        topic: config.kafka.topicTransactionPosted,
        messages: [
          {
            key: transaction.accountId,
            value: JSON.stringify(event),
            timestamp: transaction.postedTimestamp.getTime().toString(),
          },
        ],
      });

      logger.info(
        { transactionId: transaction.transactionId, accountId: transaction.accountId },
        'Transaction posted event published',
      );
    } catch (error) {
      logger.error(
        { error, transactionId: transaction.transactionId },
        'Failed to publish transaction posted event',
      );
      // Don't throw - transaction was already posted successfully
      // In production, implement a retry queue
    }
  }

  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      return '****';
    }
    return `************${cardNumber.slice(-4)}`;
  }
}
