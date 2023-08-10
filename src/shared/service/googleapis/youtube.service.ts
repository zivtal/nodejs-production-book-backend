import type { YoutubeVideo, YoutubePart } from './models';
import axios, { AxiosInstance } from 'axios';
import config from '../../../config';

export default class YoutubeService {
  private static readonly apiKey = config.GOOGLE_API.YOUTUBE;

  private static readonly headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private static createAxios(url: string): AxiosInstance {
    return axios.create({ baseURL: `${url}&key=${this.apiKey}`, headers: this.headers });
  }

  public static async getVideoDetails(videoId: string, part: YoutubePart = ['snippet', 'contentDetails']): Promise<YoutubeVideo> {
    const client = this.createAxios(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=${part.join(',')}`);
    const res = await client.get<YoutubeVideo>(``);

    return res.data;
  }
}
