import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-video',
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css',
})
export class VideoComponent {
  videos = signal<{ file: File; url: string }[]>([]);
  selectedVideoUrl = signal<string | null>(null);

  onFolderSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const videoFiles = files
      .filter((f) => f.type.startsWith('video/'))
      .map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
      }));

    this.videos.set(videoFiles);
  }

  play(videoUrl: string) {
    this.selectedVideoUrl.set(videoUrl);
  }
}
