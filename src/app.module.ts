import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { VisitsController } from './visits/visits.controller';
import { VisitsService } from './visits/visits.service';
import { AppController } from './app.controller';
import { CacheService } from './cache/cache.service';
import { CollectorService } from './collector/collector.service';
import { ElectionsController } from './elections/elections.controller';
import { ElectionsGateway } from './elections/elections.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => [
        { ttl: Number(c.get('RATE_LIMIT_TTL_MS') || 60000), limit: Number(c.get('RATE_LIMIT_MAX') || 120) },
      ],
    }),
  ],
  controllers: [AppController, ElectionsController, VisitsController],
  providers: [VisitsService, CacheService, CollectorService, ElectionsGateway, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
