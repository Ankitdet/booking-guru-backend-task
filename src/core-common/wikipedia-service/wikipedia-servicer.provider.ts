import { Injectable, HttpException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WikipediaServiceProvider {
  // Base URL for the Wikipedia API, fetched from the configuration service
  private WIKIPEDIA_API_BASE_URL = "";
  private readonly logger = new Logger(WikipediaServiceProvider.name);

  constructor(private configService: ConfigService) {
    this.WIKIPEDIA_API_BASE_URL = this.configService.get<string>(
      "WIKIPEDIA_API_BASE_URL"
    );
  }

  public async fetchCitySummary(cityName: string, pollution: number) {
    const url = `${
      this.WIKIPEDIA_API_BASE_URL
    }/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new HttpException(
          `Failed to fetch Wikipedia data for ${cityName}`,
          res.status
        );
      }
      this.logger.log(
        `Fetched Wikipedia data for city: ${cityName} with pollution: ${pollution}`
      );

      const data = await res.json();

      if (!data || !data.description) {
        this.logger.warn(
          `No description found for city: ${cityName}, returning default values`
        );
        return {
          name: cityName,
          country: "",
          population: pollution || 0,
          description: "No description available.",
        };
      }
      return {
        name: cityName,
        country: data.description?.split(",").pop()?.trim() || "",
        population: pollution || 0,
        description: data.extract || "No description available.",
      };
    } catch {
      return {
        name: cityName,
        country: "",
        population: 0,
        description: "No description available.",
      };
    }
  }
}
