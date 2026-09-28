export interface SavedSongs {
  [key: string]: SavedSong
}

export interface SavedSong {
  title: string
  stream_id?: string|null
  stream_name?: string|null
  added_at: string
}
