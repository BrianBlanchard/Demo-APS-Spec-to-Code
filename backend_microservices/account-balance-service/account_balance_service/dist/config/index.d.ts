export interface Config {
    env: string;
    port: number;
    logLevel: string;
    database: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        poolMin: number;
        poolMax: number;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        ttl: number;
    };
    jwt: {
        secret: string;
        issuer: string;
    };
    kafka: {
        brokers: string[];
        clientId: string;
        topicBalanceUpdated: string;
    };
    api: {
        timeoutBalanceRetrieval: number;
        timeoutBalanceUpdate: number;
        rateLimitPublic: number;
    };
    cors: {
        origin: string;
    };
}
export declare const config: Config;
//# sourceMappingURL=index.d.ts.map