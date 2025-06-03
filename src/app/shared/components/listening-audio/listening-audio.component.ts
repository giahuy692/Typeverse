import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { Subject } from 'rxjs';
import { AppModeService } from '../../services/app-mode.service';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';

@Component({
  selector: 'app-listening-audio',
  templateUrl: './listening-audio.component.html',
  styleUrls: ['./listening-audio.component.scss']
})
export class ListeningAudioComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = LIST_QUESTIONS;
  currentIndex = 0;
  playedIndexes: number[] = [];
  audio!: HTMLAudioElement;
  answerAudio!: HTMLAudioElement;
  backgroundMusic: HTMLAudioElement = new Audio('assets/music/Chìm Sâu - RPT MCK.mp3');
  backgroundMuted = false;

  isPlaying = true;
  showEffect = false;
  showAnswer = true;
  beepEnabled = true;
  toastMessage = '';
  showToast = false;
  audioVolume = 0.5;

  repeatMode: '1' | '3' | '5' | '10' | 'infinite' = '3'; // Mặc định 3 lần
  readonly repeatOptions: Array<'1' | '3' | '5' | '10' | 'infinite'> = ['1', '3', '5', '10', 'infinite'];
  repeatCount = 0;
  isRandomMode: boolean = false; // Mặc định Sequential

  answerCurrentTime = 0;
  answerDuration = 0;
  answerProgress = 0;

  @ViewChild('dog', { static: false }) dogEl?: ElementRef<HTMLImageElement>; // Nếu vẫn dùng dog animation

  private animationFrameId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private appModeService: AppModeService) {}

  ngOnInit() {
    const savedVolume = localStorage.getItem('audioVolume');
    this.audioVolume = savedVolume ? parseFloat(savedVolume) : 0.5;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.1;

    // Bắt đầu chế độ nghe ngay khi component được tải
    this.startListening();
  }

  startListening(): void {
    this.appModeService.setMode('listening_audio'); // Đảm bảo AppModeService biết chế độ hiện tại
    this.playSequence(); // Bắt đầu phát audio ngay lập tức
    if (!this.backgroundMuted) {
      this.backgroundMusic.play();
    }
  }

  toggleBackgroundMute(): void {
    this.backgroundMuted = !this.backgroundMuted;
    if (this.backgroundMuted) {
      this.backgroundMusic.pause();
    } else {
      this.backgroundMusic.play();
    }
  }

  updateBackgroundVolume(volume: number) {
    this.backgroundMusic.volume = volume;
  }

  updateAudioVolume(volume: number): void {
    this.audioVolume = +volume;
    if (this.audio) this.audio.volume = this.audioVolume;
    if (this.answerAudio) this.answerAudio.volume = this.audioVolume;
    localStorage.setItem('audioVolume', String(volume));
  }

  playSequence() {
    this.isPlaying = true;
    this.nextAudio();
  }

  stopSequence() {
    this.isPlaying = false;
    this.resetAudio();
    this.destroy$.next();
    this.backgroundMusic.pause();
  }

  public nextAudio(): void {
    if (!this.isPlaying || this.data.length === 0) return;
    this.repeatCount = 0; // Reset repeatCount khi chuyển câu mới

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
        const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        this.currentIndex = randomIndex;
        this.playedIndexes.push(randomIndex);
      }
    } else {
      this.currentIndex++;
      if (this.currentIndex >= this.data.length) {
        this.currentIndex = 0;
      }
    }

    this.resetAudio();
    const audioFile = this.data[this.currentIndex];
    this.audio = new Audio(audioFile.audioQuestion);
    this.audio.play();

    this.audio.onended = () => {
      if (audioFile.audioListen) {
        this.playAnswerAudio(audioFile.audioListen);
      }
    };
  }

  private playAnswerAudio(filePath: string) {
    const startAnswer = () => {
      this.answerAudio = new Audio(filePath);
      this.answerAudio.volume = this.audioVolume;
      this.answerAudio.play();
      this.trackAnswerProgress();
      this.showEffect = true;

      this.answerAudio.onended = () => {
        this.showEffect = false;
        this.answerProgress = 0;
        this.resetDogPosition();

        this.repeatCount++;
        const repeatLimit = this.repeatMode === 'infinite' ? Infinity : Number(this.repeatMode);

        if (this.repeatCount < repeatLimit) {
          this.playQuestionAgain();
        } else {
          this.repeatCount = 0; // Reset count khi chuyển câu mới
          this.nextAudio();
        }
      };
    };

    if (this.beepEnabled) {
      const beep = new Audio('assets/sfx/beep.mp3');
      beep.volume = 0.2;
      beep.onended = () => startAnswer();
      beep.play().catch(() => startAnswer());
    } else {
      startAnswer();
    }
  }

  public playQuestionAgain(): void {
    const question = this.data[this.currentIndex];
    if (!question) return;

    this.resetAudio();
    this.audio = new Audio(question.audioQuestion);
    this.audio.volume = this.audioVolume;
    this.audio.play();

    this.audio.onended = () => {
      if (question.audioListen) {
        this.playAnswerAudio(question.audioListen);
      }
    };
  }

  public prevAudio(): void {
    if (!this.isPlaying || this.data.length === 0) return;

    if (this.isRandomMode) {
      return this.nextAudio();
    } else {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.data.length - 1;
      }

      this.resetAudio();
      const audioFile = this.data[this.currentIndex];
      this.audio = new Audio(audioFile.audioQuestion);
      this.audio.play();

      this.audio.onended = () => {
        if (audioFile.audioListen) {
          this.playAnswerAudio(audioFile.audioListen);
        }
      };
    }
  }

  resetDogPosition() {
    if (this.dogEl?.nativeElement) {
      const el = this.dogEl.nativeElement;
      el.style.transition = 'none';
      el.style.left = '0%';
      el.offsetHeight;
      el.style.transition = 'left 0.06s linear';
    }
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

    this.answerProgress = 0;
    this.resetDogPosition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAudio();
    this.backgroundMusic.pause();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  get currentQuestion(): DTOListQuestion | null {
    return this.isPlaying ? this.data[this.currentIndex] : null;
  }

  public toggleAnswerAudio(): void {
    if (!this.answerAudio) return;
    if (this.answerAudio.paused) {
      this.answerAudio.play();
    } else {
      this.answerAudio.pause();
    }
  }

  stopApp() {
    this.stopSequence();
    this.appModeService.setMode('idle'); // Về chế độ idle khi dừng
  }

  private trackAnswerProgress() {
    const update = () => {
      if (this.answerAudio) {
        const current = this.answerAudio.currentTime;
        const duration = this.answerAudio.duration || 0;

        this.answerCurrentTime = current;
        this.answerDuration = duration;

        if (duration > 0) {
          const ratio = Math.min(1, current / duration);
          this.answerProgress = Number((ratio * 100).toFixed(2));
        } else {
          this.answerProgress = 0;
        }

        if (current >= duration && duration > 0) {
          this.answerProgress = 0;
          this.resetDogPosition();
        }
      }
      this.animationFrameId = requestAnimationFrame(update);
    };
    this.animationFrameId = requestAnimationFrame(update);
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

  get repeatLimit(): number {
    return this.repeatMode === 'infinite' ? Infinity : Number(this.repeatMode);
  }
}
