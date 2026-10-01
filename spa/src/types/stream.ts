export interface Stream {
  type: 'stream'
  id: string
  code_name: string
  name: string
  country_code: string
  language?: string | null
  current_song: boolean
  img: string | null
  img_alt?: string | null
  stream_url: string
  force_hls: boolean
  force_mpd: boolean
  force_proxy: boolean
  website: string
  tags: string
  genres: string
  slogan: string
  popup: boolean
  playing_error: number
  source: string
  radio_code_name: string
  radio_stream_code_name: string
  is_main_radio?: boolean
  is_sub_radio?: boolean
  has_logo?: boolean | null
}
