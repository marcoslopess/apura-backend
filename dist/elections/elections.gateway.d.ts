import { OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { CollectorService } from '../collector/collector.service';
export declare class ElectionsGateway implements OnModuleInit, OnGatewayConnection {
    private readonly collector;
    private readonly logger;
    server: Namespace;
    constructor(collector: CollectorService);
    onModuleInit(): void;
    handleConnection(client: Socket): void;
}
