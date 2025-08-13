import { ConfigService } from "@nestjs/config";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CountryNowServiceProvider } from "../../../../core-common/country-now-service/contry-now-service.provider";
import { WikipediaServiceProvider } from "../../../../core-common/wikipedia-service/wikipedia-servicer.provider";
import { HttpError } from "../../errors/http-error";
import {
  ApiResponse,
  CityPollutionData,
  MetaData,
} from "../abstraction/city-pollution-data.interface";
import { GetCitiesQuery } from "./fetch-city.query";

@QueryHandler(GetCitiesQuery)
export class FetchCityQueryHandler implements IQueryHandler<GetCitiesQuery> {
  private readonly MOCK_API_URL: string;

  constructor(
    private configService: ConfigService,
    private readonly wikipediaServiceProvider: WikipediaServiceProvider,
    private readonly countryNowServiceProvider: CountryNowServiceProvider
  ) {
    this.MOCK_API_URL = this.configService.get<string>("MOCK_API_URL");
  }

  async execute(query: GetCitiesQuery): Promise<any> {
    const { country: countryCode, limit, page, token } = query;

    const countryName = await this.getCountryNameByCountryCode(countryCode);
    if (countryName === "") {
      throw new HttpError(
        `Country with code ${countryCode} not found`,
        404,
        "Not Found"
      );
    }

    const validCities = await this.fetchCitiesByCountry(countryName);
    if (validCities.length === 0) {
      throw new HttpError(
        `No valid cities found for country ${countryName}`,
        404,
        "Not Found"
      );
    }
    // Fetch from mock API
    const mockRes = await fetch(
      `${this.MOCK_API_URL}/pollution?country=${countryCode}&page=${page}&limit=${limit}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    const data: ApiResponse | any = await mockRes.json();
    if (data?.error) {
      throw new HttpError(
        data.error,
        mockRes.status,
        "Failed to fetch pollution data"
      );
    }
    if (!data || !data.meta || !data.results) {
      throw new HttpError(
        "Invalid response from mock API",
        500,
        "Internal Server Error"
      );
    }
    const metadata: MetaData = data.meta;
    const pollutionData: CityPollutionData[] = data.results || [];

    if (pollutionData.length === 0) {
      throw new HttpError(
        `No pollution data found for country ${countryName}`,
        404,
        "Not Found"
      );
    }

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
    // Fetch Wikipedia data for current page, passing pollution info

    const cityAndPollution = await Promise.all(
      uniqueCityPollution.map((pair) =>
        this.fetchWikipediaData(pair.city, pair.pollution)
      )
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
}
