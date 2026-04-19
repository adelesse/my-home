import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoogleEvent } from './google.model';

@Injectable({ providedIn: 'root' })
export class GoogleService {
  http = inject(HttpClient);
  private backendUrl = window.location.origin;

  // Redirection vers le login Google
  login(redirectUrl: string = `${window.location.origin}/calendar`): void {
    window.location.href = `${
      this.backendUrl
    }/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  // Récupérer les événements du calendrier
  getEvents(): Observable<GoogleEvent[]> {
    return this.http.get<GoogleEvent[]>(`${this.backendUrl}/calendar/events`, {
      withCredentials: true,
    });
  }

  // Récupérer les événements du calendrier
  countMails(): Observable<number> {
    return this.http.get<number>(`${this.backendUrl}/mail/count`, {
      withCredentials: true,
    });
  }
}
