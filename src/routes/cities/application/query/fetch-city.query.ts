export class GetCitiesQuery {
  constructor(
    public readonly country: string,
    public readonly limit: number,
    public readonly page: number,
    public readonly token: string
  ) {}
}