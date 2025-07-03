// src/app/speaking/speaking.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { interval, Subject, Subscription, takeUntil, timer } from 'rxjs';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { AppModeService } from '../../services/app-mode.service';
import { speakinglist } from 'src/assets/mock-data/speaking-practise';

@Component({
  selector: 'app-speaking',
  templateUrl: './speaking.component.html',
  styleUrls: ['./speaking.component.scss'],
})
export class SpeakingComponent implements OnInit, OnDestroy {
  data: DTOListQuestion[] = speakinglist;
  currentIndex = 0;
  playedIndexes: number[] = [];
  audio!: HTMLAudioElement;

  isPlaying = true;
  beepEnabled = true;
  toastMessage = '';
  showToast = false;
  showAnswer = true;
  audioVolume = 0.5;

  isRandomMode: boolean = false; // Mặc định Sequential

  countdown = 0;
  isCountdown = false;
  isRecording = false;
  mediaRecorder?: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedAudios: { url: string; name: string }[] = [];
  dogProgress = 0;

  @ViewChild('dog', { static: false }) dogEl?: ElementRef<HTMLImageElement>; // Nếu vẫn dùng dog animation

  private countdownSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private appModeService: AppModeService) {}

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
    this.stopRecordingIfActive();
    this.isCountdown = false;
    this.countdownSub?.unsubscribe();
  }

  public nextAudio(): void {
    if (!this.isPlaying || this.data.length === 0) return;
    this.countdown = 0; // Reset countdown mỗi khi chuyển câu hỏi

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
      this.playBeepBeforeCountdown();
    };
  }

  private playBeepBeforeCountdown(): void {
    if (!this.beepEnabled) {
      this.startCountdown();
      return;
    }

    const beep = new Audio('assets/sfx/beep.mp3');
    beep.volume = this.audioVolume;
    beep.onended = () => {
      this.startCountdown();
      this.startRecording(); // Bắt đầu ghi âm sau beep
    };
    beep.play().catch(() => {
      this.startCountdown();
      this.startRecording(); // Fallback nếu play beep thất bại
    });
  }

  private startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const audioURL = URL.createObjectURL(blob);
          this.recordedAudios.push({ url: audioURL, name: `Recording ${this.recordedAudios.length + 1}` });
          stream.getTracks().forEach(track => track.stop()); // Dừng stream
        };
        this.mediaRecorder.start();
        this.isRecording = true;
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        this.showBeepToast('Microphone access denied or error!');
      });
  }

  private stopRecordingIfActive() {
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
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
          this.resetDogPosition();
          this.stopRecordingIfActive();
          this.countdownSub?.unsubscribe();
          this.nextAudio();
        }
      });
  }

  public playQuestionAgain(): void {
    const question = this.data[this.currentIndex];
    if (!question) return;

    this.resetAudio();
    this.stopRecordingIfActive(); // Dừng ghi âm nếu đang ghi
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

    this.stopRecordingIfActive(); // Dừng ghi âm nếu đang ghi
    this.countdownSub?.unsubscribe(); // Dừng countdown
    this.isCountdown = false; // Tắt hiển thị countdown

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
        this.playBeepBeforeCountdown();
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
    this.dogProgress = 0; // Reset dog position on audio reset
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAudio();
    this.stopRecordingIfActive();
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
    this.resetDogPosition();

    this.countdownSub?.unsubscribe();
    this.stopRecordingIfActive();

    this.nextAudio();
  }
}