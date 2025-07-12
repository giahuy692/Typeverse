import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ListeningTestComponent } from '../shared/components/listening-test/listening-test.component';
import { ListeningAudioComponent } from '../shared/components/listening-audio/listening-audio.component';
import { SpeakingComponent } from '../shared/components/speaking/speaking.component';
import { WritingComponent } from '../shared/components/writing/writing.component';
import { ReadingTestComponent } from '../shared/components/reading-test/reading-test.component';
import { PdfListComponent } from './components/pdf-list/pdf-list.component';

const routes: Routes = [
  {
    path: '', // Path này là tương đối với path mà LayoutModule được load (trong AppRoutingModule là '')
    // component: LayoutComponent,
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: 'listening/test', component: ListeningTestComponent },
      { path: 'reading/test', component: ReadingTestComponent },
      { path: 'listening/audio', component: ListeningAudioComponent },
      { path: 'speaking', component: SpeakingComponent },
      { path: 'writing', component: WritingComponent },
      { path: 'pdf', component: PdfListComponent },

      // Route mặc định cho layout, sẽ điều hướng đến 'welcome'
      { path: '', redirectTo: 'listening/test', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Sử dụng forChild() cho các feature/layout modules
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
