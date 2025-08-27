import { Component, OnInit } from '@angular/core';
import { AudioPlayerService } from 'src/app/shared/services/audio-player.service';

@Component({
  selector: 'app-audio-player',
  template: `
    <div class="player-container">
      <div class="playlist">
        <div
          *ngFor="let track of tracks; let i = index"
          (click)="select(i)"
          [class.active]="i === currentIndex"
        >
          {{ extractName(track) }}
        </div>
      </div>
      <div class="controls">
        <div class="time">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
        <input
          type="range"
          #progressRange
          min="0"
          max="100"
          [value]="progress"
          (input)="onSeek(progressRange.value)"
        />

        <div class="buttons">
          <button (click)="prev()">⏮</button>
          <button (click)="toggle()">{{ playing ? '⏸' : '▶️' }}</button>
          <button (click)="next()">⏭</button>
          <select #repeatSelect (change)="setRepeat(repeatSelect.value)">
            <option value="1">1×</option>
            <option value="3">3×</option>
            <option value="10">10×</option>
            <option value="inf">∞</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  tracks = ['assets/ielts/track1.mp3', 'assets/ielts/track2.mp3'];
  currentIndex = 0;
  playing = false;
  currentTime = 0;
  duration = 0;
  progress = 0;

  constructor(private player: AudioPlayerService) {}

  ngOnInit(): void {
    this.player.loadPlaylist(this.tracks);
    // cập nhật thời gian và tiến độ khi audio phát
    this.player.audioElement.addEventListener('timeupdate', () => {
      this.currentTime = this.player.currentTime;
      this.duration = this.player.duration;
      this.progress = this.duration
        ? (this.currentTime / this.duration) * 100
        : 0;
    });
  }

  select(i: number) {
    this.currentIndex = i;
    this.player.selectTrack(i);
    this.playing = true;
  }

  toggle() {
    this.playing = !this.playing;
    this.playing ? this.player.play() : this.player.pause();
  }

  prev() {
    this.player.prev();
  }
  next() {
    this.player.next();
  }
  onSeek(value: string) {
    const percent = parseFloat(value);
    this.player.seekTo(percent);
  }
  setRepeat(value: string) {
    if (value === 'inf') this.player.setRepeat('infinite');
    else this.player.setRepeat(parseInt(value, 10));
  }

  extractName(path: string): string {
    return path.split('/').pop() || path;
  }
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }
}
