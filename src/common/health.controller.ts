import { Public } from '@/gateway/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
