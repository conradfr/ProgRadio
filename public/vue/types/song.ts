export interface Songs {
  [key: string]: SongContainer
}

export interface SongContainer {
  topic: string
  song: Song
}

export interface Song {
  artist?: string|null
  title?: string|null
}
