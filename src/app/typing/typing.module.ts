import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypingBoxComponent } from './components/typing-box/typing-box.component';
import { TypingPageComponent } from './pages/typing-page/typing-page.component';
import { TypingRoutingModule } from './typing-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    TypingBoxComponent,
    TypingPageComponent,
  ],
  imports: [
    CommonModule,
    TypingRoutingModule,
    FormsModule,
    SharedModule
  ]
})

export class TypingModule {}
