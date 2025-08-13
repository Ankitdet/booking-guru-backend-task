import { Module } from "@nestjs/common";
import { WikipediaServiceProvider } from "./wikipedia-service/wikipedia-servicer.provider";
import { CountryNowServiceProvider } from "./country-now-service/contry-now-service.provider";
import { CountryPollutionServiceProvider } from "./country-pollution-service/country-pollution-service.provider";

@Module({
  providers: [
    WikipediaServiceProvider,
    CountryNowServiceProvider,
    CountryPollutionServiceProvider,
  ],
  exports: [
    WikipediaServiceProvider,
    CountryNowServiceProvider,
    CountryPollutionServiceProvider,
  ],
})
export class CoreCommonModule {}
