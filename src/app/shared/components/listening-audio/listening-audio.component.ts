import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { Subject } from 'rxjs';
import { AppModeService } from '../../services/app-mode.service';
import { speakinglist } from 'src/assets/mock-data/speaking-practise';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';

@Component({
  selector: 'app-listening-audio',
  templateUrl: './listening-audio.component.html',
  styleUrls: ['./listening-audio.component.scss'],
})
export class ListeningAudioComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = LIST_QUESTIONS;
  currentIndex = -1; // Bắt đầu từ -1 để nextAudio sẽ tăng lên 0 đầu tiên
  playedIndexes: number[] = [];
  audio: HTMLAudioElement | null = null;
  answerAudio: HTMLAudioElement | null = null;
  backgroundMusic: HTMLAudioElement = new Audio(
    'assets/music/Chìm Sâu - RPT MCK.mp3'
  );
  backgroundMuted = false;
  translateTV: boolean = false;

  isPlaying = true;
  showEffect = false;
  showAnswer = true;
  beepEnabled = true;
  toastMessage = '';
  showToast = false;
  audioVolume = 0.5;

  repeatMode: '1' | '3' | '5' | '10' | 'infinite' = '3'; // Mặc định 3 lần
  readonly repeatOptions: Array<'1' | '3' | '5' | '10' | 'infinite'> = [
    '1',
    '3',
    '5',
    '10',
    'infinite',
  ];
  repeatCount = 0;
  isRandomMode: boolean = false; // Mặc định Sequential

  answerCurrentTime = 0;
  answerDuration = 0;
  answerProgress = 0;

  @ViewChildren('questionRow') questionRows!: QueryList<ElementRef>;
  private animationFrameId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private appModeService: AppModeService
  ) {}

  ngOnInit() {
    const savedVolume = localStorage.getItem('audioVolume');
    this.audioVolume = savedVolume ? parseFloat(savedVolume) : 0.5;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.05; // Mặc định âm lượng nhạc nền

    // Bắt đầu chế độ nghe ngay khi component được tải
    this.startListening();
  }

  startListening(): void {
    this.appModeService.setMode('listening_audio'); // Đảm bảo AppModeService biết chế độ hiện tại
    this.playSequence(); // Bắt đầu phát audio ngay lập tức
    if (!this.backgroundMuted) {
      this.backgroundMusic.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });
    }
  }

  toggleBackgroundMute(): void {
    this.backgroundMuted = !this.backgroundMuted;
    if (this.backgroundMuted) {
      this.backgroundMusic.pause();
    } else {
      this.backgroundMusic.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });
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
    this.resetAudio();
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
    this.audio.volume = this.audioVolume;
    this.audio.play().catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Audio play error:', err);
      }
    });
    this.scrollActiveRowIntoView();

    this.audio.onended = () => {
      if (audioFile.audioListen) {
        const answerAudioPath = this.translateTV
          ? audioFile.audioTV
          : audioFile.audioListen;
        if (answerAudioPath) {
          this.playAnswerAudio(answerAudioPath);
        }
      }
    };
  }

  private playAnswerAudio(filePath: string) {
    const startAnswer = () => {
      this.answerAudio = new Audio(filePath);
      this.answerAudio.volume = this.audioVolume;
      this.answerAudio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });
      this.trackAnswerProgress();
      this.showEffect = true;

      this.answerAudio.onended = () => {
        this.showEffect = false;
        this.answerProgress = 0;

        this.repeatCount++;
        const repeatLimit =
          this.repeatMode === 'infinite' ? Infinity : Number(this.repeatMode);

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
    this.audio.play().catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Audio play error:', err);
      }
    });

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
      this.audio.volume = this.audioVolume;
      this.audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });

      this.audio.onended = () => {
        if (audioFile.audioListen) {
          const answerAudioPath = this.translateTV
            ? audioFile.audioTV
            : audioFile.audioListen;
          if (answerAudioPath) {
            this.playAnswerAudio(answerAudioPath);
          }
        }
      };
    }
    this.scrollActiveRowIntoView();
  }

  private resetAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.onended = null;
      this.audio = null;
    }

    if (this.answerAudio) {
      this.answerAudio.pause();
      this.answerAudio.currentTime = 0;
      this.answerAudio.onended = null;
      this.answerAudio = null;
    }

    this.answerProgress = 0;
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
      this.answerAudio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Audio play error:', err);
        }
      });
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

  shuffleQuestions(): void {
    // Thuật toán Fisher-Yates chuẩn
    for (let i = this.data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
    this.prevAudio();
  }

  showDrawer: boolean = false;
  /**
   * Chuyển đến câu hỏi được chọn và phát ngay.
   * Sau khi phát xong câu trả lời, nếu `isPlaying` vẫn true
   * thì sẽ tiếp tục phát câu tiếp theo theo luồng tự động.
   */
  public goToQuestion(idx: number): void {
    // 1. Kiểm tra chỉ số
    if (idx < 0 || idx >= this.data.length) return;

    // 2. Dừng & reset mọi audio đang phát
    this.resetAudio();
    this.repeatCount = 0;

    // 3. Cập nhật câu hỏi hiện tại
    this.currentIndex = idx;
    this.scrollActiveRowIntoView();

    // 4. Bật lại luồng phát tự động
    this.isPlaying = true;

    // 5. Lấy thông tin file audio của câu hỏi
    const audioFile = this.data[this.currentIndex];
    if (!audioFile?.audioQuestion) return;

    // 6. Tạo và phát audio câu hỏi
    this.audio = new Audio(audioFile.audioQuestion);
    this.audio.volume = this.audioVolume;
    this.audio.onended = () => {
      const answerAudioPath = this.translateTV
        ? audioFile.audioTV
        : audioFile.audioListen;
      if (answerAudioPath) {
        // Phát audio đáp án sau khi audio câu hỏi kết thúc
        this.playAnswerAudio(answerAudioPath);
      } else {
        // Không có audio đáp án thì next luôn
        if (this.isPlaying) {
          setTimeout(() => this.nextAudio(), 350);
        }
      }
    };

    this.audio.play().catch((err) => console.error('Lỗi phát audio:', err));
  }

  private scrollActiveRowIntoView() {
    if (!this.questionRows || !this.questionRows.length) return;
    // lấy index hiện tại
    const row = this.questionRows.toArray()[this.currentIndex];
    if (row && row.nativeElement) {
      row.nativeElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }

  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    // Tắt hết audio ngay trước khi reload
    if (this.audio) this.audio.pause();
    if (this.answerAudio) this.answerAudio.pause();
    this.backgroundMusic.pause();
  }
}
