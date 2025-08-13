export interface MetaData {
  page: number;
  totalPages: number;
}

export interface ApiResponse {
  meta: MetaData;
  results: CityPollutionData[];
}

export interface CityPollutionData {
  name: string;
  pollution: number;
}
