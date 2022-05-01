export interface Toast {
  id: string
  duration: number
  message: string
  type: 'success'|'error'
}
