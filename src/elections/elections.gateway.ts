import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { CollectorService } from '../collector/collector.service';

@WebSocketGateway({ namespace: '/elections', cors: { origin: true, credentials: true } })
export class ElectionsGateway implements OnModuleInit, OnGatewayConnection {
  private readonly logger = new Logger(ElectionsGateway.name);
  @WebSocketServer() server!: Namespace;

  constructor(
    private readonly collector: CollectorService
  ) {}

  onModuleInit() {
    this.collector.updates$.subscribe((ev) => {
      this.server?.emit('RESULT_UPDATE', ev);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`WS conectado: ${client.id}`);
  }
}
