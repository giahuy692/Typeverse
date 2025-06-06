// src/app/layout/layout.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppMode, AppModeService } from '../shared/services/app-mode.service';

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
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.appModeSubscription = this.appModeService.appMode$.subscribe(mode => {
      this.currentAppMode = mode;
      // this.showHeader = mode !== 'idle';
      this.showHeader = true;
      this.cdRef.detectChanges(); // Quan trọng để cập nhật view
    });
  }

  ngOnDestroy(): void {
    if (this.appModeSubscription) {
      this.appModeSubscription.unsubscribe();
    }
  }
}