import { Component, OnInit, signal } from '@angular/core';
import { MeteoService } from '../meteo.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { WeatherData } from '../meteo.model';

@Component({
  selector: 'app-temperature',
  standalone: true,
  templateUrl: './temperature.component.html',
  imports: [ButtonModule, FormsModule],
})
export class TempratureComponent implements OnInit {
  temperature = signal<string>('');

  constructor(private meteoService: MeteoService) {}

  ngOnInit(): void {
    this.meteoService.getCurrentMeteo().subscribe((meteo: WeatherData) => {
      this.temperature.set(
        meteo.current.temperature_2m + ' ' + meteo.current_units.temperature_2m
      );
    });
  }
}
