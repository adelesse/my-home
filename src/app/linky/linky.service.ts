import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, of, tap } from 'rxjs';
import { LINKY_KEY, LINKY_PRM } from '../secret/secret.config';
import { EnergyResponse } from './linky.model';

@Injectable({
  providedIn: 'root',
})
export class LinkyService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'https://conso.boris.sh/api';

  private storageKey = 'linkyCache';

  linkyCache = signal<EnergyResponse | null>(this.getFromLocalStorage());
  lastFetchDate = signal<Date | null>(this.getLastFetchDateFromLocalStorage());

  getLinkyData(): Observable<EnergyResponse> {
    const now = new Date();
    const dateMoins30Jours = new Date();
    dateMoins30Jours.setDate(dateMoins30Jours.getDate() - 7);

    const formattedEndDate = dateMoins30Jours.toISOString().split('T')[0]; // YYYY-MM-DD

    if (
      this.linkyCache() &&
      this.lastFetchDate() &&
      !this.isMidnightPassed(this.lastFetchDate()!, now)
    ) {
      return of(this.linkyCache()!);
    }

    const url = `api/daily_consumption?prm=${LINKY_PRM}&start=${formattedEndDate}&end=${
      now.toISOString().split('T')[0]
    }`;
    return this.http
      .get<EnergyResponse>(url, {
        headers: this.getHeaders()
      })
      .pipe(
        tap((result: EnergyResponse) => {
          this.linkyCache.set(result);
          this.lastFetchDate.set(now);
          this.saveToLocalStorage(result, now);
        })
      );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${LINKY_KEY}`,
    });
  }

  private isMidnightPassed(lastFetch: Date, now: Date): boolean {
    return lastFetch.getDate() !== now.getDate();
  }

  private getFromLocalStorage(): EnergyResponse | null {
    const item = localStorage.getItem(this.storageKey);
    return item ? (JSON.parse(item) as EnergyResponse) : null;
  }

  private getLastFetchDateFromLocalStorage(): Date | null {
    const dateStr = localStorage.getItem(`${this.storageKey}_date`);
    return dateStr ? new Date(dateStr) : null;
  }

  private saveToLocalStorage(data: EnergyResponse, date: Date): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    localStorage.setItem(`${this.storageKey}_date`, date.toISOString());
  }
}
