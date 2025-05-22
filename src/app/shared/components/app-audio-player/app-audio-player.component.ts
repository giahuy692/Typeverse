// audio-player.component.ts
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { interval, Subject, takeUntil, timer } from 'rxjs';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { DTOVideoItem } from '../../DTO/DTOVideoItem';


@Component({
  selector: 'app-audio-player',
  templateUrl: './app-audio-player.component.html',
  styleUrls: ['./app-audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = LIST_QUESTIONS

  videoPlaylist: DTOVideoItem[] = [
    {
      title: 'Daily Routine - Listening Practice',
      videoPath: 'assets/videos/AllLesson.mp4',
      subtitle: 'I wake up at 7AM and have breakfast with my family.',
    },
    {
      title: 'English Travel Phrases',
      videoPath: 'assets/videos/AllLesson.mp4',
      subtitle: 'Can you tell me how to get to the airport?',
    },
    {
      title: 'Ordering Food at a Restaurant',
      videoPath: 'assets/videos/AllLesson.mp4',
      subtitle: 'I would like a hamburger with fries and a soda, please.',
    },
  ];

  currentIndex = 0;
  playedIndexes: number[] = [];
  audio!: HTMLAudioElement;
  answerAudio!: HTMLAudioElement;
  backgroundMusic: HTMLAudioElement = new Audio(
    'assets/music/Chìm Sâu - RPT MCK.mp3'
  );
  backgroundMuted = false;

  countdown = 0;
  isPlaying = true;
  isCountdown = false;
  isListeningMode = true;
  isVideoMode = false;
  showEffect = false;
  showVideo = false;
  videoVolume = 0.5;
  videoSpeed = 1;
  selectedVideo?: DTOVideoItem;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    const savedVolume = localStorage.getItem('audioVolume');
    this.audioVolume = savedVolume ? parseFloat(savedVolume) : 0.5;

    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.1;
  }

  toggleMode(): void {
    if (this.isListeningMode) {
      this.activateSpeakingMode();
    } else {
      this.activateListeningMode();
    }
  }

  toggleVideoMode(): void {
    this.stopSequence();
    this.resetAudio();
    this.backgroundMusic.pause();
    this.isVideoMode = true;
    this.isListeningMode = false;
  }

  private activateListeningMode(): void {
    this.stopSequence();
    this.resetAudio();
    this.isVideoMode = false;
    this.isListeningMode = true;
    this.playedIndexes = [];
    this.playSequence();
    if (!this.backgroundMuted) {
      this.backgroundMusic.play();
    }
  }

  private activateSpeakingMode(): void {
    this.stopSequence();
    this.resetAudio();
    this.backgroundMusic.pause();
    this.isListeningMode = false;
    this.isVideoMode = false;
    this.playedIndexes = [];
    this.playSequence();
  }

  toggleBackgroundMute(): void {
    this.backgroundMuted = !this.backgroundMuted;
    if (this.backgroundMuted) {
      this.backgroundMusic.pause();
    } else if (this.isListeningMode && this.isPlaying) {
      this.backgroundMusic.play();
    }
  }

  updateBackgroundVolume(volume: number) {
    this.backgroundMusic.volume = volume;
  }

  updateVideoVolume(volume: number) {
    this.videoVolume = volume;
  }

  updateVideoSpeed(speed: number) {
    this.videoSpeed = speed;
  }

  playSequence() {
    this.isPlaying = true;
    this.showVideo = false;
    this.nextAudio();
  }

  stopSequence() {
    this.isPlaying = false;
    this.resetAudio();
    this.destroy$.next();
    this.backgroundMusic.pause();
    this.showVideo = false;
    this.isCountdown = false;
  }

  public nextAudio() {
    if (!this.isPlaying || this.data.length === 0) return;

    const availableIndexes = this.data
      .map((_, i) => i)
      .filter((i) => !this.playedIndexes.includes(i));

    if (availableIndexes.length === 0) {
      this.playedIndexes = [];
      this.nextAudio();
      return;
    }

    const randomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    this.currentIndex = randomIndex;
    this.playedIndexes.push(randomIndex);

    const audioFile = this.data[this.currentIndex];
    this.resetAudio();

    this.audio = new Audio(audioFile.audioQuestion);
    this.audio.volume = this.audioVolume; // áp dụng volume
    this.audio.play();

    this.audio.onended = () => {
      if (this.isListeningMode && audioFile.audioListen) {
        this.playAnswerAudio(audioFile.audioListen);
      } else if (!this.isListeningMode) {
        this.startCountdown();
      }
    };
  }

  private playAnswerAudio(audioQuestion: string) {
    this.answerAudio = new Audio(audioQuestion);
    this.answerAudio.volume = this.audioVolume; // áp dụng volume giống audio chính
    this.answerProgress = 0;
    this.resetDogPosition();
    this.answerAudio.play();
    this.trackAnswerProgress(); // để cập nhật tiến độ thanh progress

    this.showEffect = true;

    this.answerAudio.onended = () => {
      this.showEffect = false;
      this.answerProgress = 0;
      this.resetDogPosition();
      this.nextAudio();
    };
  }

  @ViewChild('dog', { static: false }) dogEl?: ElementRef<HTMLImageElement>;
  resetDogPosition() {
    if (this.dogEl?.nativeElement) {
      const el = this.dogEl.nativeElement;
      el.style.transition = 'none';
      el.style.left = '0%';

      // Force reflow để áp dụng lại từ đầu
      el.offsetHeight;

    }
  }

  private startCountdown() {
    this.countdown = 30;
    this.isCountdown = true;

    interval(1000)
      .pipe(takeUntil(this.destroy$), takeUntil(timer(31000)))
      .subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.isCountdown = false;
          this.nextAudio();
        }
      });
  }

  private resetAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (this.answerAudio) {
      this.answerAudio.pause();
      this.answerAudio.currentTime = 0;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAudio();
    this.backgroundMusic.pause();
    cancelAnimationFrame(this.animationFrameId); // stop loop
  }

  get currentQuestion(): DTOListQuestion | null {
    return this.isPlaying ? this.data[this.currentIndex] : null;
  }

  get currentMode(): string {
    return this.isVideoMode
      ? '🎥 Video'
      : this.isListeningMode
      ? '🎧 Nghe'
      : '🗣️ Nói';
  }

  playVideo(video: DTOVideoItem) {
    this.selectedVideo = video;
    this.showVideo = true;
  }

  enterPiP(videoElement: HTMLVideoElement) {
    if ('pictureInPictureEnabled' in document && videoElement !== null) {
      videoElement.requestPictureInPicture().catch((error) => {
        console.error('PiP error:', error);
      });
    }
  }

  exitPiP() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch((error) => {
        console.error('Exit PiP error:', error);
      });
    }
  }

  hasStarted = false;
  startApp() {
    this.hasStarted = true;
    this.activateListeningMode();
  }

  stopApp() {
    this.hasStarted = false;
    this.stopSequence();
  }

  answerCurrentTime = 0;
  answerDuration = 0;
  answerProgress = 0;

  private animationFrameId: any;

  private trackAnswerProgress() {
    const update = () => {
      if (this.answerAudio && !this.answerAudio.paused) {
        const current = this.answerAudio.currentTime;
        const duration = this.answerAudio.duration || 0;

        this.answerCurrentTime = current;
        this.answerDuration = duration;

        const ratio = duration > 0 ? current / duration : 0;
        this.answerProgress = Math.min(100, Math.max(0, ratio * 100));
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  audioVolume = 0.5;
  updateAllAudioVolume(volume: number) {
    this.audioVolume = volume;
    if (this.audio) this.audio.volume = volume;
    if (this.answerAudio) this.answerAudio.volume = volume;
    localStorage.setItem('audioVolume', String(volume));
  }
}
