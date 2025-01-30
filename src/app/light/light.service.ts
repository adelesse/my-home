import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Light } from './light.model';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private ip = '192.168.1.191';
  private key = 'yi2AXMZuZu8WZBw4FQqVICDpZJGfOrRbjif2c52L';
  private apiUrl = 'http://' + this.ip + '/api/' + this.key + '/lights';

  constructor(private http: HttpClient) {}

  getLights(): Observable<Light[]> {
    return this.http.get<Record<string, Light>>(this.apiUrl).pipe(
      map((data) =>
        Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      )
    );
  }

  changeState(id: string, state: boolean) {
    this.http.put(this.apiUrl + '/' + id + '/state', { on: state }).subscribe();
  }
}
