"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabaseConnection = exports.getDatabase = exports.createDatabaseConnection = void 0;
const knex_1 = __importDefault(require("knex"));
const index_1 = require("./index");
const createDatabaseConnection = () => {
    return (0, knex_1.default)({
        client: 'pg',
        connection: {
            host: index_1.config.database.host,
            port: index_1.config.database.port,
            database: index_1.config.database.database,
            user: index_1.config.database.user,
            password: index_1.config.database.password,
        },
        pool: {
            min: index_1.config.database.poolMin,
            max: index_1.config.database.poolMax,
        },
        acquireConnectionTimeout: 10000,
    });
};
exports.createDatabaseConnection = createDatabaseConnection;
let dbInstance = null;
const getDatabase = () => {
    if (!dbInstance) {
        dbInstance = (0, exports.createDatabaseConnection)();
    }
    return dbInstance;
};
exports.getDatabase = getDatabase;
const closeDatabaseConnection = async () => {
    if (dbInstance) {
        await dbInstance.destroy();
        dbInstance = null;
    }
};
exports.closeDatabaseConnection = closeDatabaseConnection;
//# sourceMappingURL=database.js.map