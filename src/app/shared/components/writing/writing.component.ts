// src/app/writing/writing.component.ts
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { WRITING_PROMPTS, WritingPrompt } from 'src/assets/mock-data/writing-prompts';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
})
export class WritingComponent implements OnInit, OnDestroy {
  writingPrompts: WritingPrompt[] = WRITING_PROMPTS;
  currentPromptIndex: number = 0;

  promptCharacters: string[] = [];
  typedCharacters: string[] = [];
  currentCharacterIndex: number = 0;
  isTypingStarted: boolean = false;
  timerSubscription: Subscription | null = null;
  startTime: number = 0;
  elapsedTime: number = 0;

  writingWPM: number = 0;
  writingAccuracy: number = 100;
  rawWPM: number = 0;

  totalTypedCharacters: number = 0;
  correctCharacters: number = 0;
  incorrectCharacters: number = 0;

  @Input() showAnswer: boolean = true;

  @ViewChild('typingInput') typingInput!: ElementRef<HTMLInputElement>;
  @ViewChild('promptDisplay') promptDisplay!: ElementRef<HTMLDivElement>;

  currentWordStartIndex: number = 0;
  currentWordEndIndex: number = 0;

  constructor(private cd: ChangeDetectorRef) {}

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
      this.typedCharacters = Array(this.promptCharacters.length).fill('');
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

      this.updateCurrentWordRange(); // Cập nhật phạm vi từ ngay khi tải prompt

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
    // Ngăn chặn hành vi mặc định của trình duyệt cho các phím Tab, Enter, Space (nếu ở đầu)
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
    }
    // Ngăn chặn space ở đầu bài hoặc khi đang ở vị trí space nhưng gõ sai
    if (event.key === ' ' && this.currentCharacterIndex === 0 && this.promptCharacters[0] !== ' ') {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' && this.currentCharacterIndex < this.promptCharacters.length && this.promptCharacters[this.currentCharacterIndex] !== ' ') {
      // Nếu đang ở ký tự không phải space mà lại gõ space, coi là lỗi và di chuyển
      this.handleCharacterInput(event.key);
      event.preventDefault(); // Ngăn space mặc định
      return;
    }


    if (!this.isTypingStarted && event.key.length === 1 && event.key !== ' ') {
      this.startTimer();
      this.isTypingStarted = true;
    }

    if (event.key === 'Backspace') {
      this.handleBackspace();
    } else if (event.key.length === 1) {
      this.handleCharacterInput(event.key);
    }

    this.updateMetrics();
    this.updateCurrentWordRange(); // Cập nhật lại từ hiện tại sau mỗi lần gõ
    this.cd.detectChanges();
    this.scrollToCurrentCharacter();
  }

  /**
   * Xử lý khi nhấn phím Backspace.
   */
  private handleBackspace(): void {
    if (this.currentCharacterIndex > 0) {
      this.currentCharacterIndex--;
      if (this.typedCharacters[this.currentCharacterIndex] === this.promptCharacters[this.currentCharacterIndex]) {
        this.correctCharacters--;
      }
      this.typedCharacters[this.currentCharacterIndex] = '';
      this.totalTypedCharacters--;
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

    if (this.currentCharacterIndex >= this.promptCharacters.length) {
      this.finishTest();
    }
  }

  /**
   * Cập nhật phạm vi của từ hiện tại đang gõ.
   */
  private updateCurrentWordRange(): void {
    let start = this.currentCharacterIndex;
    let end = this.currentCharacterIndex;

    // Tìm điểm bắt đầu của từ hiện tại (bỏ qua khoảng trắng/xuống dòng phía trước)
    while (start > 0 && this.promptCharacters[start - 1] !== ' ' && this.promptCharacters[start - 1] !== '\n') {
      start--;
    }
    // Bỏ qua khoảng trắng/xuống dòng ở đầu từ
    while (start < this.promptCharacters.length && (this.promptCharacters[start] === ' ' || this.promptCharacters[start] === '\n')) {
      start++;
    }

    // Tìm điểm kết thúc của từ hiện tại (đến khoảng trắng hoặc xuống dòng tiếp theo)
    end = start;
    while (end < this.promptCharacters.length && this.promptCharacters[end] !== ' ' && this.promptCharacters[end] !== '\n') {
      end++;
    }

    this.currentWordStartIndex = start;
    this.currentWordEndIndex = end;
  }

  /**
   * Tính toán và cập nhật WPM và Accuracy.
   */
  private updateMetrics(): void {
    if (this.elapsedTime > 0) {
      const minutes = this.elapsedTime / 60;
      this.rawWPM = this.totalTypedCharacters / 5 / minutes;
      this.writingWPM = this.correctCharacters / 5 / minutes;

      this.writingAccuracy = this.totalTypedCharacters > 0
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
    this.updateMetrics();
    this.showBeepToast(`Bạn đã hoàn thành bài viết! WPM: ${this.writingWPM.toFixed(0)}, Accuracy: ${this.writingAccuracy.toFixed(2)}%`);
    setTimeout(() => this.nextPrompt(), 3000);
  }

  /** Đặt lại phiên gõ hiện tại */
  resetWriting(): void {
    this.loadPrompt();
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
      this.showBeepToast('Bạn đã hoàn thành tất cả các bài viết mẫu! Quay lại bài đầu tiên.');
      this.currentPromptIndex = 0;
      this.loadPrompt();
    }
  }

  /**
   * Cuộn vùng hiển thị prompt để giữ ký tự hiện tại luôn hiển thị.
   */
  private scrollToCurrentCharacter(): void {
    if (this.promptDisplay && this.typingInput) {
      const currentSpan = this.promptDisplay.nativeElement.querySelector(`.char-${this.currentCharacterIndex}`);
      if (currentSpan) {
        // Lấy vị trí tương đối của span so với promptDisplay
        const spanRect = currentSpan.getBoundingClientRect();
        const promptRect = this.promptDisplay.nativeElement.getBoundingClientRect();

        // Kiểm tra nếu span nằm ngoài tầm nhìn trên hoặc dưới
        if (spanRect.top < promptRect.top || spanRect.bottom > promptRect.bottom) {
          currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
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
