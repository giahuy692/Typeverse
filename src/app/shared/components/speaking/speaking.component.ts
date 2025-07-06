// src/app/speaking/speaking.component.ts
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { interval, Subject, Subscription, takeUntil, timer } from 'rxjs';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { AppModeService } from '../../services/app-mode.service';
import { speakinglist } from 'src/assets/mock-data/speaking-practise';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';

@Component({
  selector: 'app-speaking',
  templateUrl: './speaking.component.html',
  styleUrls: ['./speaking.component.scss'],
})
export class SpeakingComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = LIST_QUESTIONS;
  currentIndex = -1;
  playedIndexes: number[] = [];
  audio!: HTMLAudioElement;
  beep = new Audio('assets/sfx/beep.mp3');
  isPlaying = true;
  beepEnabled = true;
  toastMessage = '';
  showToast = false;
  showAnswer = true;
  audioVolume = 0.5;

  isRandomMode: boolean = false; // Mặc định Sequential

  countdown = 0;
  isCountdown = false;
  mediaRecorder?: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedAudios: { url: string; name: string }[] = [];
  dogProgress = 0;

  @ViewChild('dog', { static: false }) dogEl?: ElementRef<HTMLImageElement>; // Nếu vẫn dùng dog animation

  private countdownSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private appModeService: AppModeService
  ) {}

  ngOnInit() {
    const savedVolume = localStorage.getItem('audioVolume');
    this.audioVolume = savedVolume ? parseFloat(savedVolume) : 0.5;

    // Bắt đầu chế độ nói ngay khi component được tải
    this.startSpeaking();
  }

  startSpeaking(): void {
    this.appModeService.setMode('speaking'); // Đảm bảo AppModeService biết chế độ hiện tại
    this.playSequence(); // Bắt đầu phát audio ngay lập tức (cho câu hỏi)
  }

  playSequence() {
    this.isPlaying = true;
    this.nextAudio();
  }

  stopSequence() {
    this.isPlaying = false;
    this.resetAudio();
    this.destroy$.next();
    this.isCountdown = false;
    this.countdownSub?.unsubscribe();
  }

  public nextAudio(): void {
    if (!this.isPlaying || this.data.length === 0) return;
    this.countdown = 0; // Reset countdown mỗi khi chuyển câu hỏi
    this.resetAudio();

    if (this.isRandomMode) {
      const availableIndexes = this.data
        .map((_, i) => i)
        .filter((i) => !this.playedIndexes.includes(i));

      if (availableIndexes.length === 0) {
        this.playedIndexes = [];
        if (this.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.data.length);
          this.currentIndex = randomIndex;
          this.playedIndexes.push(randomIndex);
        } else {
          return;
        }
      } else {
        const randomIndex =
          availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        this.currentIndex = randomIndex;
        this.playedIndexes.push(randomIndex);
      }
    } else {
      this.currentIndex++;
      if (this.currentIndex >= this.data.length) {
        this.currentIndex = 0;
      }
    }

    const audioFile = this.data[this.currentIndex];
    this.audio = new Audio(audioFile.audioQuestion);
    this.audio.play();

    this.audio.onended = () => {
      this.playBeepBeforeCountdown();
    };
  }

  private playBeepBeforeCountdown(): void {
    if (!this.beepEnabled) {
      this.startCountdown();
      return;
    }

    
    this.beep.volume = this.audioVolume;
    this.beep.onended = () => {
      this.startCountdown();
    };
    this.beep.play().catch(() => {
      this.startCountdown();
    });
  }

  private startCountdown() {
    this.countdown = 60; // 30 giây cho chế độ nói
    this.isCountdown = true;
    const total = 60;

    this.countdownSub = interval(1000)
      .pipe(takeUntil(this.destroy$), takeUntil(timer(total * 1000 + 100)))
      .subscribe(() => {
        this.countdown--;
        this.dogProgress = ((total - this.countdown) / total) * 100;

        if (this.countdown <= 0) {
          this.isCountdown = false;
          this.dogProgress = 0;
          this.countdownSub?.unsubscribe();
          this.nextAudio();
        }
      });
  }

  public playQuestionAgain(): void {
    const question = this.data[this.currentIndex];
    if (!question) return;

    this.resetAudio();
    this.countdownSub?.unsubscribe(); // Dừng countdown
    this.isCountdown = false; // Tắt hiển thị countdown

    this.audio = new Audio(question.audioQuestion);
    this.audio.volume = this.audioVolume;
    this.audio.play();

    this.audio.onended = () => {
      this.playBeepBeforeCountdown();
    };
  }

  public prevAudio(): void {
    if (!this.isPlaying || this.data.length === 0) return;
    this.resetAudio();

    this.countdownSub?.unsubscribe(); // Dừng countdown
    this.isCountdown = false; // Tắt hiển thị countdown

    if (this.isRandomMode) {
      return this.nextAudio();
    } else {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.data.length - 1;
      }

      const audioFile = this.data[this.currentIndex];
      this.audio = new Audio(audioFile.audioQuestion);
      this.audio.play();

      this.audio.onended = () => {
        this.playBeepBeforeCountdown();
      };
    }
  }

  private resetAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.countdownSub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAudio();
    this.countdownSub?.unsubscribe();
  }

  get currentQuestion(): DTOListQuestion | null {
    return this.isPlaying ? this.data[this.currentIndex] : null;
  }

  stopApp() {
    this.stopSequence();
    this.appModeService.setMode('idle'); // Về chế độ idle khi dừng
  }

  showBeepToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cd.detectChanges();
    }, 2500);
  }

  updateAudioVolume(volume: number): void {
    this.audioVolume = +volume;
    if (this.audio) this.audio.volume = this.audioVolume;
  }

  skipSpeakingCountdown() {
    this.isCountdown = false;
    this.countdown = 0;
    this.dogProgress = 0;

    this.countdownSub?.unsubscribe();
    this.nextAudio();
  }
}
