// audio-player.component.ts
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { interval, Subject, Subscription, takeUntil, timer } from 'rxjs';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { DTOVideoItem } from '../../DTO/DTOVideoItem';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-audio-player',
  templateUrl: './app-audio-player.component.html',
  styleUrls: ['./app-audio-player.component.scss'],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = LIST_QUESTIONS;

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
  isRecording = false;
  mediaRecorder?: MediaRecorder;
  recordedChunks: Blob[] = [];
  beepEnabled = true;
  toastMessage = '';
  showToast = false;

  private destroy$ = new Subject<void>();
  constructor(private cd: ChangeDetectorRef) {}
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
      this.beepEnabled = true; // Bật beep khi chuyển sang chế độ nói
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
    this.isCountdown = false;
    this.countdown = 0;
    this.answerProgress = 0;
    this.resetDogPosition();
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
    this.dogProgress = 0;
    this.isCountdown = false;
    this.countdown = 0;
    this.answerProgress = 0;
    this.isRecording = false;
    this.resetDogPosition();
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
        this.playBeepBeforeCountdown();
      }
    };
  }

  recordedAudios: { url: string; name: string }[] = [];
  dogProgress = 0;

  /**
   * Phát tiếng beep (nếu được bật) trước khi bắt đầu đếm ngược và ghi âm.
   * Nếu bị tắt, vào thẳng countdown + recording.
   */
  private playBeepBeforeCountdown(): void {
    if (!this.beepEnabled) {
      this.startCountdown();
      return;
    }

    if (this.beepEnabled) {
      const beep = new Audio('assets/sfx/beep.mp3');
      beep.volume = this.audioVolume;
      // ✅ Khi beep phát xong, mới bắt đầu countdown + recording
      beep.onended = () => {
        this.startCountdown();
      };

      beep.play().catch(() => {
        // Nếu play thất bại, fallback vào countdown
        this.startCountdown();
      });
    } else {
      // Nếu beep bị tắt, vào thẳng countdown + recording
      this.startCountdown();
    }
  }

  repeatMode: '3' | '5' | '10' | 'infinite' = '3';
readonly repeatOptions: Array<'3' | '5' | '10' | 'infinite'> = ['3', '5', '10', 'infinite'];
  repeatCount = 0;
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

        // 🔁 Lặp lại nếu chưa đạt limit
        this.repeatCount++;
        const repeatLimit =
          this.repeatMode === 'infinite' ? Infinity : Number(this.repeatMode);

        if (this.repeatCount < repeatLimit) {
          this.playQuestionAgain(); // lặp lại câu hiện tại
        } else {
          this.repeatCount = 0;
          this.nextAudio(); // sang câu tiếp theo
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

  private playQuestionAgain(): void {
    const item = this.data[this.currentIndex];
    this.audio = new Audio(item.audioQuestion);
    this.audio.volume = this.audioVolume;
    this.audio.play();

    this.audio.onended = () => {
      if (this.isListeningMode && item.audioListen) {
        this.playAnswerAudio(item.audioListen);
      } else if (!this.isListeningMode) {
        this.playBeepBeforeCountdown();
      }
    };
  }

  @ViewChild('dog', { static: false }) dogEl?: ElementRef<HTMLImageElement>;
  resetDogPosition() {
    if (this.dogEl?.nativeElement) {
      const el = this.dogEl.nativeElement;
      el.style.transition = 'none';
      el.style.left = '0%';
      el.offsetHeight; // force reflow
      el.style.transition = 'left 0.06s linear';
    }
  }

  private startCountdown() {
    this.countdown = 30;
    this.isCountdown = true;
    const total = 30;

    this.countdownSub = interval(1000)
      .pipe(takeUntil(this.destroy$), takeUntil(timer(total * 1000 + 100)))
      .subscribe(() => {
        this.countdown--;
        this.dogProgress = ((total - this.countdown) / total) * 100;

        if (this.countdown <= 0) {
          this.isCountdown = false;
          this.dogProgress = 0;
          this.resetDogPosition();
          this.stopRecordingIfActive();
          this.countdownSub?.unsubscribe(); // 🔁
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
    this.countdownSub?.unsubscribe();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
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

  private animationFrameId: number | null = null;

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

        // Nếu đã kết thúc
        if (current >= duration && duration > 0) {
          this.answerProgress = 0;
          this.resetDogPosition();
        }
      }

      // Gọi lại vòng lặp nếu đang hoạt động
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

  private countdownSub?: Subscription;
  skipSpeakingCountdown() {
    this.isCountdown = false;
    this.countdown = 0;
    this.dogProgress = 0;
    this.resetDogPosition();

    this.countdownSub?.unsubscribe(); // ✅ Dừng vòng lặp
    this.stopRecordingIfActive(); // ✅ Tách ghi âm ra thành hàm

    this.nextAudio();
  }

  private stopRecordingIfActive() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  /**
   * Hiển thị thông báo ngắn ở góc màn hình
   * @param message Nội dung hiển thị
   */
  showBeepToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cd.detectChanges();
    }, 2500);
  }
}
