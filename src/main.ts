require("module-alias/register");
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { GlobalExceptionFilter } from "./middleware/global-exception.handler";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // enable all levels
  });
  app.setGlobalPrefix("/api");
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port);
  Logger.log(`Listening on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
