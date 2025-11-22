import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { TempratureComponent } from './meteo/temperature/temperature.component';
import { ClockComponent } from "./clock/clock.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ButtonModule, Menubar, RouterModule, TempratureComponent, ClockComponent],
})
export class AppComponent implements OnInit {
  title = 'my-home';
  items: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        items: [
          {
            label: 'Lights',
            icon: 'pi pi-lightbulb',
            route: '/lights',
          },
          {
            label: 'Linky',
            icon: 'pi pi-globe',
            route: '/linky',
          },
          {
            label: 'GazPar',
            icon: 'pi pi-shield',
            route: '/gaz',
          },
        ],
      },
      {
        label: 'Finance',
        icon: 'pi pi-euro',
        route: '/finance',
      },
      {
        label: 'Google',
        icon: 'pi pi-google',
        route: '/google',
      },
      {
        label: 'TCL',
        icon: 'pi pi-truck',
        route: '/tcl',
      },
      {
        label: 'External',
        icon: 'pi pi-link',
        items: [
          {
            label: 'Dev tools',
            url: 'https://brequet.github.io/dev-tools/',
          },
        ],
      },
    ];
  }
}
