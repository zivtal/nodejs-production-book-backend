enum Part {
  snippet = 'snippet',
  contentDetails = 'contentDetails',
  statistics = 'statistic',
  status = 'status',
}

export type YoutubePart = Array<keyof typeof Part>;
