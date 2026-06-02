import type { Stream } from './stream.ts';

export interface Radio {
  id: number
  code_name: string
  country_code: string
  name: string
  category: string
  share: number
  streaming_enabled: boolean
  streams: Record<string, Stream>
  type: 'radio'
  stream_url: string,
  has_preroll: boolean
}
