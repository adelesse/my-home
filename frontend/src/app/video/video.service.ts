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

  getDefaultVideos() {
    return this.http.get<any[]>('http://localhost:3000/api/videos');
  }

  getMovie(name: string): Observable<Movie> {
    return this.http.get<Movie>(this.apiUrl + OMDB_API_KEY + '&t=' + name);
  }
}
