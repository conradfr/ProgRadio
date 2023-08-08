import type { Stream } from '@/types/stream';
import type { Countries } from '@/types/countries';

export type GetConfigResponse = {
  radio_browser_url: string
};

export type GetStreamsResponse = {
  streams: Array<Stream>|[]
  total: number
  timestamp?: number
};

export type GetOneStreamResponse = {
  stream: Stream
};

export type GetCountriesResponse = {
  countries: Countries
};

export type GetGeoResponse = {
  languages: string
  distance: string
  countryCode: string
  countryName: string
};

export type GetStreamPlayingError = {
  status: string
};
