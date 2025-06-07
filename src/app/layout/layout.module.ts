import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LayoutRoutingModule } from './layout-routing.module';

import { SharedModule } from '../shared/shared.module';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    ThemeToggleComponent,
    WelcomeComponent,
    SidebarMenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    LayoutRoutingModule,
    FormsModule,
    SharedModule,
  ],
})
export class LayoutModule { }