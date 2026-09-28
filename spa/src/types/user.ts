import { SavedSongs } from '@/types/saved_song'

export interface User {
  favoritesRadio: string[]
  favoritesStream: string[]
  songs: SavedSongs
  logged: boolean
  isAdmin: boolean
  storeHistory: boolean
}
