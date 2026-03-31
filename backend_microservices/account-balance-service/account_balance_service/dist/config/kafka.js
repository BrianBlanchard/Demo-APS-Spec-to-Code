"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeKafkaProducer = exports.getKafkaProducer = exports.createKafkaProducer = void 0;
const kafkajs_1 = require("kafkajs");
const index_1 = require("./index");
const logger_1 = require("../utils/logger");
const createKafkaProducer = () => {
    const kafka = new kafkajs_1.Kafka({
        clientId: index_1.config.kafka.clientId,
        brokers: index_1.config.kafka.brokers,
    });
    return kafka.producer();
};
exports.createKafkaProducer = createKafkaProducer;
let producerInstance = null;
const getKafkaProducer = async () => {
    if (!producerInstance) {
        producerInstance = (0, exports.createKafkaProducer)();
        await producerInstance.connect();
        logger_1.logger.info('Kafka producer connected');
    }
    return producerInstance;
};
exports.getKafkaProducer = getKafkaProducer;
const closeKafkaProducer = async () => {
    if (producerInstance) {
        await producerInstance.disconnect();
        producerInstance = null;
    }
};
exports.closeKafkaProducer = closeKafkaProducer;
//# sourceMappingURL=kafka.js.map