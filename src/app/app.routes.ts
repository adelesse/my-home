import { Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { CalendarComponent } from './google/calendar/calendar.component';
import { LightListComponent } from './light/light-list.component';
import { LinkyComponent } from './linky/linky.component';

export const routes: Routes = [
  { path: 'lights', component: LightListComponent },
  { path: 'linky', component: LinkyComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'google', component: CalendarComponent },
  { path: '**', component: LightListComponent },
];
