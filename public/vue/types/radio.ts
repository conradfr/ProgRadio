import type { SubRadio } from './sub_radio';
import type { RadioStream } from './radio_stream';

export interface Radio {
  category: string
  code_name: string
  country_code: string
  id: number
  name: string
  share: number
  streaming_enabled: boolean
  streams: Record<string, RadioStream>
  sub_radios: Record<string, SubRadio>
  type: 'radio'
  img: string
  stream_url: string,
  has_preroll: boolean
}
