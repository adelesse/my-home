import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { Market, MarketDay } from './finance.model';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  templateUrl: './finance.component.html',
  imports: [ButtonModule, FormsModule, ChartModule],
})
export class FinanceComponent implements OnInit {
  data: any;

  options: any;

  constructor(
    private financeService: FinanceService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.financeService.getMarket().subscribe((market: Market) => {
      this.initChart(market.data);
    });
  }

  initChart(datas: MarketDay[]) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    datas.reverse();
    const labels: string[] = datas.map((d) => new Date(d.date).toLocaleDateString('fr-FR'));
    const closeDatas: number[] = datas.map((d) => d.high);

    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Action Thales (' + closeDatas[closeDatas.length - 1] + ' €)',
          data: closeDatas,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
          tension: 0.4,
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
    this.cd.markForCheck();
  }
}
