import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Market } from './finance.model';
import { FINANCE_KEY } from '../secret/secret.config';
@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  constructor(private http: HttpClient) {}

  private apiUrl =
    'http://api.marketstack.com/v2/eod?access_key=' +
    FINANCE_KEY +
    '&symbols=HO.XPAR';

  private storageKey = 'marketCache';

  marketCache = signal<Market | null>(this.getFromLocalStorage());
  lastFetchDate = signal<Date | null>(this.getLastFetchDateFromLocalStorage());

  getMarket(): Observable<Market> {
    const now = new Date();

    if (
      this.marketCache() &&
      this.lastFetchDate() &&
      !this.isMidnightPassed(this.lastFetchDate()!, now)
    ) {
      return of(this.marketCache()!);
    }

    // Effectue un appel HTTP et met à jour le signal
    return this.http.get<Market>(this.apiUrl).pipe(
      tap((data) => {
        this.marketCache.set(data);
        this.lastFetchDate.set(now);
        this.saveToLocalStorage(data, now);
      })
    );
  }

  private isMidnightPassed(lastFetch: Date, now: Date): boolean {
    return lastFetch.getDate() !== now.getDate();
  }

  private getFromLocalStorage(): Market | null {
    const item = localStorage.getItem(this.storageKey);
    return item ? (JSON.parse(item) as Market) : null;
  }

  private getLastFetchDateFromLocalStorage(): Date | null {
    const dateStr = localStorage.getItem(`${this.storageKey}_date`);
    return dateStr ? new Date(dateStr) : null;
  }

  private saveToLocalStorage(data: Market, date: Date): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    localStorage.setItem(`${this.storageKey}_date`, date.toISOString());
  }
}
