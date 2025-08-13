import { Module } from "@nestjs/common";
import { WikipediaServiceProvider } from "./wikipedia-service/wikipedia-servicer.provider";
import { CountryNowServiceProvider } from "./country-now-service/contry-now-service.provider";

@Module({
  providers: [WikipediaServiceProvider, CountryNowServiceProvider],
  exports: [WikipediaServiceProvider, CountryNowServiceProvider],
})
export class CoreCommonModule {}
