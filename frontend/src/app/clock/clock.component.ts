import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-clock',
  imports: [DatePipe],
  templateUrl: './clock.component.html',
})
export class ClockComponent {
  now = signal(new Date());
  private intervalId = setInterval(() => {
    this.now.set(new Date());
  }, 1000);

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
