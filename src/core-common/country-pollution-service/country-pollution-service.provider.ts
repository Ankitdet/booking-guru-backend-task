import { ConfigService } from "@nestjs/config";
import { ApiResponse } from "../../routes/cities/application/abstraction/city-pollution-data.interface";
import { HttpError } from "../../routes/cities/errors/http-error";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CountryPollutionServiceProvider {
  private readonly MOCK_API_URL: string;
  private readonly logger = new Logger(CountryPollutionServiceProvider.name);

  constructor(private configService: ConfigService) {
    this.MOCK_API_URL = this.configService.get<string>("MOCK_API_URL");
  }

  async fetchPollutionDataByCountry(
    countryCode: string,
    page: number = 1,
    limit: number = 10,
    token: string
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${this.MOCK_API_URL}/pollution?country=${countryCode}&page=${page}&limit=${limit}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch pollution data for country ${countryCode}: ${response.statusText}`
      );
      throw new HttpError(
        `Failed to fetch pollution data for country ${countryCode}`,
        response.status,
        "Failed to fetch pollution data"
      );
    }

    const data: ApiResponse = await response.json();
    if (!data || !data.meta || !data.results) {
      throw new HttpError(
        "Invalid response structure from pollution API",
        500,
        "Internal Server Error"
      );
    }

    this.logger.log(
      `Fetched pollution data for country ${countryCode} with ${data.results.length} results`
    );
    return data;
  }
}
