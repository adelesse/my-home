import { Injectable } from '@angular/core';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {}

  set<T>(key: string, value: T, ttlHours: number): void {
    const ttlMs = ttlHours * 60 * 60 * 1000;
    const expiresAt = Date.now() + ttlMs;

    const entry: CacheEntry<T> = {
      value,
      expiresAt,
    };

    localStorage.setItem(key, JSON.stringify(entry));
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const entry: CacheEntry<T> = JSON.parse(raw);

      // Clean cache if expired and return null
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.value;
    } catch (err) {
      // In case of error, clean cache
      localStorage.removeItem(key);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
