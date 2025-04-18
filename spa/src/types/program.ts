import type { Section } from './section.ts';

export interface Program {
  description?: string|null
  duration: number
  end_at: string
  end_overflow: 0|1
  hash: string
  host?: string|null
  picture_url?: string|null
  sections?: Section[]|null
  start_at: string
  start_overflow: 0|1
  title: string
}
