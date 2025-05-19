// audio-player.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, Subscription, takeUntil, timer } from 'rxjs';

interface CauHoiAudio {
  filePath: string;
  cauHoi: string;
  doanVan: string;
  audioListen?: string;
}

@Component({
  selector: 'app-audio-player',
  templateUrl: './app-audio-player.component.html',
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  data: CauHoiAudio[] = [
    {
      filePath: 'assets/audios/Whatdidyoudoyesterday.mp3',
      cauHoi: 'What did you do yesterday?',
      doanVan:
        'Yesterday, I played tennis with my friend near my house. We usually play every day, but yesterday was special because we played for a long time. It helped me relax, reduced stress, and improved my health.',
      audioListen: 'assets/audios/answer - What did you do yesterday.mp3'
    },
    {
      filePath: 'assets/audios/Pleasetellmeaboutyourfriends.mp3',
      cauHoi: 'Please tell me about your friends.',
      doanVan:
        'I am going to tell you about my best friend. Her name is Ngoc. She is 25 years old. She is from Hanoi.  She is a teacher at a high school in Ha Noi. She is an interesting and kind person. She often helps me when I need and shares difficulties with me. I love her very much.',
      audioListen: 'assets/audios/answer - Please tell me about your friends.mp3'
    },
    {
      filePath: 'assets/audios/Pleasetellmeaboutyourfavoritefilm.mp3',
      cauHoi: 'Please tell me about your favorite film.',
      doanVan:
        'My favorite film is Tom and Jerry. It’s a funny cartoon about a cat and a mouse. It is very interesting and funny. I have seen this film many times. It helps me relax and reduce stress.',
      audioListen: 'assets/audios/answer - Please tell me about your favorite film.mp3'
    },
  ];

  currentIndex: number = 0;
  audio!: HTMLAudioElement;
  answerAudio!: HTMLAudioElement;
  backgroundMusic!: HTMLAudioElement;
  countdown: number = 0;
  isPlaying = false;
  isCountdown = false;
  isListeningMode = false;
  showEffect = false;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.backgroundMusic = new Audio('assets/music/Chìm Sâu - RPT MCK (feat. Trung Trần) _ Official Lyrics Video (Backing Track) (Mel-RoFormer by unwa).mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
  }

  toggleMode(): void {
    this.isListeningMode = !this.isListeningMode;
    if (this.isListeningMode && this.isPlaying) {
      this.backgroundMusic.play();
    } else {
      this.backgroundMusic.pause();
    }
  }

  updateBackgroundVolume(volume: number) {
    this.backgroundMusic.volume = volume;
  }

  playSequence() {
    this.isPlaying = true;
    if (this.isListeningMode) this.backgroundMusic.play();
    this.nextAudio();
  }

  stopSequence() {
    this.isPlaying = false;
    this.resetAudio();
    this.destroy$.next();
    this.backgroundMusic.pause();
  }

  private nextAudio() {
    if (!this.isPlaying) return;

    this.currentIndex = Math.floor(Math.random() * this.data.length);
    const audioFile = this.data[this.currentIndex];

    this.resetAudio();
    this.audio = new Audio(audioFile.filePath);
    this.audio.play();

    this.audio.onended = () => {
      if (this.isListeningMode && audioFile.audioListen) {
        this.playAnswerAudio(audioFile.audioListen);
      } else {
        this.startCountdown();
      }
    };
  }

  private playAnswerAudio(filePath: string) {
    this.answerAudio = new Audio(filePath);
    this.answerAudio.play();
    this.showEffect = true;

    this.answerAudio.onended = () => {
      this.showEffect = false;
      this.nextAudio();
    };
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
  }

  get currentQuestion(): CauHoiAudio | null {
    return this.isPlaying ? this.data[this.currentIndex] : null;
  }

  get currentMode(): string {
    return this.isListeningMode ? '🎧 Nghe' : '🗣️ Nói';
  }
}
