import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBolt,
  faCloud,
  faCloudBolt,
  faCloudMoon,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudSun,
  faMoon,
  faQuestionCircle,
  faSmog,
  faSnowflake,
  faSun,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { WeatherData } from '../meteo.model';
import { MeteoService } from '../meteo.service';

@Component({
  selector: 'app-meteo-icon',
  standalone: true,
  templateUrl: './meteo-icon.component.html',
  imports: [ButtonModule, FormsModule, FontAwesomeModule],
})
export class MeteoIconComponent implements OnInit {
  icon = signal<IconDefinition>(faQuestionCircle);

  constructor(private meteoService: MeteoService) {}

  ngOnInit(): void {
    this.meteoService.getCurrentMeteo().subscribe((meteo: WeatherData) => {
      this.icon.set(this.getWeatherIcon(meteo.current.weather_code, meteo.current.is_day));
    });
  }

  getWeatherIcon(weatherCode: number, isDay: number): IconDefinition {
    const day = isDay === 1;

    switch (weatherCode) {
      // 0 Clear sky
      case 0:
        return day ? faSun : faMoon;

      // 1,2,3 Mainly clear / partly cloudy / overcast
      case 1:
      case 2:
        return day ? faCloudSun : faCloudMoon;

      case 3:
        return faCloud;

      // 45,48 Fog
      case 45:
      case 48:
        return faSmog;

      // 51,53,55 Drizzle
      case 51:
      case 53:
      case 55:
        return faCloudRain;

      // 56,57 Freezing drizzle
      case 56:
      case 57:
        return faCloudRain;

      // 61,63,65 Rain
      case 61:
      case 63:
      case 65:
        return faCloudRain;

      // 66,67 Freezing rain
      case 66:
      case 67:
        return faCloudRain;

      // 71,73,75 Snow fall
      case 71:
      case 73:
      case 75:
        return faSnowflake;

      // 77 Snow grains
      case 77:
        return faSnowflake;

      // 80,81,82 Rain showers
      case 80:
      case 81:
      case 82:
        return faCloudShowersHeavy;

      // 85,86 Snow showers
      case 85:
      case 86:
        return faSnowflake;

      // 95 Thunderstorm
      case 95:
        return faBolt;

      // 96,99 Thunderstorm with hail
      case 96:
      case 99:
        return faCloudBolt;

      default:
        return faQuestionCircle;
    }
  }
}
