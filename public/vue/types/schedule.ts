import type { Program } from './program';

export interface ScheduleOfSubRadio {
  [key: string]: Program
}

export interface ScheduleOfSubRadios {
  [key: string]: ScheduleOfSubRadio|null
}

export interface Schedule {
  [key: string]: ScheduleOfSubRadios
}
