import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { LINKY_KEY, LINKY_PRM } from '../../secret/secret.config';
import { CacheService } from '../../shared/cache.service';
import { EnergyResponse } from './linky.model';

@Injectable({
  providedIn: 'root',
})
export class LinkyService {
  http = inject(HttpClient);
  cacheService = inject(CacheService);

  private storageKey = 'linkyCache';

  getLinkyData(): Observable<EnergyResponse> {
    const data = this.cacheService.get<EnergyResponse>(this.storageKey);

    if (data) {
      return of(data);
    }

    const now = new Date();
    const dateMoins30Jours = new Date();
    dateMoins30Jours.setDate(dateMoins30Jours.getDate() - 7);

    const formattedEndDate = dateMoins30Jours.toISOString().split('T')[0]; // YYYY-MM-DD
    const url = `api/daily_consumption?prm=${LINKY_PRM}&start=${formattedEndDate}&end=${
      now.toISOString().split('T')[0]
    }`;

    return this.http
      .get<EnergyResponse>(url, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((result: EnergyResponse) => {
          this.cacheService.set(this.storageKey, result, 24);
        })
      );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${LINKY_KEY}`,
    });
  }
}
