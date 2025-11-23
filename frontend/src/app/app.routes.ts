import { Routes } from '@angular/router';
import { LightListComponent } from './energie/light/light-list.component';
import { FinanceComponent } from './finance/finance.component';
import { CalendarComponent } from './google/calendar/calendar.component';
import { MainComponent } from './main/main.component';
import { TramComponent } from './tcl/tram/tram.component';
import { VideoComponent } from './video/video.component';
import { LinkyComponent } from './energie/linky/linky.component';

export const routes: Routes = [
  { path: 'lights', component: LightListComponent },
  { path: 'linky', component: LinkyComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'google', component: CalendarComponent },
  { path: 'tcl', component: TramComponent },
  { path: 'video', component: VideoComponent },
  { path: '**', component: MainComponent },
];
