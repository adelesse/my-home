import { Component, OnInit, signal } from '@angular/core';
import { FinanceService } from './finance.service';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-finance',
  standalone: true,
  templateUrl: './finance.component.html',
  imports: [ButtonModule, DataViewModule, FormsModule],
})
export class FinanceComponent implements OnInit {
  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {}
}
