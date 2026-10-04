import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Apura (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    process.env.COLLECTOR_DISABLED = 'true';
    const m = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = m.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());
  it('/api/health', () => request(app.getHttpServer()).get('/api/health').expect(200, { status: 'ok' }));
  it('president', async () => {
    const r = await request(app.getHttpServer()).get('/api/elections/2026/president').timeout(30000);
    expect(r.status).toBe(200);
    expect(r.body.payload.escopo.cargoCodigo).toBe('1');
  }, 40000);
});
