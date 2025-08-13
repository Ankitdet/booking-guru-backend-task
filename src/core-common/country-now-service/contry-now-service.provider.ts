import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpError } from "../../routes/cities/errors/http-error";
import { CountryIsoCode } from "../../routes/cities/application/abstraction/country-iso-code.interface";

@Injectable()
export class CountryNowServiceProvider {
  private COUNTRIES_NOW_API_BASE_URL: string;
  constructor(private configService: ConfigService) {
    this.COUNTRIES_NOW_API_BASE_URL = this.configService.get<string>(
      "COUNTRIES_NOW_API_BASE_URL"
    );
  }
  public async getCountryNameByCountryCode(countryCode: string) {
    const countriesIsoCode = await fetch(
      `${this.COUNTRIES_NOW_API_BASE_URL}/api/v0.1/countries/iso`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const contriesResponse = await countriesIsoCode.json();

    if (!contriesResponse || !contriesResponse.data) {
      throw new HttpError(
        "Failed to fetch country ISO codes",
        500,
        "Internal Server Error"
      );
    }
    const contryIsoCodes = (contriesResponse.data as CountryIsoCode[]).map(
      (country: CountryIsoCode) => ({
        code: country.Iso2,
        name: country.name,
      })
    );
    const countryDetails = contryIsoCodes.filter(
      (code) => code.code == countryCode
    );
    if (countryDetails.length === 0) {
      return "";
    }
    return countryDetails[0].name || "";
  }

  public async fetchCitiesByCountry(countryName: string) {
    const response = await fetch(
      `${this.COUNTRIES_NOW_API_BASE_URL}/api/v0.1/countries/cities`,
      {
        method: "post",
        body: JSON.stringify({ country: countryName }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  }
}
