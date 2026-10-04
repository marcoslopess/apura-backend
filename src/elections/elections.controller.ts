import { Controller, Get, MessageEvent, Param, Query, Sse } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { filter, map, Observable } from 'rxjs';
import { CollectorService } from '../collector/collector.service';

@ApiTags('Eleições 2026')
@Controller('elections')
export class ElectionsController {
  constructor(private readonly collector: CollectorService) {}

  @Get('2026/president')
  @ApiOperation({ summary: 'Resultado de Presidente (Brasil)' })
  president() {
    return this.collector.getResult('br', '1');
  }

  @Get('2026/states/:uf/governor')
  @ApiOperation({ summary: 'Resultado de Governador por UF' })
  @ApiParam({ name: 'uf', example: 'go' })
  governor(@Param('uf') uf: string) {
    return this.collector.getResult(uf, '3');
  }

  @Get('2026/states/:uf/senator')
  @ApiOperation({ summary: 'Resultado de Senador por UF' })
  @ApiParam({ name: 'uf', example: 'go' })
  senator(@Param('uf') uf: string) {
    return this.collector.getResult(uf, '5');
  }

  @Get('2026/states/:uf')
  @ApiOperation({ summary: 'Resultado por UF e cargo (1,3,5,6,7,8)' })
  @ApiParam({ name: 'uf', example: 'go' })
  @ApiQuery({ name: 'cargo', required: false, example: '6' })
  state(@Param('uf') uf: string, @Query('cargo') cargo = '3') {
    if (cargo === '7' && uf.toLowerCase() === 'df') cargo = '8';
    return this.collector.getResult(uf, cargo);
  }

  @Get('2026/municipalities/:codigo/results')
  @ApiOperation({ summary: 'Resultado por município (código TSE ou IBGE) e cargo' })
  @ApiParam({ name: 'codigo', example: '93734' })
  @ApiQuery({ name: 'cargo', required: false, example: '1' })
  municipality(@Param('codigo') codigo: string, @Query('cargo') cargo = '1') {
    return this.collector.getMunicipalityResult(codigo, cargo);
  }

  @Get('2026/municipalities')
  @ApiOperation({ summary: 'Lista de municípios (MunicipalityLookup[])' })
  @ApiQuery({ name: 'uf', required: false, example: 'go' })
  municipalities(@Query('uf') uf?: string) {
    return this.collector.getMunicipalities(uf);
  }

  @Get('2026/status/collector')
  @ApiOperation({ summary: 'Status do coletor (CollectorStatus)' })
  status() {
    return this.collector.getStatus();
  }

  @Sse('stream')
  @ApiOperation({ summary: 'SSE de atualizações (RESULT_UPDATE)' })
  @ApiQuery({ name: 'scopes', required: false, example: 'br,go' })
  stream(@Query('scopes') scopes?: string): Observable<MessageEvent> {
    const set = scopes ? new Set(scopes.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)) : null;
    return this.collector.updates$.pipe(
      filter((ev) => !set || set.has(ev.scope)),
      map((ev) => ({ type: 'RESULT_UPDATE', data: ev })),
    );
  }
}
