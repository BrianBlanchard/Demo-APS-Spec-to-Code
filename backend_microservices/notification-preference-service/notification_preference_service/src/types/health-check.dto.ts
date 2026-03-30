export interface HealthCheckResponseDto {
  status: 'UP' | 'DOWN';
  timestamp: string;
  checks: {
    database: 'UP' | 'DOWN';
  };
}
