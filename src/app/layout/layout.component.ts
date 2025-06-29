// src/app/layout/layout.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppMode, AppModeService } from '../shared/services/app-mode.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  // settingsOpen = false; // Thuộc tính này có thể không cần thiết nếu SettingsService tự quản lý trạng thái drawer

  showHeader: boolean = false;
  currentAppMode: AppMode = 'idle'; // Khởi tạo giá trị mặc định
  private appModeSubscription!: Subscription;

  constructor(
    private appModeService: AppModeService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appModeSubscription = this.appModeService.appMode$.subscribe(mode => {
      this.currentAppMode = mode;
      // this.showHeader = mode !== 'idle';
      this.showHeader = true;
      this.cdRef.detectChanges(); // Quan trọng để cập nhật view
    });
  }

  toggleSidebar = true; // hoặc false, tuỳ muốn mặc định mở/đóng

  /**
   * Thay đổi chế độ hoạt động của ứng dụng từ header.
   * @param mode Chế độ mới ('listening', 'speaking', 'writing').
   */
  changeAppMode(mode: AppMode): void {
    // if (this.currentAppMode === mode) { // Nếu nhấn vào nút đang active -> quay về Welcome
    //   this.appModeService.setMode('idle');
    //   this.router.navigate(['/welcome']); // Điều hướng về trang welcome
    // } else {
      this.appModeService.setMode(mode);
      let navigationPath = '/';
      switch (mode) {
        case 'listening_test':
          navigationPath = '/listening/test';
          break;
        case 'listening_audio':
          navigationPath = '/listening/audio';
          break;
        case 'speaking':
          navigationPath = '/speaking';
          console.warn('Speaking mode navigation from header not implemented yet.');
          break;
        case 'writing':
          navigationPath = '/writing'; 
          console.warn('Writing mode navigation from header not implemented yet.');
          break;
        case 'reading_test':
          navigationPath = '/reading/test'; 
          console.warn('reading test mode navigation from header not implemented yet.');
          break;
      }
      if (navigationPath !== '/' || (navigationPath === '/' && mode === 'idle')) {
         this.router.navigate([navigationPath]);
      }
    // }
  }


  ngOnDestroy(): void {
    if (this.appModeSubscription) {
      this.appModeSubscription.unsubscribe();
    }
  }
}