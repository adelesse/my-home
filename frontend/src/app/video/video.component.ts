import { Component, inject, signal } from '@angular/core';
import { DefaultParserResult, Parser, addDefaults } from 'parse-torrent-title';
import { Carousel } from 'primeng/carousel';
import { Tooltip } from 'primeng/tooltip';
import { forkJoin, map, of } from 'rxjs';
import { CacheService } from '../shared/cache.service';
import { VideoService } from './video.service';
import { Movie } from './video.model';

@Component({
  selector: 'app-video',
  imports: [Carousel, Tooltip],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css',
})
export class VideoComponent {
  cacheService = inject(CacheService);
  videos = signal<
    {
      file: File;
      url: string;
      titleInfos: DefaultParserResult;
      movie: Movie;
    }[]
  >([]);
  selectedVideoUrl = signal<string | null>(null);
  videoService = inject(VideoService);
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  onFolderSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const parser = new Parser<DefaultParserResult>();
    addDefaults(parser);

    const files = Array.from(input.files).filter((f) =>
      f.type.startsWith('video/')
    );

    const videoFiles$ = forkJoin(
      files.map((file) => {
        const parsed = parser.parse(file.name);
        const title = parsed.title;

        const cacheKey = `movie-${title}`;
        const cachedMovie = this.cacheService.get<Movie>(cacheKey);

        const movie$ = cachedMovie
          ? of(cachedMovie)
          : this.videoService.getMovie(title).pipe(
              map((movie) => {
                this.cacheService.set(cacheKey, movie, 168);
                return movie;
              })
            );

        return movie$.pipe(
          map((movie) => ({
            file,
            url: URL.createObjectURL(file),
            titleInfos: parsed,
            movie,
          }))
        );
      })
    );

    videoFiles$.subscribe((results) => this.videos.set(results));
  }

  play(videoUrl: string) {
    this.selectedVideoUrl.set(videoUrl);
  }
}
