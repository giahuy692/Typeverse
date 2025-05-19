// audio-player.component.ts
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { interval, Subject, takeUntil, timer } from 'rxjs';

interface ListQuestion {
  filePath: string;
  question: string;
  answer: string;
  audioListen?: string;
  videoPath?: string;
}

interface VideoItem {
  title: string;
  videoPath: string;
  subtitle: string;
}

@Component({
  selector: 'app-audio-player',
  templateUrl: './app-audio-player.component.html',
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  data: ListQuestion[] = [
    {
      filePath: 'assets/audios/Whatdidyoudoyesterday.mp3',
      question: 'What did you do yesterday?',
      answer:
        'Yesterday, I played tennis with my friend near my house. We usually play every day, but yesterday was special because we played for a long time. It helped me relax, reduced stress, and improved my health.',
      audioListen: 'assets/audios/answer - What did you do yesterday.mp3',
      videoPath: 'assets/videos/AllLesson.mp4',
    },
    {
      filePath: 'assets/audios/Pleasetellmeaboutyourfriends.mp3',
      question: 'Please tell me about your friends.',
      answer:
        'I am going to tell you about my best friend. Her name is Ngoc. She is 25 years old. She is from Hanoi.  She is a teacher at a high school in Ha Noi. She is an interesting and kind person. She often helps me when I need and shares difficulties with me. I love her very much.',
      audioListen:
        'assets/audios/answer - Please tell me about your friends.mp3',
      videoPath: 'assets/videos/AllLesson.mp4',
    },
    {
      filePath: 'assets/audios/Pleasetellmeaboutyourfavoritefilm.mp3',
      question: 'Please tell me about your favorite film.',
      answer:
        'My favorite film is Tom and Jerry. It’s a funny cartoon about a cat and a mouse. It is very interesting and funny. I have seen this film many times. It helps me relax and reduce stress.',
      audioListen:
        'assets/audios/answer - Please tell me about your favorite film.mp3',
      videoPath: 'assets/videos/AllLesson.mp4',
    },
  ];

  videoPlaylist: VideoItem[] = [
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

  currentIndex: number = 0;
  audio!: HTMLAudioElement;
  answerAudio!: HTMLAudioElement;
  backgroundMusic: HTMLAudioElement = new Audio();
  backgroundMuted = false;
  countdown: number = 0;
  isPlaying = true;
  isCountdown = false;
  isListeningMode = true;
  isVideoMode = false;
  showEffect = false;
  showVideo = false;
  videoVolume = 0.5;
  videoSpeed = 1;
  selectedVideo?: VideoItem;
  private destroy$ = new Subject<void>();

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.backgroundMusic = new Audio('assets/music/Chìm Sâu - RPT MCK (feat. Trung Trần) _ Official Lyrics Video (Backing Track) (Mel-RoFormer by unwa).mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.1;
    if (this.isListeningMode && !this.backgroundMuted) {
      this.backgroundMusic.play();
    }
    this.playSequence();
  }

  toggleMode(): void {
    this.isListeningMode = !this.isListeningMode;
    this.isVideoMode = false;
    this.handleBackgroundMusic();
  }

  toggleVideoMode(): void {
    this.isVideoMode = true;
    this.isListeningMode = false;
    this.backgroundMusic.pause();
    this.stopSequence();
  }

  toggleBackgroundMute(): void {
    this.backgroundMuted = !this.backgroundMuted;
    this.handleBackgroundMusic();
  }

  private handleBackgroundMusic(): void {
    if (this.backgroundMuted || !this.isListeningMode || !this.isPlaying) {
      this.backgroundMusic.pause();
    } else {
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
    this.handleBackgroundMusic();
    this.nextAudio();
  }

  stopSequence() {
    this.isPlaying = false;
    this.resetAudio();
    this.destroy$.next();
    this.backgroundMusic.pause();
    this.showVideo = false;
  }

  public nextAudio() {
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

  playVideo(item: VideoItem) {
    this.selectedVideo = item;
    this.showVideo = true;
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

  get currentQuestion(): ListQuestion | null {
    return this.isPlaying ? this.data[this.currentIndex] : null;
  }

  get currentMode(): string {
    return this.isVideoMode
      ? '🎥 Video'
      : this.isListeningMode
      ? '🎧 Nghe'
      : '🗣️ Nói';
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
}
