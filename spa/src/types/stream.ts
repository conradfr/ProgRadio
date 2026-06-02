export interface Stream {
  id: string
  code_name: string
  name: string
  country_code: string
  current_song: boolean
  img: string | null
  img_alt?: string | null
  stream_url: string
  force_hls: boolean
  force_mpd: boolean
  force_proxy: boolean
  website: string
  tags: string
  popup: boolean
  playing_error: number
  type: 'stream'
  source: string
  radio_code_name: string
  radio_stream_code_name: string
  is_main_radio?: boolean
  is_sub_radio?: boolean
  has_logo?: boolean | null
}
