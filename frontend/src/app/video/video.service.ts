import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OMDB_API_KEY } from '../secret/secret.config';
import { Movie } from './video.model';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'https://www.omdbapi.com/?apikey=';
  private backendUrl = window.location.origin;

  getDefaultVideos() {
    return this.http.get<any[]>(`${this.backendUrl}/api/videos`);
  }

  getCastBaseUrl(): Observable<{ baseUrl: string }> {
    return this.http.get<{ baseUrl: string }>(`${this.backendUrl}/api/video-base-url`);
  }

  getMovie(name: string): Observable<Movie> {
    return this.http.get<Movie>(this.apiUrl + OMDB_API_KEY + '&t=' + name);
  }
}
