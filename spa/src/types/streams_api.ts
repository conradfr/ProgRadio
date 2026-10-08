import type { Stream } from '@/types/stream';

export type GetConfigResponse = {
  radio_browser_url: string
  streams_proxy_url: string
  streams_proxy_key: string
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
