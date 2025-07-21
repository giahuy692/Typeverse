// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components declared in SharedModule
import { WritingComponent } from './components/writing/writing.component';
import { ListeningAudioComponent } from './components/listening-audio/listening-audio.component';
import { SpeakingComponent } from './components/speaking/speaking.component';
import { ReadingTestComponent } from './components/reading-test/reading-test.component';
import { ListeningTestComponent } from './components/listening-test/listening-test.component';

import { DropdownModule } from 'primeng/dropdown';
import { AptisReadingComponent } from './components/aptis-reading/aptis-reading.component';


@NgModule({
  declarations: [
    WritingComponent,
    ListeningAudioComponent,
    ListeningTestComponent,
    SpeakingComponent,
    ReadingTestComponent,
    AptisReadingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule
  ],
  exports: [
    WritingComponent,
    ListeningAudioComponent,
    ListeningTestComponent,
    SpeakingComponent,
    ReadingTestComponent,
  ],
})
export class SharedModule {}