import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('HypeTrain API')
    .setDescription('Authentication and Authorization API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and Authorization')
    .addTag('workspace', 'Workspace Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Microservice configuration
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get('AUTH_SERVICE_HOST'),
      port: configService.get('AUTH_SERVICE_PORT'),
    },
  });

  // Start microservice and HTTP server
  await app.startAllMicroservices();
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
  console.log(`Swagger documentation is available at http://localhost:${port}/api`);
}
bootstrap();
