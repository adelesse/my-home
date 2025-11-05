export interface ReadingType {
  unit: string;
  measurement_kind: string;
  aggregate: string;
  measuring_period: string;
}

export interface IntervalReading {
  value: number;
  date: string;
}

export interface EnergyResponse {
  usage_point_id: string;
  start: string;
  end: string;
  quality: string;
  reading_type: ReadingType;
  interval_reading: IntervalReading[];
}
