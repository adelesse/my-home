import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { FINANCE_KEY } from '../secret/secret.config';
import { CacheService } from '../shared/cache.service';
import { Market } from './finance.model';
@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  http = inject(HttpClient);
  cacheService = inject(CacheService);

  private apiUrl =
    'http://api.marketstack.com/v2/eod?access_key=' +
    FINANCE_KEY +
    '&symbols=HO.XPAR';

  private storageKey = 'marketCache';

  getMarket(): Observable<Market> {
    const data = this.cacheService.get<Market>(this.storageKey);

    if (data) {
      return of(data);
    }

    return this.http.get<Market>(this.apiUrl).pipe(
      tap((data) => {
        this.cacheService.set(this.storageKey, data, 24);
      })
    );
  }
}
