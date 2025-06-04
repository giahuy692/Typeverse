import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerComponent } from './components/app-audio-player/app-audio-player.component';
// import { ListeningComponent } from './components/listening/listening.component'; // XÓA KHAI BÁO ListeningComponent ở đây
import { FormsModule } from '@angular/forms';
import { WritingComponent } from './components/writing/writing.component';
import { ListeningAudioComponent } from './components/listening-audio/listening-audio.component';
import { SpeakingComponent } from './components/speaking/speaking.component';
import { ReadingTestComponent } from './components/reading-test/reading-test.component';
import { ListeningTestComponent } from './components/listening-test/listening-test.component';

@NgModule({
  declarations: [
    AudioPlayerComponent,
    WritingComponent,
    ListeningAudioComponent,
    ListeningTestComponent,
    SpeakingComponent,
    ReadingTestComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [
    AudioPlayerComponent
  ],
})
export class SharedModule {}