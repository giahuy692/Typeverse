import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private audio = new Audio();
  private playlist: string[] = [];
  private index = 0;
  private repeatCount = 1;
  private currentLoop = 0;
  private infinite = false;

  constructor() {
    this.audio.onended = () => this.handleEnded();
  }

  loadPlaylist(list: string[]) {
    this.playlist = list;
    this.index = 0;
    this.loadCurrent();
  }

  // Cho phép component truy cập audio để đọc currentTime/duration
  get audioElement(): HTMLAudioElement { return this.audio; }
  get currentTime(): number { return this.audio.currentTime || 0; }
  get duration(): number { return this.audio.duration || 0; }

  seekTo(percent: number) {
    if (this.duration > 0) {
      this.audio.currentTime = (percent / 100) * this.duration;
    }
  }

  setRepeat(times: number | 'infinite') {
    if (times === 'infinite') {
      this.infinite = true;
      this.audio.loop = true;
    } else {
      this.infinite = false;
      this.audio.loop = false;
      this.repeatCount = times;
      this.currentLoop = 0;
    }
  }

  play() { this.audio.play(); }
  pause() { this.audio.pause(); }
  next() {
    this.index = (this.index + 1) % this.playlist.length;
    this.loadCurrent();
    this.play();
  }
  prev() {
    this.index = (this.index - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrent();
    this.play();
  }
  selectTrack(i: number) {
    this.index = i;
    this.loadCurrent();
    this.play();
  }

  private loadCurrent() {
    this.currentLoop = 0;
    this.audio.src = this.playlist[this.index];
    this.audio.load();
  }
  private handleEnded() {
    if (this.infinite) return;
    this.currentLoop++;
    if (this.currentLoop < this.repeatCount) {
      this.audio.play();
    } else {
      this.next();
    }
  }
}
