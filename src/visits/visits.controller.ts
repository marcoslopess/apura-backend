import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitsService } from './visits.service';

@ApiTags('Contador de acessos')
@Controller('visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Registra um acesso e retorna o resumo atualizado' })
  @ApiBody({ schema: { example: { visitanteId: 'id-gerado-no-navegador', pagina: '/' } } })
  async registrar(@Body() body: { visitanteId?: string; pagina?: string }) {
    if (!body?.visitanteId || typeof body.visitanteId !== 'string') {
      throw new BadRequestException('visitanteId é obrigatório');
    }
    await this.visits.registrar(body.visitanteId, String(body.pagina || '/'));
    return this.visits.resumo();
  }

  @Get()
  @ApiOperation({ summary: 'Resumo: total, visitantes únicos, hoje e online (últimos 5 min)' })
  resumo() {
    return this.visits.resumo();
  }
}
