import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsDrawerComponent } from './components/settings-drawer/settings-drawer.component';
import { FormsModule } from '@angular/forms';
import { ContentDrawerComponent } from './components/content-drawer/content-drawer.component';
import { ContentListComponent } from './components/content-list/content-list.component';
import { ContentItemComponent } from './components/content-item/content-item.component';
import { AudioPlayerComponent } from './components/app-audio-player/app-audio-player.component';

@NgModule({
  declarations: [
    SettingsDrawerComponent,
    ContentDrawerComponent,
    ContentListComponent,
    ContentItemComponent,
    AudioPlayerComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [
    SettingsDrawerComponent,
    ContentDrawerComponent,
    ContentListComponent,
    ContentItemComponent,
    AudioPlayerComponent
  ],
})
export class SharedModule {}
