import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CitiesQueryController } from "./api/controllers/cities.query.controller";
import { FetchCityQueryHandler } from "./application/query/fetch-city.query.handler";

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [CitiesQueryController],
  providers: [FetchCityQueryHandler],
})
export class CitiesModule {}
