export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId?: string;
  details?: unknown;
}

export interface HealthResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  database?: {
    connected: boolean;
  };
}
