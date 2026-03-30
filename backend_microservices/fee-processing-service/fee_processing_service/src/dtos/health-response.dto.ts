export interface HealthResponseDto {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
}
