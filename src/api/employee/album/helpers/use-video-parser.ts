import RegexPattern from '../../../../shared/constants/regex-pattern';

const useYoutubeParser = (url: string): string | undefined => {
  const match = url.match(RegexPattern.YOUTUBE_ID);

  return match && match[7].length === 11 ? match[7] : undefined;
};

const useVimeoParser = (url: string): string | undefined => {
  // const regExp = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(RegexPattern.VIMEO_ID);

  return match ? match[3] : undefined;
};

export const useVideoParser = (url: string): { id: string; type: 'YOUTUBE' | 'VIMEO' } | undefined => {
  const vimeoId = useVimeoParser(url);
  const youtubeId = useYoutubeParser(url);
  const id = vimeoId || youtubeId;

  if (!id) {
    return;
  }

  return { id, type: vimeoId ? 'VIMEO' : 'YOUTUBE' };
};
