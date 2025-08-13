import { HttpModule } from "@nestjs/axios";
import {
  Global,
  MiddlewareConsumer,
  Module
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { CoreCommonModule } from "./core-common/core-common.module";
import { TokenMiddleware } from "./middleware/auth-middleware";
import { CitiesModule } from "./routes/cities/city.module";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    HttpModule,
    CoreCommonModule,
    CitiesModule,
  ],
  exports: [CoreCommonModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenMiddleware).forRoutes("*");
  }
}
