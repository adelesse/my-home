import { Component, inject, OnInit, signal } from '@angular/core';
import { addDefaults, DefaultParserResult, Parser } from 'parse-torrent-title';
import { Carousel } from 'primeng/carousel';
import { Tooltip } from 'primeng/tooltip';
import { forkJoin, map, of } from 'rxjs';
import { CacheService } from '../shared/cache.service';
import { Movie } from './video.model';
import { VideoService } from './video.service';
import { ButtonModule } from "primeng/button";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChromecast } from '@fortawesome/free-brands-svg-icons';

declare const cast: any;
declare const chrome: any;

@Component({
  selector: 'app-video',
  imports: [Carousel, Tooltip, ButtonModule, FontAwesomeModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css',
})
export class VideoComponent implements OnInit {
  faChromecast = faChromecast;
  cacheService = inject(CacheService);
  videos = signal<
    {
      url: string;
      titleInfos: DefaultParserResult;
      movie: Movie;
    }[]
  >([]);
  selectedVideoUrl = signal<string | null>(null);
  selectedVideoTitle = signal<string>('');
  castStatusMessage = signal<string>('');
  isCastAvailable = signal<boolean>(false);
  castServerBaseUrl = signal<string | null>(null);
  private castFrameworkScript =
    'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
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
  readonly BACKEND_ORIGIN = window.location.origin;

  ngOnInit() {
    this.initializeCast();
    this.loadCastServerBaseUrl();
    this.loadDefaultVideos();
  }

  loadDefaultVideos() {
    this.videoService.getDefaultVideos().subscribe((files) => {
      this.loadVideosFromFiles(files);
    });
  }

  onFolderSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files).filter((f) => f.type.startsWith('video/'));

    this.loadVideosFromFiles(files);
  }

  private loadVideosFromFiles(files: (File | { name: string; url: string })[]) {
    const parser = new Parser<DefaultParserResult>();
    addDefaults(parser);

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
            url: 'url' in file ? this.BACKEND_ORIGIN + file.url : URL.createObjectURL(file),
            titleInfos: parsed,
            movie,
          }))
        );
      })
    );

    videoFiles$.subscribe((results) => this.videos.set(results));
  }

  play(videoUrl: string, title: string) {
    this.selectedVideoUrl.set(videoUrl);
    this.selectedVideoTitle.set(title);
    this.castStatusMessage.set('');
  }

  async castSelectedVideo() {
    const selectedUrl = this.selectedVideoUrl();

    if (!selectedUrl) {
      this.castStatusMessage.set('Sélectionnez une vidéo avant de caster.');
      return;
    }

    if (selectedUrl.startsWith('blob:')) {
      this.castStatusMessage.set(
        'Le cast ne supporte pas les vidéos locales chargées via le navigateur. Utilisez une vidéo servie par le backend.'
      );
      return;
    }

    if (!this.isCastFormatSupported(selectedUrl)) {
      this.castStatusMessage.set(
        'Format potentiellement non supporté par Chromecast. Privilégiez MP4 (H.264/AAC) ou WebM.'
      );
      return;
    }

    const castableUrl = this.getCastableUrl(selectedUrl);
    if (!castableUrl) {
      this.castStatusMessage.set(
        'Impossible de construire une URL réseau pour le Chromecast. Recharge la page depuis une URL LAN ou vérifie le backend.'
      );
      return;
    }

    if (!this.isCastAvailable()) {
      this.castStatusMessage.set('Aucun appareil Chromecast détecté ou SDK Cast indisponible.');
      return;
    }

    try {
      const castContext = cast.framework.CastContext.getInstance();
      if (!castContext.getCurrentSession()) {
        await castContext.requestSession();
      }

      const session = castContext.getCurrentSession();
      if (!session) {
        this.castStatusMessage.set('Connexion Chromecast annulée.');
        return;
      }

      const mediaInfo = new chrome.cast.media.MediaInfo(
        castableUrl,
        this.getMimeTypeFromUrl(castableUrl)
      );
      const metadata = new chrome.cast.media.GenericMediaMetadata();
      metadata.title = this.selectedVideoTitle() || 'Vidéo';
      mediaInfo.metadata = metadata;

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      await session.loadMedia(request);
      this.castStatusMessage.set('Lecture envoyée sur Chromecast.');
    } catch {
      this.castStatusMessage.set('Impossible de caster cette vidéo pour le moment.');
    }
  }

  private initializeCast() {
    if (typeof window === 'undefined') return;

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      this.castStatusMessage.set('Le cast requiert HTTPS (ou localhost en développement).');
      return;
    }

    const castWindow = window as any;
    castWindow.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (!isAvailable) {
        this.castStatusMessage.set('Le SDK Google Cast n’a pas pu être chargé.');
        return;
      }

      const castContext = cast.framework.CastContext.getInstance();
      castContext.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      castContext.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: { sessionState: string }) => {
          if (
            event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === cast.framework.SessionState.SESSION_RESUMED
          ) {
            this.castStatusMessage.set('Chromecast connecté.');
          }

          if (event.sessionState === cast.framework.SessionState.SESSION_ENDED) {
            this.castStatusMessage.set('Session Chromecast terminée.');
          }
        }
      );

      this.isCastAvailable.set(true);
    };

    const existingScript = document.querySelector(`script[src="${this.castFrameworkScript}"]`);
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = this.castFrameworkScript;
    script.async = true;
    script.onerror = () => {
      this.castStatusMessage.set('Impossible de charger le SDK Google Cast.');
    };
    document.head.appendChild(script);
  }

  private loadCastServerBaseUrl() {
    this.videoService.getCastBaseUrl().subscribe({
      next: ({ baseUrl }) => this.castServerBaseUrl.set(baseUrl),
      error: () => {
        this.castStatusMessage.set(
          'Base URL Cast non détectée automatiquement. Le cast peut échouer si la vidéo pointe vers localhost.'
        );
      },
    });
  }

  private getCastableUrl(url: string): string | null {
    const parsedUrl = new URL(url, window.location.origin);
    const hostname = parsedUrl.hostname;

    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return parsedUrl.toString();
    }

    const baseUrl = this.castServerBaseUrl();
    if (!baseUrl) return null;

    return `${baseUrl}${parsedUrl.pathname}${parsedUrl.search}`;
  }

  private isCastFormatSupported(url: string): boolean {
    const extension = url.split('.').pop()?.toLowerCase() ?? '';
    return ['mp4', 'webm', 'mov'].includes(extension);
  }

  private getMimeTypeFromUrl(url: string) {
    const extension = url.split('.').pop()?.toLowerCase() ?? '';
    const mimeByExt: Record<string, string> = {
      mp4: 'video/mp4',
      mkv: 'video/x-matroska',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
    };

    return mimeByExt[extension] ?? 'video/mp4';
  }
}
