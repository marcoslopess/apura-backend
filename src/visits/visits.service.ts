import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPool, Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class VisitsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VisitsService.name);
  private pool?: Pool;

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) return this.logger.warn('DATABASE_URL ausente: contador de acessos desativado');
    this.pool = createPool({ uri: url, connectionLimit: 5 });
    await this.pool.query(`CREATE TABLE IF NOT EXISTS acessos (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      visitante_id VARCHAR(64) NOT NULL,
      pagina VARCHAR(255) NOT NULL DEFAULT '/',
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_criado (criado_em), INDEX idx_visitante (visitante_id)
    )`);
    this.logger.log('Contador de acessos pronto (tabela acessos)');
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  async registrar(visitanteId: string, pagina: string) {
    if (!this.pool) return;
    await this.pool.execute('INSERT INTO acessos (visitante_id, pagina) VALUES (?, ?)', [
      visitanteId.slice(0, 64),
      (pagina || '/').slice(0, 255),
    ]);
  }

  async resumo() {
    if (!this.pool) return { total: 0, visitantesUnicos: 0, hoje: 0, visitantesHoje: 0, online: 0 };
    const [r] = await this.pool.query<RowDataPacket[]>(`SELECT
      COUNT(*) total,
      COUNT(DISTINCT visitante_id) visitantesUnicos,
      SUM(criado_em >= CURDATE()) hoje,
      COUNT(DISTINCT CASE WHEN criado_em >= CURDATE() THEN visitante_id END) visitantesHoje,
      COUNT(DISTINCT CASE WHEN criado_em >= NOW() - INTERVAL 5 MINUTE THEN visitante_id END) online
      FROM acessos`);
    const x = r[0];
    return {
      total: Number(x.total),
      visitantesUnicos: Number(x.visitantesUnicos),
      hoje: Number(x.hoje || 0),
      visitantesHoje: Number(x.visitantesHoje),
      online: Number(x.online),
    };
  }
}
