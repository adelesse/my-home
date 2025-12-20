import { Component, inject } from '@angular/core';
import { GoogleService } from '../google.service';

@Component({
  selector: 'app-mail',
  imports: [],
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.css',
})
export class MailComponent {
  googleService = inject(GoogleService);
  nbMails: number = 0;

  constructor() {
    this.googleService.countMails().subscribe({
      next: (nbMails: number) => {
        this.nbMails = nbMails;
      },
      error: (error) => {
        this.googleService.login(window.location.href);
      },
    });
  }
}
