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
    'https://carte-interactive.tcl.fr/api/interface/tcl/next-trips/areas/stop_area%3ASYTNEX%3Achouette%3AStopArea%3Aecdcb28e-a083-4bfc-b8d1-68593ee0cc57%3ALOC';

  getArchivesDepartementales(): Observable<TrafficResponse> {
    return this.http.get<TrafficResponse>(this.apiUrl);
  }
}
