import { Component, OnInit, signal } from '@angular/core';
import { LightService } from './light.service';
import { ButtonModule } from 'primeng/button';
import { Light } from './light.model';
import { DataViewModule } from 'primeng/dataview';
import { ToggleButton } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { TempratureComponent } from '../meteo/temperature/temperature.component';

@Component({
  selector: 'app-light-list',
  standalone: true,
  templateUrl: './light-list.component.html',
  imports: [ButtonModule, DataViewModule, ToggleButton, FormsModule],
})
export class LightListComponent implements OnInit {
  lights = signal<Light[]>([]);

  constructor(private lightService: LightService) {}

  ngOnInit(): void {
    this.fetchLights();
  }

  fetchLights(): void {
    this.lightService.getLights().subscribe({
      next: (data: Light[]) => {
        this.lights.set(data);
      },
      error: (error: any) => {
        this.lights.set([]);
      },
    });
  }

  changeLight(id: string, state: boolean) {
    this.lightService.changeState(id, state);
  }
}
