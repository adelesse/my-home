import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from '../shared/cache.service';
import { WeatherData } from './meteo.model';

@Injectable({
  providedIn: 'root',
})
export class MeteoService {
  http = inject(HttpClient);
  cacheService = inject(CacheService);

  private apiUrl =
    'https://api.open-meteo.com/v1/forecast?latitude=45.751729155082565&longitude=4.8626564511144625&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Europe%2FBerlin';

  private storageKey = 'meteoCache';

  getCurrentMeteo(): Observable<WeatherData> {
    const data = this.cacheService.get<WeatherData>(this.storageKey);

    if (data) {
      return of(data);
    }

    return this.http.get<WeatherData>(this.apiUrl).pipe(
      tap((data) => {
        this.cacheService.set(this.storageKey, data, 1);
      })
    );
  }
}
