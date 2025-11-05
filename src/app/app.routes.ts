import { Routes } from '@angular/router';
import { LightListComponent } from './light/light-list.component';
import { FinanceComponent } from './finance/finance.component';
import { LinkyComponent } from './linky/linky.component';

export const routes: Routes = [
  { path: 'lights', component: LightListComponent },
  { path: 'linky', component: LinkyComponent },
  { path: 'finance', component: FinanceComponent },
  { path: '**', component: LightListComponent },
];
