import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Hiển thị danh sách nội dung (preset hoặc custom), có thể chọn hoặc xoá
 */
@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss']
})
export class ContentListComponent {
  /** Danh sách nội dung đầu vào */
  @Input() items: string[] = [];

  /** Cho phép chọn nhiều mục */
  @Input() multiSelect: boolean = false;

  /** Cho phép xoá mục (chỉ với custom) */
  @Input() removable: boolean = false;

  /** Danh sách đã chọn */
  selectedItems: Set<string> = new Set();

  /** Sự kiện khi chọn hoặc huỷ chọn 1 mục */
  @Output() select = new EventEmitter<string[]>();

  /** Sự kiện khi yêu cầu xoá mục */
  @Output() remove = new EventEmitter<string[]>();

  /** Toggle chọn một nội dung */
  toggle(item: string): void {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
    } else {
      if (!this.multiSelect) this.selectedItems.clear();
      this.selectedItems.add(item);
    }
    this.emitSelection();
  }

  /** Gửi danh sách đã chọn ra ngoài */
  emitSelection(): void {
    this.select.emit(Array.from(this.selectedItems));
  }

  /** Yêu cầu xoá những mục đã chọn */
  triggerRemove(): void {
    this.remove.emit(Array.from(this.selectedItems));
    this.selectedItems.clear();
  }

  /** Kiểm tra một item có đang được chọn không */
  isSelected(item: string): boolean {
    return this.selectedItems.has(item);
  }
}
