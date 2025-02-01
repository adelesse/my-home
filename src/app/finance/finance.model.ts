export interface MarketDay {
  adj_close: number | null;
  adj_high: number | null;
  adj_low: number | null;
  adj_open: number | null;
  adj_volume: number | null;
  asset_type: string | null;
  close: number;
  date: string;
  dividend: number;
  exchange: string;
  exchange_code: string | null;
  high: number;
  low: number;
  name: string | null;
  open: number;
  price_currency: string | null;
  split_factor: number;
  symbol: string;
  volume: number;
}

export interface Pagination {
  count: number;
  limit: number;
  offset: number;
  total: number;
}

export interface Market {
  data: MarketDay[];
  pagination: Pagination;
}
