import type { Stream } from '@/types/stream';

export type GetConfigResponse = {
  radio_browser_url: string
};

export type GetStreamsResponse = {
  streams: Array<Stream>|[]
  total: number
  timestamp?: number
};

export type GetGeoResponse = {
  languages: string
  distance: string
  countryCode: string
  countryName: string
};
