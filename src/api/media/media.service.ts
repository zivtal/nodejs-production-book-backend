import type { GetVideoDetailsRes } from './models';
import type { BaseResponse } from '../../shared/models';
import InternalError from '../../shared/composables/middleware/errors/internal-error';
import { GET_VIDEO_DETAILS } from './media.maps';
import YoutubeService from '../../shared/service/googleapis/youtube.service';
import { useVideoParser } from '../employee/album/helpers';

const locationService = {
  [GET_VIDEO_DETAILS]: async (url: string): Promise<GetVideoDetailsRes | BaseResponse> => {
    try {
      const videoParsing = useVideoParser(url);

      switch (videoParsing?.type) {
        case 'YOUTUBE':
          const { items } = await YoutubeService.getVideoDetails(videoParsing.id);
          const { id, snippet } = items[0];
          const { title, description, thumbnails, tags, publishedAt } = snippet || {};

          return title ? { id, title, description, thumb: thumbnails?.maxres.url, tags, publishedAt, returnCode: 0 } : { returnCode: 1 };
        default:
          return { returnCode: 1 };
      }
    } catch (err) {
      throw new InternalError(err);
    }
  },
};

export default locationService;
