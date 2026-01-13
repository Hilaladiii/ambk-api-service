import './lib/instrument';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './commons/providers/interceptor/response/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './commons/filters/http-exception.filter';
import { setupSwagger } from './lib/swagger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
