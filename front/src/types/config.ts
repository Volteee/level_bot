// types/config.ts
export interface LevelConditions {
  first_low: number;
  first_high: number;
  second_low: number;
  second_high: number;
  third_low: number;
  third_high: number;
  forth_low: number;
}

export interface Config {
  key: string;
  data: LevelConditions;
}