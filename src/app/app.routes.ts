import { Routes } from '@angular/router';
import { LightListComponent } from './light/light-list.component';
import { FinanceComponent } from './finance/finance.component';

export const routes: Routes = [
  { path: 'lights', component: LightListComponent },
  { path: 'finance', component: FinanceComponent },
  { path: '**', component: LightListComponent },
];
