import type { Schedule } from '@/types/schedule';
import type { Radio } from '@/types/radio';
import type { Collection } from '@/types/collection';
import type { Category } from '@/types/category';

export type GetScheduleResponse = {
  schedule: Schedule
};

export type GetRadiosDataResponse = {
  radios?: Record<string, Radio>
  collections?: Record<string, Collection>
  categories?: Category[]
};

export type listeningSessionPostData = {
  date_time_start: string
  date_time_end: string
  source: string
  ctrl: number
  radio_stream_code_name?: string
  stream_id?: string,
  ending?: boolean
}

export type PutListeningSessionResponse = {
  status: string
  id: string
  date_time_start: string
  date_time_end: string
};
