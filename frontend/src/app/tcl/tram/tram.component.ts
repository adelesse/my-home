import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TimeToPipe } from '../../shared/timeTo.pipe';
import { TrafficItem, TrafficResponse } from '../tcl.model';
import { TclService } from '../tcl.service';

@Component({
  selector: 'app-tram',
  standalone: true,
  templateUrl: './tram.component.html',
  styleUrls: ['./tram.component.css'],
  imports: [ButtonModule, FormsModule, TimeToPipe],
})
export class TramComponent implements OnInit {
  readonly TRAM4 = 'line:SYTNEX:T4';
  traffic = signal<TrafficItem[]>([]);
  tclService = inject(TclService);

  ngOnInit(): void {
    this.tclService
      .getArchivesDepartementales()
      .subscribe((traffic: TrafficResponse) => {
        const line4 = traffic.data.filter((item) => item.line === this.TRAM4);
        this.traffic.set(line4);
      });
  }
}
