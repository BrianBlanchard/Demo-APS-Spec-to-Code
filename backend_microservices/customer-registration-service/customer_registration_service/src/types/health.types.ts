export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks?: {
    database?: string;
    memory?: string;
  };
}
