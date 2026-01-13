export interface Stream {
  clicks_last_24h: number
  code_name: string
  country_code: string
  current_song: boolean
  img: string
  img_alt: string
  name: string
  radio_code_name: string
  radio_stream_code_name: string
  stream_url: string
  force_hls: boolean
  force_mpd: boolean
  force_proxy: boolean
  website: string
  tags: string
  popup: boolean
  playing_error: number
  type: 'stream'
}
