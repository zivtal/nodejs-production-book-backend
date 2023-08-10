import type { Holiday } from './models';
import axios, { type AxiosInstance } from 'axios';
import { HOLIDAY_HEBREW } from './constants';

export default class DataGovService {
  private static readonly baseUrl = 'https://data.gov.il/api/3/action/datastore_search';

  private static readonly headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private static createAxios(url: string): AxiosInstance {
    return axios.create({ baseURL: url, headers: this.headers });
  }

  public static async getHolidays(): Promise<Holiday> {
    const client = this.createAxios(`${this.baseUrl}?resource_id=${HOLIDAY_HEBREW}`);
    return (await client.get<Holiday>(``)).data;
  }
}
