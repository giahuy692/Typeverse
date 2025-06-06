// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components declared in SharedModule
import { AudioPlayerComponent } from './components/app-audio-player/app-audio-player.component';
import { WritingComponent } from './components/writing/writing.component';
import { ListeningAudioComponent } from './components/listening-audio/listening-audio.component';
import { SpeakingComponent } from './components/speaking/speaking.component';
import { ReadingTestComponent } from './components/reading-test/reading-test.component';
import { ListeningTestComponent } from './components/listening-test/listening-test.component';

import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AudioPlayerComponent,
    WritingComponent,
    ListeningAudioComponent,
    ListeningTestComponent,
    SpeakingComponent,
    ReadingTestComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    DragDropModule
  ],
  exports: [
    AudioPlayerComponent,
    WritingComponent,
    ListeningAudioComponent,
    ListeningTestComponent,
    SpeakingComponent,
    ReadingTestComponent,
  ],
})
export class SharedModule {}