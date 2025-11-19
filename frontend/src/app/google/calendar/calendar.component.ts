import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Timeline } from 'primeng/timeline';
import { GoogleEvent } from '../google.model';
import { GoogleService } from '../google.service';

@Component({
  selector: 'app-calendar',
  imports: [Timeline, CardModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  googleService = inject(GoogleService);
  events: GoogleEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  public getDates(event: GoogleEvent): string | undefined {
    var datePipe = new DatePipe('fr-FR');
    const startDateTime = datePipe.transform(event.start?.dateTime, 'short');
    const startDate = datePipe.transform(event.start?.date, 'shortDate');

    const endDateTime = datePipe.transform(event.end?.dateTime, 'short');
    const endDate = datePipe.transform(event.end?.date, 'shortDate');

    if (endDateTime || endDate) {
      return `${startDateTime || startDate} - ${endDateTime || endDate}`;
    }

    return startDateTime || startDate || undefined;
  }

  private loadEvents() {
    this.googleService.getEvents().subscribe({
      next: (events: GoogleEvent[]) => {
        this.events = events;
        console.log('Events loaded:', this.events);
      },
      error: (error) => {
        this.googleService.login(window.location.href);
      },
    });
  }
}
