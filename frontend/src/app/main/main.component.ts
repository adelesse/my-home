import { Component } from '@angular/core';
import { LightListComponent } from '../energie/light/light-list.component';
import { LinkyComponent } from '../energie/linky/linky.component';
import { FinanceComponent } from '../finance/finance.component';
import { CalendarComponent } from '../google/calendar/calendar.component';
import { TramComponent } from '../tcl/tram/tram.component';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-main',
  imports: [
    LightListComponent,
    LinkyComponent,
    FinanceComponent,
    CalendarComponent,
    TramComponent,
    Card,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {}
