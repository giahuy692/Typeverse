// src/app/writing/writing.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  WRITING_PROMPTS,
  WritingPrompt,
} from 'src/assets/mock-data/writing-prompts';
import { Subscription, interval } from 'rxjs'; // Import interval và Subscription

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
})
export class WritingComponent implements OnInit, OnDestroy {
  writingPrompts: WritingPrompt[] = WRITING_PROMPTS;
  currentPromptIndex: number = 0;

  // Trạng thái cho Monkeytype-like
  promptCharacters: string[] = []; // Mảng các ký tự của prompt
  typedCharacters: string[] = []; // Mảng các ký tự người dùng đã gõ
  currentCharacterIndex: number = 0; // Index của ký tự hiện tại trong prompt mà người dùng đang gõ
  isTypingStarted: boolean = false; // Đánh dấu khi người dùng bắt đầu gõ
  timerSubscription: Subscription | null = null;
  startTime: number = 0;
  elapsedTime: number = 0; // Thời gian đã trôi qua (giây)

  writingWPM: number = 0;
  writingAccuracy: number = 100;
  rawWPM: number = 0; // WPM thô, không tính lỗi

  // Các biến cho kết quả cuối cùng
  totalTypedCharacters: number = 0;
  correctCharacters: number = 0;
  incorrectCharacters: number = 0;

  // Vẫn giữ lại showAnswer nếu bạn muốn hiển thị/ẩn câu trả lời (ở đây là prompt gốc)
  @Input() showAnswer: boolean = true;

  @ViewChild('typingInput') typingInput!: ElementRef<HTMLInputElement>; // Input ẩn để bắt sự kiện gõ phím
  @ViewChild('promptDisplay') promptDisplay!: ElementRef<HTMLDivElement>; // Element hiển thị prompt

  constructor(private cd: ChangeDetectorRef) {} // Inject ChangeDetectorRef

  ngOnInit(): void {
    this.loadPrompt();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  /**
   * Tải bài viết mẫu hiện tại và khởi tạo lại trạng thái gõ.
   */
  loadPrompt(): void {
    const prompt = this.currentPrompt;
    if (prompt) {
      this.promptCharacters = prompt.content.split('');
      this.typedCharacters = Array(this.promptCharacters.length).fill(''); // Khởi tạo mảng rỗng
      this.currentCharacterIndex = 0;
      this.isTypingStarted = false;
      this.writingWPM = 0;
      this.writingAccuracy = 100;
      this.rawWPM = 0;
      this.totalTypedCharacters = 0;
      this.correctCharacters = 0;
      this.incorrectCharacters = 0;
      this.elapsedTime = 0;
      this.stopTimer();

      // Đảm bảo textarea (input ẩn) được focus để người dùng có thể gõ ngay
      setTimeout(() => {
        this.typingInput.nativeElement.focus();
      }, 0);
    }
  }

  get currentPrompt(): WritingPrompt | null {
    return this.writingPrompts[this.currentPromptIndex] || null;
  }

  /**
   * Xử lý sự kiện nhấn phím từ input ẩn.
   * @param event Sự kiện bàn phím.
   */
  onKeyDown(event: KeyboardEvent): void {
    // Ngăn chặn hành vi mặc định của trình duyệt cho các phím Tab, Enter
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
    }

    // Bắt đầu timer khi người dùng gõ ký tự đầu tiên (không phải dấu cách)
    if (!this.isTypingStarted && event.key.length === 1 && event.key !== ' ') {
      this.startTimer();
      this.isTypingStarted = true;
    }

    if (event.key === 'Backspace') {
      this.handleBackspace();
    } else if (event.key.length === 1) {
      // Chỉ xử lý các ký tự có độ dài 1 (chữ, số, dấu câu)
      this.handleCharacterInput(event.key);
    }

    this.updateMetrics();
    this.cd.detectChanges(); // Buộc Angular cập nhật giao diện ngay lập tức
    this.scrollToCurrentCharacter(); // Cuộn đến ký tự hiện tại
  }

  /**
   * Xử lý khi nhấn phím Backspace.
   */
  private handleBackspace(): void {
    if (this.currentCharacterIndex > 0) {
      this.currentCharacterIndex--;
      // Nếu ký tự bị xóa là đúng, giảm correctCharacters
      if (
        this.typedCharacters[this.currentCharacterIndex] ===
        this.promptCharacters[this.currentCharacterIndex]
      ) {
        this.correctCharacters--;
      }
      this.typedCharacters[this.currentCharacterIndex] = ''; // Xóa ký tự đã gõ
      this.totalTypedCharacters--; // Giảm tổng số ký tự đã gõ
    }
  }

  /**
   * Xử lý khi người dùng gõ một ký tự.
   * @param char Ký tự người dùng đã gõ.
   */
  private handleCharacterInput(char: string): void {
    if (this.currentCharacterIndex < this.promptCharacters.length) {
      this.typedCharacters[this.currentCharacterIndex] = char;
      this.totalTypedCharacters++;

      if (char === this.promptCharacters[this.currentCharacterIndex]) {
        this.correctCharacters++;
      } else {
        this.incorrectCharacters++;
      }
      this.currentCharacterIndex++;
    }

    // Kiểm tra hoàn thành bài nếu đã gõ hết tất cả các ký tự của prompt
    if (this.currentCharacterIndex >= this.promptCharacters.length) {
      this.finishTest();
    }
  }

  /**
   * Tính toán và cập nhật WPM và Accuracy.
   */
  private updateMetrics(): void {
    if (this.elapsedTime > 0) {
      // WPM = (Số ký tự đúng / 5) / Thời gian (phút)
      // Một từ trung bình được ước tính là 5 ký tự
      const minutes = this.elapsedTime / 60;
      this.rawWPM = this.totalTypedCharacters / 5 / minutes; // WPM thô (tổng số ký tự gõ)
      this.writingWPM = this.correctCharacters / 5 / minutes; // WPM thực tế (chỉ tính ký tự đúng)

      // Accuracy = (Số ký tự đúng / Tổng số ký tự đã gõ) * 100
      this.writingAccuracy =
        this.totalTypedCharacters > 0
          ? (this.correctCharacters / this.totalTypedCharacters) * 100
          : 100;
    } else {
      this.writingWPM = 0;
      this.writingAccuracy = 100;
      this.rawWPM = 0;
    }
  }

  /**
   * Bắt đầu đồng hồ bấm giờ gõ.
   */
  private startTimer(): void {
    this.startTime = Date.now();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateMetrics();
    });
  }

  /**
   * Dừng đồng hồ bấm giờ gõ.
   */
  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Xử lý khi bài kiểm tra gõ hoàn thành.
   */
  private finishTest(): void {
    this.stopTimer();
    this.isTypingStarted = false;
    this.updateMetrics(); // Cập nhật lần cuối
    this.showBeepToast(
      `Bạn đã hoàn thành bài viết! WPM: ${this.writingWPM.toFixed(
        0
      )}, Accuracy: ${this.writingAccuracy.toFixed(2)}%`
    );
    // Tự động chuyển bài sau 3 giây
    setTimeout(() => this.nextPrompt(), 3000);
  }

  /** Đặt lại phiên gõ hiện tại */
  resetWriting(): void {
    this.loadPrompt(); // Tải lại prompt hiện tại
  }

  /** Chuyển đến bài viết mẫu trước đó */
  prevPrompt(): void {
    if (this.currentPromptIndex > 0) {
      this.currentPromptIndex--;
      this.loadPrompt();
    } else {
      this.showBeepToast('Đây là bài viết mẫu đầu tiên!');
    }
  }

  /** Chuyển đến bài viết mẫu tiếp theo */
  nextPrompt(): void {
    if (this.currentPromptIndex < this.writingPrompts.length - 1) {
      this.currentPromptIndex++;
      this.loadPrompt();
    } else {
      this.showBeepToast(
        'Bạn đã hoàn thành tất cả các bài viết mẫu! Quay lại bài đầu tiên.'
      );
      this.currentPromptIndex = 0;
      this.loadPrompt();
    }
  }

  /**
   * Cuộn vùng hiển thị prompt để giữ ký tự hiện tại luôn hiển thị.
   */
  private scrollToCurrentCharacter(): void {
    if (this.promptDisplay && this.typingInput) {
      const currentSpan = this.promptDisplay.nativeElement.querySelector(
        `.char-${this.currentCharacterIndex}`
      );
      if (currentSpan) {
        currentSpan.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }

  // Chức năng hiển thị Toast message
  toastMessage: string = '';
  showToast: boolean = false;

  showBeepToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cd.detectChanges();
    }, 2500);
  }
}
