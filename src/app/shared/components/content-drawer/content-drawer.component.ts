import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Drawer hiển thị danh sách nội dung luyện gõ: preset và custom.
 * Cho phép chọn nhiều nội dung, thêm hoặc xoá nội dung custom.
 */
@Component({
  selector: 'app-content-drawer',
  templateUrl: './content-drawer.component.html',
  styleUrls: ['./content-drawer.component.scss']
})
export class ContentDrawerComponent {
  /** Drawer đang hiển thị hay không */
  @Input() isOpen = false;

  /** Danh sách hệ thống */
  @Input() presetContents: string[] = [];

  /** Danh sách người dùng tự thêm */
  @Input() userContents: string[] = [];

  /** Sự kiện đóng drawer */
  @Output() close = new EventEmitter<void>();

  /**
   * Sự kiện chọn xong nội dung:
   * Emit mảng các nội dung đã chọn từ tab hiện tại để truyền cho TypingPageComponent.
   * Sau đó, TypingPageComponent sẽ truyền đúng mảng này xuống TypingBoxComponent
   * để hỗ trợ chuyển nội dung nhiều bài bằng nút ← →
   * @example ['Text 1', 'Text 2']
   */
  @Output() selectContent: EventEmitter<string[]> = new EventEmitter<string[]>();

  /** Tab hiện tại: preset hoặc custom */
  tab: 'preset' | 'custom' = 'preset';

  /** Danh sách nội dung đang được chọn */
  selected: string[] = [];

  /** Đổi tab hiện tại */
  switchTab(tab: 'preset' | 'custom'): void {
    this.tab = tab;
    this.selected = []; // reset khi đổi tab
  }

  /** Đóng drawer */
  closeDrawer(): void {
    this.close.emit();
  }

  /** Xác nhận danh sách nội dung để luyện gõ */
  confirmSelection(): void {
    this.selectContent.emit([...this.selected]);
    this.closeDrawer();
  }

  /** Xoá các nội dung custom đã chọn */
  removeSelected(toRemove: string[]): void {
    this.userContents = this.userContents.filter(item => !toRemove.includes(item));
    this.selected = [];
  }

  /** Mở prompt để nhập nội dung mới */
  promptNewCustom(): void {
    const text = prompt('Nhập nội dung mới:');
    const trimmed = text?.trim();
    // ✅ Kiểm tra trùng lặp trước khi thêm
    if (trimmed && !this.userContents.includes(trimmed)) {
      this.userContents.push(trimmed);
    }
  }

  /** Nhận dữ liệu từ content-list khi có thay đổi chọn */
  handleSelect(selectedItems: string[]): void {
    this.selected = selectedItems;
  }

  /** Xử lý xoá nội dung từ content-list */
  handleRemove(items: string[]): void {
    this.removeSelected(items);
  }
}
