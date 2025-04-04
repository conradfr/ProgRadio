export interface Songs {
  [key: string]: SongContainer
}

export interface SongHistory {
  [key: string]: Song
}

export interface SongContainer {
  topic: string
  song: Song
}

export interface Song {
  artist?: string|null
  title?: string|null
  cover_url?: string|null
}
