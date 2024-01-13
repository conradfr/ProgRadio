export interface User {
  favoritesRadio: string[]
  favoritesStream: string[]
  songs: Record<string, string>
  logged: boolean
  isAdmin: boolean
  storeHistory: boolean
}
