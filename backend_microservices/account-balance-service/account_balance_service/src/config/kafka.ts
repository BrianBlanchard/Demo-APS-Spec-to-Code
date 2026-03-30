import { Kafka, Producer } from 'kafkajs';
import { config } from './index';
import { logger } from '../utils/logger';

export const createKafkaProducer = (): Producer => {
  const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
  });

  return kafka.producer();
};

let producerInstance: Producer | null = null;

export const getKafkaProducer = async (): Promise<Producer> => {
  if (!producerInstance) {
    producerInstance = createKafkaProducer();
    await producerInstance.connect();
    logger.info('Kafka producer connected');
  }
  return producerInstance;
};

export const closeKafkaProducer = async (): Promise<void> => {
  if (producerInstance) {
    await producerInstance.disconnect();
    producerInstance = null;
  }
};
