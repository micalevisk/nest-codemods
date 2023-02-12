import { Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
): void {
  const logger: Logger = new Logger('Swagger');
  const swaggerEndpoint = '/api-docs';

  const options = new DocumentBuilder()
    .setTitle('Tarken Hub API')
    .setDescription('Tarken Hub API documentation')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(swaggerEndpoint, app, document, {
    customSiteTitle: 'Tarken Hub API',
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
      withCredentials: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      defaultModelRendering: 'model',
    },
  });

  logger.log(`Added swagger on endpoint ${swaggerEndpoint}`);
}
