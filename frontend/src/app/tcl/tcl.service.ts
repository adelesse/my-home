import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrafficResponse } from './tcl.model';

@Injectable({
  providedIn: 'root',
})
export class TclService {
  constructor(private http: HttpClient) {}

  private apiUrl =
    'https://carte-interactive.tcl.fr/api/interface/tcl/next-trips/stops/stop_point%3ASYTNEX%3A45863/line%3ASYTNEX%3AT4/forward';

  getArchivesDepartementales(): Observable<TrafficResponse> {
    return this.http.get<TrafficResponse>(this.apiUrl);
  }
}
