"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    if (process.env.TRUST_PROXY)
        app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
    const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const prod = process.env.NODE_ENV === 'production';
    app.enableCors({ origin: prod && origins.length ? origins : '*' });
    app.setGlobalPrefix('api', { exclude: ['api-docs'] });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Apura API — veltarc')
        .setDescription('Apuração eleitoral 2026: dados do TSE (simulado) normalizados. Tempo real: socket.io namespace /elections (evento RESULT_UPDATE) e SSE em /api/elections/stream.')
        .setVersion('1.0')
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    app.use('/api-docs', (_req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    swagger_1.SwaggerModule.setup('api-docs', app, doc, {
        customSiteTitle: 'Apura API',
        customfavIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="%231e3a8a"/></svg>',
        customCss: `body{background:#f8fafc}.swagger-ui .info .title{color:#0f172a}.swagger-ui .opblock-tag{color:#1e293b}.swagger-ui .info{margin:32px 0}`,
        swaggerOptions: { layout: 'BaseLayout' },
    });
    const port = Number(process.env.PORT || 3000);
    await app.listen(port);
    common_1.Logger.log(`Apura backend rodando na porta ${port}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map