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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const visits_service_1 = require("./visits.service");
let VisitsController = class VisitsController {
    visits;
    constructor(visits) {
        this.visits = visits;
    }
    async registrar(body) {
        if (!body?.visitanteId || typeof body.visitanteId !== 'string') {
            throw new common_1.BadRequestException('visitanteId é obrigatório');
        }
        await this.visits.registrar(body.visitanteId, String(body.pagina || '/'));
        return this.visits.resumo();
    }
    resumo() {
        return this.visits.resumo();
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Registra um acesso e retorna o resumo atualizado' }),
    (0, swagger_1.ApiBody)({ schema: { example: { visitanteId: 'id-gerado-no-navegador', pagina: '/' } } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "registrar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Resumo: total, visitantes únicos, hoje e online (últimos 5 min)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "resumo", null);
exports.VisitsController = VisitsController = __decorate([
    (0, swagger_1.ApiTags)('Contador de acessos'),
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visits_service_1.VisitsService])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map