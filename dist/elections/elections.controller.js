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
exports.ElectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const collector_service_1 = require("../collector/collector.service");
let ElectionsController = class ElectionsController {
    collector;
    constructor(collector) {
        this.collector = collector;
    }
    president() {
        return this.collector.getResult('br', '1');
    }
    governor(uf) {
        return this.collector.getResult(uf, '3');
    }
    senator(uf) {
        return this.collector.getResult(uf, '5');
    }
    state(uf, cargo = '3') {
        if (cargo === '7' && uf.toLowerCase() === 'df')
            cargo = '8';
        return this.collector.getResult(uf, cargo);
    }
    municipality(codigo, cargo = '1') {
        return this.collector.getMunicipalityResult(codigo, cargo);
    }
    municipalities(uf) {
        return this.collector.getMunicipalities(uf);
    }
    status() {
        return this.collector.getStatus();
    }
    stream(scopes) {
        const set = scopes ? new Set(scopes.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)) : null;
        return this.collector.updates$.pipe((0, rxjs_1.filter)((ev) => !set || set.has(ev.scope)), (0, rxjs_1.map)((ev) => ({ type: 'RESULT_UPDATE', data: ev })));
    }
};
exports.ElectionsController = ElectionsController;
__decorate([
    (0, common_1.Get)('2026/president'),
    (0, swagger_1.ApiOperation)({ summary: 'Resultado de Presidente (Brasil)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "president", null);
__decorate([
    (0, common_1.Get)('2026/states/:uf/governor'),
    (0, swagger_1.ApiOperation)({ summary: 'Resultado de Governador por UF' }),
    (0, swagger_1.ApiParam)({ name: 'uf', example: 'go' }),
    __param(0, (0, common_1.Param)('uf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "governor", null);
__decorate([
    (0, common_1.Get)('2026/states/:uf/senator'),
    (0, swagger_1.ApiOperation)({ summary: 'Resultado de Senador por UF' }),
    (0, swagger_1.ApiParam)({ name: 'uf', example: 'go' }),
    __param(0, (0, common_1.Param)('uf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "senator", null);
__decorate([
    (0, common_1.Get)('2026/states/:uf'),
    (0, swagger_1.ApiOperation)({ summary: 'Resultado por UF e cargo (1,3,5,6,7,8)' }),
    (0, swagger_1.ApiParam)({ name: 'uf', example: 'go' }),
    (0, swagger_1.ApiQuery)({ name: 'cargo', required: false, example: '6' }),
    __param(0, (0, common_1.Param)('uf')),
    __param(1, (0, common_1.Query)('cargo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "state", null);
__decorate([
    (0, common_1.Get)('2026/municipalities/:codigo/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Resultado por município (código TSE ou IBGE) e cargo' }),
    (0, swagger_1.ApiParam)({ name: 'codigo', example: '93734' }),
    (0, swagger_1.ApiQuery)({ name: 'cargo', required: false, example: '1' }),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, common_1.Query)('cargo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "municipality", null);
__decorate([
    (0, common_1.Get)('2026/municipalities'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista de municípios (MunicipalityLookup[])' }),
    (0, swagger_1.ApiQuery)({ name: 'uf', required: false, example: 'go' }),
    __param(0, (0, common_1.Query)('uf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "municipalities", null);
__decorate([
    (0, common_1.Get)('2026/status/collector'),
    (0, swagger_1.ApiOperation)({ summary: 'Status do coletor (CollectorStatus)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElectionsController.prototype, "status", null);
__decorate([
    (0, common_1.Sse)('stream'),
    (0, swagger_1.ApiOperation)({ summary: 'SSE de atualizações (RESULT_UPDATE)' }),
    (0, swagger_1.ApiQuery)({ name: 'scopes', required: false, example: 'br,go' }),
    __param(0, (0, common_1.Query)('scopes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], ElectionsController.prototype, "stream", null);
exports.ElectionsController = ElectionsController = __decorate([
    (0, swagger_1.ApiTags)('Eleições 2026'),
    (0, common_1.Controller)('elections'),
    __metadata("design:paramtypes", [collector_service_1.CollectorService])
], ElectionsController);
//# sourceMappingURL=elections.controller.js.map