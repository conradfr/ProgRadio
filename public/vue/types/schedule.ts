import type { Program } from './program';

export interface ScheduleOfRadio {
  [key: string]: Program
}

export interface Schedule {
  [key: string]: ScheduleOfRadio
}
