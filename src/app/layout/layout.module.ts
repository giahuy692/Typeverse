import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LayoutRoutingModule } from './layout-routing.module';

import { ListeningTestComponent } from '../shared/components/listening-test/listening-test.component'; 

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    ThemeToggleComponent,
    WelcomeComponent,
    ListeningTestComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    LayoutRoutingModule,
    FormsModule 
  ],
})
export class LayoutModule { }