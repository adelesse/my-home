import { Component, OnInit, signal } from '@angular/core';
import { LightService } from './light.service';
import { ButtonModule } from 'primeng/button';
import { Light } from './light.model';
import { ToggleButton } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SliderModule } from 'primeng/slider';
import { ColorPicker } from 'primeng/colorpicker';

@Component({
  selector: 'app-light-list',
  standalone: true,
  templateUrl: './light-list.component.html',
  styleUrls: ['./light-list.component.css'],
  imports: [
    ButtonModule,
    TableModule,
    SliderModule,
    ToggleButton,
    ColorPicker,
    FormsModule,
  ],
})
export class LightListComponent implements OnInit {
  lights = signal<Light[]>([]);
  colorValues: { [key: string]: any } = {};

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

  updateBrightness(id: string, brightness: number) {
    this.lightService.updateBrightness(id, brightness);
  }

  updateColor(id: string, color: any) {
    this.lightService.updateHSB(id, color);
  }
}
