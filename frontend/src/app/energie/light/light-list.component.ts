import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ColorPicker } from 'primeng/colorpicker';
import { KnobModule } from 'primeng/knob';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ToggleButton } from 'primeng/togglebutton';
import { Light } from './light.model';
import { LightService } from './light.service';

@Component({
  selector: 'app-light-list',
  standalone: true,
  templateUrl: './light-list.component.html',
  styleUrls: ['./light-list.component.css'],
  imports: [
    ButtonModule,
    TableModule,
    SliderModule,
    KnobModule,
    ToggleButton,
    ColorPicker,
    FormsModule,
  ],
})
export class LightListComponent implements OnInit {
  lights = signal<Light[]>([]);
  colorValues: { [key: string]: any } = {};
  private readonly fallbackColor = 'WhiteSmoke';

  constructor(private lightService: LightService) {}

  ngOnInit(): void {
    this.fetchLights();
  }

  fetchLights(): void {
    this.lightService.getLights().subscribe({
      next: (data: Light[]) => {
        this.lights.set(data);
        data.forEach((light) => {
          if (light.id && light.state.xy) {
            this.colorValues[light.id] = this.lightService.getXYtoRGB(
              light.state.xy[0],
              light.state.xy[1],
              light.state.bri
            );
          }
        });
      },
      error: (error: any) => {
        this.lights.set([]);
      },
    });
  }

  changeLight(id: string, state: boolean) {
    this.lightService.changeState(id, state);
  }

  brightnessTemplate(value: number): string {
    const percent = Math.round((value / 255) * 100);
    return `${percent} %`;
  }

  updateBrightness(id: string, brightness: number) {
    this.lightService.updateBrightness(id, brightness);
  }

  updateColor(id: string, color: any) {
    this.lightService.updateHSB(id, color);
  }

  knobColor(lightId: string): string {
    const color = this.colorValues[lightId];

    if (!color) {
      return this.fallbackColor;
    }

    if (typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number') {
      const r = Math.max(0, Math.min(255, Math.round(color.r)));
      const g = Math.max(0, Math.min(255, Math.round(color.g)));
      const b = Math.max(0, Math.min(255, Math.round(color.b)));
      return `rgb(${r}, ${g}, ${b})`;
    }

    return this.fallbackColor;
  }

  isBrightnessType(type: string) {
    return 'On/Off plug-in unit' !== type;
  }

  isColorType(type: string) {
    return 'Extended color light' === type;
  }
}
