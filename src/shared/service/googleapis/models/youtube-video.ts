interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard: { url: string; width: number; height: number };
    maxres: { url: string; width: number; height: number };
  };
  channelTitle: string;
  tags: Array<string>;
  categoryId: string;
  liveBroadcastContent: string;
  localized: { title: string; description: string };
  defaultAudioLanguage: string;
}

interface ContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: 'false' | 'true';
  licensedContent: boolean;
  contentRating: Record<string, any>;
  projection: string;
}

interface Status {
  uploadStatus: string;
  privacyStatus: string;
  license: string;
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
}

interface Statistics {
  viewCount: string;
  likeCount: string;
  favoriteCount: string;
  commentCount: string;
}

interface Items {
  kind: string;
  etag: string;
  id: string;
  snippet?: Snippet;
  contentDetails?: ContentDetails;
  status?: Status;
  statistics?: Statistics;
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubeVideo {
  kind: string;
  etag: string;
  items: Array<Items>;
  pageInfo: PageInfo;
}
