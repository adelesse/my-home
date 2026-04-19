import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { LINKY_KEY } from '../../secret/secret.config';
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

    const url = `${window.location.origin}/api/linky`;

    return this.http.get<EnergyResponse>(url).pipe(
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
