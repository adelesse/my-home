import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeTo',
  standalone: true,
})
export class TimeToPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const target = new Date(value).getTime();
    const now = Date.now();

    const diffMs = target - now;
    if (diffMs <= 0) {
      return '0 min';
    }

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }

    return `${minutes} min`;
  }
}
