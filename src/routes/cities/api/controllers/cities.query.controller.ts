import { Controller, Get, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetCitiesQuery } from "../../application/query/fetch-city.query";
import { GetCitiesDto } from "../request-model/fetch-city.query.request";
import { GetToken } from "../../../../middleware/decorators/get-token.decorator";

@Controller("cities")
export class CitiesQueryController {
  constructor(private readonly queryBus: QueryBus) {}
  /**
   * Fetches cities based on the provided country code, limit, page, and token.
   * @param query - The query parameters containing countryCode, limit, page, and token.
   * @returns A promise that resolves to the list of cities.
   */
  @Get()
  public async getCities(
    @Query() query: GetCitiesDto,
    @GetToken() token: string
  ): Promise<any> {
    const { countryCode, limit, page } = query;
    return await this.queryBus.execute(
      new GetCitiesQuery(countryCode, limit, page, token)
    );
  }
}
