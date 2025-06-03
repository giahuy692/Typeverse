// src/app/core/services/app-mode.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Định nghĩa các chế độ hoạt động có thể có của ứng dụng.
 * - idle: Trạng thái chờ, chưa có hoạt động nào được chọn.
 * - listening: Chế độ luyện nghe.
 * - speaking: Chế độ luyện nói.
 * - writing: Chế độ luyện viết.
 */
export type AppMode = 'listening_test' | 'listening_audio' | 'speaking' | 'writing' | 'idle' ;

/**
 * @Injectable
 * Service để quản lý và thông báo trạng thái (mode) hiện tại của ứng dụng.
 * Giúp các component không liên quan trực tiếp có thể giao tiếp và phản ứng
 * với sự thay đổi chế độ hoạt động chung của ứng dụng.
 */
@Injectable({
  providedIn: 'root'
})
export class AppModeService {
  /**
   * @private
   * BehaviorSubject để lưu trữ và phát ra trạng thái hiện tại của ứng dụng.
   * Khởi tạo với trạng thái 'idle'.
   */
  private appModeSubject = new BehaviorSubject<AppMode>('idle');

  /**
   * Observable công khai để các component khác có thể theo dõi sự thay đổi trạng thái.
   */
  public appMode$: Observable<AppMode> = this.appModeSubject.asObservable();

  constructor() { }

  /**
   * Thiết lập chế độ hoạt động mới cho ứng dụng.
   * @param mode Chế độ mới cần thiết lập.
   */
  setMode(mode: AppMode): void {
    this.appModeSubject.next(mode);
  }

  /**
   * Lấy giá trị hiện tại của trạng thái ứng dụng.
   * @returns Trạng thái AppMode hiện tại.
   */
  getCurrentMode(): AppMode {
    return this.appModeSubject.value;
  }

    // Sử dụng BehaviorSubject để lưu trữ trạng thái hiện tại của mode
  // và phát ra giá trị khi có sự thay đổi.
  // 'idle' là giá trị khởi tạo.
  private _mode = new BehaviorSubject<AppMode>('idle');

  // Phương thức để các component khác có thể đăng ký nhận thay đổi mode
  getMode(): Observable<AppMode> {
    return this._mode.asObservable();
  }
}