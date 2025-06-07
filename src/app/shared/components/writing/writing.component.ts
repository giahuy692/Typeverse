import { Component, OnInit } from '@angular/core';
import { WRITING_PROMPTS, WritingPrompt } from 'src/assets/mock-data/writing-prompts';
// Import mảng template. Đổi đường dẫn cho đúng project bạn!

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
})
export class WritingComponent implements OnInit {
  templates: WritingPrompt[] = WRITING_PROMPTS;
  selectedTemplateIdx = 0;
  showTemplate = false;
  userInput = '';
  compareHtml = '';
  correctChars = 0;
  totalChars = 0;
  accuracy = 100;
  wpm = 0;
  finished = false;
  startTime = 0;

  ngOnInit(): void {
    this.resetAll();
  }

  /**
   * Reset dữ liệu khi chọn template mới
   */
  onTemplateChange() {
    this.resetAll();
  }

  /**
   * Đảo ngẫu nhiên template
   */
  randomTemplate() {
    const idx = Math.floor(Math.random() * this.templates.length);
    this.selectedTemplateIdx = idx;
    this.resetAll();
  }

  /**
   * Hiện/ẩn mẫu template
   */
  toggleShow() {
    this.showTemplate = !this.showTemplate;
  }

  /**
   * Copy template vào clipboard
   */
  copyTemplate() {
    navigator.clipboard.writeText(this.templates[this.selectedTemplateIdx]?.content || '');
  }

  /**
   * Reset mọi trạng thái về ban đầu
   */
  startOver() {
    this.resetAll();
  }

  /**
   * Đổi sang template tiếp theo (nếu có)
   */
  nextTemplate() {
    if (this.selectedTemplateIdx < this.templates.length - 1) {
      this.selectedTemplateIdx++;
      this.resetAll();
    } else {
      this.selectedTemplateIdx = 0;
      this.resetAll();
    }
  }

  /**
   * Khi bắt đầu hoặc đổi template, reset toàn bộ state
   */
  resetAll() {
    this.userInput = '';
    this.compareHtml = '';
    this.finished = false;
    this.correctChars = 0;
    this.totalChars = this.templates[this.selectedTemplateIdx]?.content.length || 0;
    this.accuracy = 100;
    this.wpm = 0;
    this.startTime = Date.now();
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) (textarea as HTMLTextAreaElement).focus();
    }, 100);
    this.compareInput();
  }

  /**
   * So sánh real-time từng ký tự giữa userInput và template mẫu
   * Kết quả sẽ highlight từng ký tự đúng/sai/chưa gõ
   */
  compareInput() {
    const ref = this.templates[this.selectedTemplateIdx]?.content || '';
    const user = this.userInput || '';
    let html = '';
    let correct = 0;

    for (let i = 0; i < ref.length; i++) {
      if (user[i] == null) {
        // Chưa gõ tới ký tự này
        html += `<span class="text-gray-500">${this.escape(ref[i])}</span>`;
      } else if (user[i] === ref[i]) {
        html += `<span class="text-green-400">${this.escape(ref[i])}</span>`;
        correct++;
      } else {
        html += `<span class="text-red-400 underline">${this.escape(ref[i])}</span>`;
      }
    }

    // Nếu user gõ thừa thì tô đỏ thừa
    if (user.length > ref.length) {
      html += `<span class="text-red-400 underline">${this.escape(user.slice(ref.length))}</span>`;
    }

    this.compareHtml = html;
    this.correctChars = correct;
    this.totalChars = ref.length;
    this.accuracy = Math.round((correct / ref.length) * 100);
    if (this.finished) this.updateWPM();
  }

  /**
   * Hoàn thành bài gõ, tính lại các thống kê
   */
  finish() {
    this.finished = true;
    this.compareInput();
    this.updateWPM();
  }

  /**
   * Tính WPM (Words Per Minute)
   */
  updateWPM() {
    const durationMinutes = (Date.now() - this.startTime) / 60000;
    const words = this.userInput.trim().split(/\s+/).length;
    this.wpm = durationMinutes > 0 ? Math.round(words / durationMinutes) : 0;
  }

  /**
   * Escape ký tự HTML đặc biệt để hiển thị đúng
   */
  escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
