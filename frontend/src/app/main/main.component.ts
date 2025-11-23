import { Component } from '@angular/core';
import { LightListComponent } from "../light/light-list.component";
import { LinkyComponent } from "../linky/linky.component";
import { FinanceComponent } from "../finance/finance.component";
import { CalendarComponent } from "../google/calendar/calendar.component";
import { TramComponent } from "../tcl/tram/tram.component";
import { VideoComponent } from "../video/video.component";

@Component({
  selector: 'app-main',
  imports: [LightListComponent, LinkyComponent, FinanceComponent, CalendarComponent, TramComponent, VideoComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {}
