import { Component, ViewChild } from '@angular/core';
import { TypingBoxComponent } from '../../components/typing-box/typing-box.component';

@Component({
  selector: 'app-typing-page',
  templateUrl: './typing-page.component.html',
  styleUrls: ['./typing-page.component.scss']
})
export class TypingPageComponent {
  /** Trạng thái drawer cài đặt mở hay đóng */
  settingsOpen = false;

  /** Trạng thái drawer chọn nội dung mở hay đóng */
  contentDrawerOpen = false;

  /** Danh sách nội dung hệ thống */
  presetContents = [
    'Angular is a platform for building web applications.',
    'Practice makes perfect.',
    'Welcome to Typeverse!'
  ];

  /** Danh sách nội dung người dùng thêm */
  userCustomContents: string[] = [];

  /** Danh sách nội dung đã chọn để luyện gõ */
  selectedTextList: string[] = [];

  /** Chỉ mục nội dung hiện tại đang hiển thị */
  currentIndex = 0;

  /** Gọi tới TypingBox để cập nhật nội dung và trigger focus */
  @ViewChild(TypingBoxComponent) typingBoxRef?: TypingBoxComponent;

  /** Sự kiện mở drawer cài đặt */
  openSettings(): void {
    this.settingsOpen = true;
  }

  /** Sự kiện mở drawer chọn nội dung */
  openContentDrawer(): void {
    this.contentDrawerOpen = true;
  }

  /** Nhận danh sách nội dung từ ContentDrawerComponent */
  handleSelectContent(texts: string[]): void {
    this.selectedTextList = texts;
    this.currentIndex = 0;
    this.contentDrawerOpen = false;
    setTimeout(() => {
      this.typingBoxRef?.focusTypingArea();
    }, 0);
  }
}
