import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router'; // 👉 BỔ SUNG DÒNG NÀY

@NgModule({
  declarations: [
    HeaderComponent,
    ThemeToggleComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule // 👉 BỔ SUNG VÀO ĐÂY
  ],
  exports: [LayoutComponent]
})
export class LayoutModule {}
