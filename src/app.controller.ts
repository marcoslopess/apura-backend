import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Saúde')
@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
