import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from './core/pipes/validation.pipe';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('combined'));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.SERVER_PORT, '0.0.0.0');
}
bootstrap();
