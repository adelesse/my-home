export interface Schedule {
  dateTime: string;
  baseDateTime: string;
  realtime: boolean;
  type: string | null;
}

export interface TrafficItem {
  line: string;
  direction: string;
  schedules: Schedule[];
  stop: string;
  destination: string;
}

export interface TrafficResponse {
  data: TrafficItem[];
}
