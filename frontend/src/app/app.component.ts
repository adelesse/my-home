import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { ClockComponent } from './clock/clock.component';
import { MailComponent } from './google/mail/mail.component';
import { MeteoIconComponent } from './meteo/meteo-icon/meteo-icon.component';
import { TempratureComponent } from './meteo/temperature/temperature.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    ButtonModule,
    Menubar,
    FontAwesomeModule,
    RouterModule,
    TempratureComponent,
    ClockComponent,
    MailComponent,
    MeteoIconComponent,
  ],
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
        route: '/main',
      },
      {
        label: 'Énergie',
        icon: 'pi pi-sun',
        items: [
          {
            label: 'Lumières',
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
        label: 'Vidéos',
        icon: 'pi pi-video',
        route: '/video',
      },
      {
        label: 'Externe',
        icon: 'pi pi-link',
        items: [
          {
            label: 'Dev tools',
            target: '_blank',
            icon: 'pi pi-wrench',
            url: 'https://brequet.github.io/dev-tools/',
          },
          {
            label: 'Github MyHome',
            target: '_blank',
            icon: 'pi pi-github',
            url: 'https://github.com/adelesse/my-home/',
          },
        ],
      },
    ];
  }
}
