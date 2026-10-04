"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ElectionsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionsGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const collector_service_1 = require("../collector/collector.service");
let ElectionsGateway = ElectionsGateway_1 = class ElectionsGateway {
    collector;
    logger = new common_1.Logger(ElectionsGateway_1.name);
    server;
    constructor(collector) {
        this.collector = collector;
    }
    onModuleInit() {
        this.collector.updates$.subscribe((ev) => {
            this.server?.emit('RESULT_UPDATE', ev);
        });
    }
    handleConnection(client) {
        this.logger.log(`WS conectado: ${client.id}`);
    }
};
exports.ElectionsGateway = ElectionsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Namespace)
], ElectionsGateway.prototype, "server", void 0);
exports.ElectionsGateway = ElectionsGateway = ElectionsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/elections', cors: { origin: true, credentials: true } }),
    __metadata("design:paramtypes", [collector_service_1.CollectorService])
], ElectionsGateway);
//# sourceMappingURL=elections.gateway.js.map