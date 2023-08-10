import type { GoogleAutocomplete } from './models';
import axios, { AxiosInstance } from 'axios';
import config from '../../../config';

export default class GoogleMaps {
  private static readonly apiKey = config.GOOGLE_API.MAPS;

  private static readonly headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private static readonly googleLang: Record<string, string> = {
    he: 'iw',
  };

  private static readonly getLanguage = (language?: string): string => {
    if (!language) {
      return '';
    }

    return this.googleLang[language] ? `&language=${this.googleLang[language]}` : '';
  };

  private static createAxios(url: string): AxiosInstance {
    return axios.create({ baseURL: `${url}&key=${this.apiKey}`, headers: this.headers });
  }

  public static async getLocationByPlace(query: string, language?: string): Promise<GoogleAutocomplete> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=address`;
    const client = this.createAxios(url + this.getLanguage(language));
    const res = (await client.get<GoogleAutocomplete>(``)).data;

    if (res.status !== 'OK') {
      throw res.status;
    }

    return res;
  }
}
