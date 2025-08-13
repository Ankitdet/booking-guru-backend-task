import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CountryNowServiceProvider } from "../../../../core-common/country-now-service/contry-now-service.provider";
import { CountryPollutionServiceProvider } from "../../../../core-common/country-pollution-service/country-pollution-service.provider";
import { WikipediaServiceProvider } from "../../../../core-common/wikipedia-service/wikipedia-servicer.provider";
import { HttpError } from "../../errors/http-error";
import {
  ApiResponse,
  CityPollutionData,
  MetaData,
} from "../abstraction/city-pollution-data.interface";
import { GetCitiesQuery } from "./fetch-city.query";
import { Logger } from "@nestjs/common";

@QueryHandler(GetCitiesQuery)
export class FetchCityQueryHandler implements IQueryHandler<GetCitiesQuery> {
  private readonly logger = new Logger(FetchCityQueryHandler.name);

  constructor(
    private readonly wikipediaServiceProvider: WikipediaServiceProvider,
    private readonly countryNowServiceProvider: CountryNowServiceProvider,
    private readonly countryServiceProvider: CountryPollutionServiceProvider
  ) {}

  async execute(query: GetCitiesQuery): Promise<any> {
    this.logger.log(
      `Executing FetchCityQueryHandler for country: ${query.country}, page: ${query.page}, limit: ${query.limit}`
    );

    const { country: countryCode, limit, page, token } = query;

    const countryName = await this.getCountryNameByCountryCode(countryCode);
    if (countryName === "") {
      this.logger.warn(`Country with code ${countryCode} not found`);
      throw new HttpError(
        `Country with code ${countryCode} not found`,
        404,
        "Not Found"
      );
    }

    const validCities = await this.fetchCitiesByCountry(countryName);
    if (validCities.length === 0) {
      this.logger.warn(`No valid cities found for country ${countryName}`);
      throw new HttpError(
        `No valid cities found for country ${countryName}`,
        404,
        "Not Found"
      );
    }
    const data: ApiResponse =
      await this.countryServiceProvider.fetchPollutionDataByCountry(
        countryCode,
        page,
        limit,
        token
      );
    const metadata: MetaData = data.meta;
    const pollutionData: CityPollutionData[] = data.results || [];

    if (pollutionData.length === 0) {
      this.logger.warn(`No pollution data found for country ${countryName}`);
      throw new HttpError(
        `No pollution data found for country ${countryName}`,
        404,
        "Not Found"
      );
    }
    this.logger.log(
      `Fetched ${pollutionData.length} pollution records for country ${countryName}`
    );

    // Fetch Wikipedia data for current page, passing pollution info
    const uniqueCityPollution = this.normalizeCityPollutionAndMakeUnique(
      pollutionData,
      validCities
    );
    this.logger.log(
      `Normalized and filtered to ${uniqueCityPollution.length} unique city records`
    );

    const cityAndPollution = await Promise.all(
      uniqueCityPollution.map((pair) =>
        this.fetchWikipediaData(pair.city, pair.pollution)
      )
    );
    this.logger.log(
      `Fetched Wikipedia data for ${cityAndPollution.length} cities`
    );

    return {
      page,
      limit,
      totalPages: metadata.totalPages,
      total: limit * metadata.totalPages,
      cities: cityAndPollution,
    };
  }

  private async getCountryNameByCountryCode(countryCode: string) {
    return await this.countryNowServiceProvider.getCountryNameByCountryCode(
      countryCode
    );
  }

  private async fetchCitiesByCountry(countryName: string) {
    return await this.countryNowServiceProvider.fetchCitiesByCountry(
      countryName
    );
  }

  // Normalize city names
  private normalizeCityName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/ *\([^)]*\) */g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Filter out non-city entries
  private isValidCity(name: string): boolean {
    const bannedKeywords = ["district", "area", "zone", "unknown point"];
    return !bannedKeywords.some((keyword) =>
      name.toLowerCase().includes(keyword)
    );
  }

  private async fetchWikipediaData(cityName: string, pollution: number) {
    return this.wikipediaServiceProvider.fetchCitySummary(cityName, pollution);
  }

  private normalizeCityPollutionAndMakeUnique(
    pollutionData: CityPollutionData[],
    validCities: string[]
  ) {
    const cityPollutionPairs = pollutionData
      .map((item) => ({
        city: this.normalizeCityName(item.name),
        pollution: item.pollution || "Unknown",
      }))
      .filter((pair) => this.isValidCity(pair.city))
      .filter((pair) => validCities.includes(pair.city));

    // Remove duplicates by city name
    const uniqueCityPollution = [];
    const seen = new Set();
    for (const pair of cityPollutionPairs) {
      if (!seen.has(pair.city)) {
        seen.add(pair.city);
        uniqueCityPollution.push(pair);
      }
    }
    return uniqueCityPollution;
  }
}
