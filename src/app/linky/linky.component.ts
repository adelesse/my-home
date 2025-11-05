import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LinkyService } from './linky.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { EnergyResponse, IntervalReading } from './linky.model';

@Component({
  selector: 'app-linky',
  standalone: true,
  templateUrl: './linky.component.html',
  imports: [ButtonModule, FormsModule, ChartModule],
})
export class LinkyComponent implements OnInit {
  data: any;

  options: any;

  constructor(
    private linkyService: LinkyService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.linkyService
      .getLinkyData()
      .subscribe((energyResponse: EnergyResponse) => {
        this.initChart(energyResponse.interval_reading);
      });
  }


  initChart(datas: IntervalReading[]) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--p-text-muted-color'
    );
    const surfaceBorder = documentStyle.getPropertyValue(
      '--p-content-border-color'
    );

    const labels: string[] = datas.map((d) =>
      new Date(d.date).toLocaleDateString('fr-FR')
    );
    const kwhs: number[] = datas.map((d) => (d.value / 1000));

    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Consomation (' + kwhs[kwhs.length - 1] + ' kWh)',
          data: kwhs,
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
