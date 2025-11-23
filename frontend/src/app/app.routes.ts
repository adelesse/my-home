import { Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { CalendarComponent } from './google/calendar/calendar.component';
import { LightListComponent } from './light/light-list.component';
import { LinkyComponent } from './linky/linky.component';
import { MainComponent } from './main/main.component';
import { TramComponent } from './tcl/tram/tram.component';
import { VideoComponent } from './video/video.component';

export const routes: Routes = [
  { path: 'lights', component: LightListComponent },
  { path: 'linky', component: LinkyComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'google', component: CalendarComponent },
  { path: 'tcl', component: TramComponent },
  { path: 'video', component: VideoComponent },
  { path: '**', component: MainComponent },
];
