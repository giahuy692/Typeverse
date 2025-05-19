import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-settings-drawer',
  templateUrl: './settings-drawer.component.html',
  styleUrls: ['./settings-drawer.component.scss'],
})
export class SettingsDrawerComponent {
  /** Trạng thái drawer: mở hoặc đóng */
  @Input() isOpen = false;

  /** Giá trị thời gian luyện gõ */
  @Input() duration = 30;

  /** Chế độ gõ: timed (theo thời gian) hoặc free (tự do) */
  @Input() typingMode: 'timed' | 'free' = 'timed';

  /** Sự kiện áp dụng thay đổi — chỉ gửi mode và duration */
  @Output() apply = new EventEmitter<any>();

  /** Sự kiện đóng drawer */
  @Output() close = new EventEmitter<void>();

  constructor(private settingsService: SettingsService) {
    // Đăng ký sự kiện đóng drawer từ service
    this.settingsService.isOpen$.subscribe((s) => {
      this.isOpen = s;
    });
  }

  /**
   * Đóng drawer và thông báo cho component cha
   */
  closeDrawer(): void {
    this.close.emit();
    this.settingsService.closeDrawer();
  }

  /**
   * Gửi cấu hình luyện gõ (chế độ và thời lượng) ra component cha
   */
  applySettings(): void {
    this.apply.emit({
      mode: this.typingMode,
      duration: this.duration,
    });
    this.closeDrawer();
  }
}
