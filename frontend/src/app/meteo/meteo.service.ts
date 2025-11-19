import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { WeatherData } from './meteo.model';

@Injectable({
  providedIn: 'root',
})
export class MeteoService {
  constructor(private http: HttpClient) {}

  private apiUrl =
    'https://api.open-meteo.com/v1/forecast?latitude=45.751729155082565&longitude=4.8626564511144625&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Europe%2FBerlin';

  private storageKey = 'meteoCache';

  meteoCache = signal<WeatherData | null>(this.getFromLocalStorage());
  lastFetchDate = signal<Date | null>(this.getLastFetchDateFromLocalStorage());

  getCurrentMeteo(): Observable<WeatherData> {
    const now = new Date();

    if (
      this.meteoCache() &&
      this.lastFetchDate() &&
      !this.isMidnightPassed(this.lastFetchDate()!, now)
    ) {
      return of(this.meteoCache()!);
    }

    return this.http.get<WeatherData>(this.apiUrl).pipe(
      tap((data) => {
        this.meteoCache.set(data);
        this.lastFetchDate.set(now);
        this.saveToLocalStorage(data, now);
      })
    );
  }

  private isMidnightPassed(lastFetch: Date, now: Date): boolean {
    return lastFetch.getDate() !== now.getDate();
  }

  private getFromLocalStorage(): WeatherData | null {
    const item = localStorage.getItem(this.storageKey);
    return item ? (JSON.parse(item) as WeatherData) : null;
  }

  private getLastFetchDateFromLocalStorage(): Date | null {
    const dateStr = localStorage.getItem(`${this.storageKey}_date`);
    return dateStr ? new Date(dateStr) : null;
  }

  private saveToLocalStorage(data: WeatherData, date: Date): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    localStorage.setItem(`${this.storageKey}_date`, date.toISOString());
  }
}
