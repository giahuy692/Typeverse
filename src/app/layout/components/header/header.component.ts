// src/app/layout/components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Thêm OnInit, OnDestroy
import { SettingsService } from 'src/app/core/services/settings.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AppMode, AppModeService } from 'src/app/shared/services/app-mode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentAppMode: AppMode = 'idle';
  private appModeSubscription!: Subscription;

  constructor(
    private settingsService: SettingsService,
    private appModeService: AppModeService, // Inject AppModeService
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    // Theo dõi sự thay đổi chế độ ứng dụng từ service
    this.appModeSubscription = this.appModeService.appMode$.subscribe(mode => {
      this.currentAppMode = mode;
    });
  }

  openSettingsDrawer(): void { // Đổi tên phương thức cho nhất quán (nếu file HTML của bạn dùng open())
    this.settingsService.openDrawer();
  }

  /**
   * Thay đổi chế độ hoạt động của ứng dụng từ header.
   * @param mode Chế độ mới ('listening', 'speaking', 'writing').
   */
  changeAppMode(mode: AppMode): void {
    if (this.currentAppMode === mode) { // Nếu nhấn vào nút đang active -> quay về Welcome
      this.appModeService.setMode('idle');
      this.router.navigate(['/welcome']); // Điều hướng về trang welcome
    } else {
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
      }
      if (navigationPath !== '/' || (navigationPath === '/' && mode === 'idle')) {
         this.router.navigate([navigationPath]);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.appModeSubscription) {
      this.appModeSubscription.unsubscribe();
    }
  }
}