import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TrafficItem, TrafficResponse } from '../tcl.model';
import { TclService } from '../tcl.service';
import { TimeToPipe } from "../../shared/timeTo.pipe";

@Component({
  selector: 'app-tram',
  standalone: true,
  templateUrl: './tram.component.html',
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
