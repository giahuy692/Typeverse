import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  OnChanges,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-typing-box',
  templateUrl: './typing-box.component.html',
  styleUrls: ['./typing-box.component.scss'],
})

/**
 * Component chính hiển thị khung luyện gõ văn bản
 */
export class TypingBoxComponent implements OnChanges {
  /** Danh sách nội dung được chọn từ content drawer */
  @Input() textList: string[] = [];

  /** Chỉ số bài đang luyện gõ trong danh sách */
  @Input() currentIndex: number = 0;

    /** Emit yêu cầu chuyển bài trước */
  @Output() previous = new EventEmitter<void>();

  /** Emit yêu cầu chuyển bài tiếp theo */
  @Output() next = new EventEmitter<void>();

  /** Chế độ gõ: 'timed' hoặc 'free' */
  @Input() typingMode: 'timed' | 'free' = 'timed';

  /** Thời gian luyện gõ (chỉ dùng nếu là 'timed') */
  @Input() duration: number = 30;

  /** Vùng DOM nhận focus thủ công từ component cha */
  @ViewChild('typingContainer') typingContainerRef!: ElementRef<HTMLDivElement>;

  /** Getter nội dung hiện tại dựa trên chỉ số */
  get textToType(): string {
    return this.textList[this.currentIndex] || '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration'] && !this.sessionEnded) {
      this.countdownValue = this.duration;
    }

    if (changes['textList'] || changes['currentIndex']) {
      this.retry(); // reset mỗi khi chuyển bài
    }
  }

  /** Văn bản người dùng đã gõ */
  userInput = '';

  /** Thời điểm bắt đầu gõ */
  startTime: number | null = null;

  /** Số từ gõ mỗi phút */
  wpm: number | null = null;

  /** Thời gian đã gõ */
  elapsedTimeInSeconds = 0;

  /** Thời gian đếm ngược còn lại */
  countdownValue = 30;

  /** ID timer setInterval */
  timerId: any;

  /** Gõ xong hay chưa */
  sessionEnded = false;

  /** Ký tự đúng */
  correctCount = 0;

  /** Ký tự sai */
  incorrectCount = 0;

  /** Phần trăm chính xác */
  accuracy = 0;

  /** Cho phép component cha focus vào box */
  focusTypingArea(): void {
    this.typingContainerRef?.nativeElement?.focus();
  }

  /** Gửi sự kiện muốn chuyển bài trước */
  previousText(): void {
    this.previous.emit();
  }

  /** Gửi sự kiện muốn chuyển bài tiếp theo */
  nextText(): void {
    this.next.emit();
  }

  /** Gõ bằng input field truyền thống */
  handleInput(event: Event): void {
    if (this.sessionEnded) return;
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (!this.startTime && value.length > 0) {
      this.startTime = performance.now();
      if (this.typingMode === 'timed') this.startTimer();
    }

    this.userInput = value;
    this.calculateWPM();
  }

  /** Gõ trực tiếp bằng bàn phím vào khu vực box */
  handleKeyPress(event: KeyboardEvent): void {
    if (this.sessionEnded) return;

    const key = event.key;
    if (key.length > 1 && key !== 'Backspace') return;

    if (!this.startTime && this.userInput.length === 0) {
      this.startTime = performance.now();
      if (this.typingMode === 'timed') this.startTimer();
    }

    if (key === 'Backspace') {
      this.userInput = this.userInput.slice(0, -1);
    } else {
      this.userInput += key;
      this.playKeySound();
    }

    this.correctCount = this.userInput
      .split('')
      .filter((char, i) => char === this.textToType[i]).length;

    if (this.userInput.length >= this.textToType.length) {
      this.elapsedTimeInSeconds =
        this.typingMode === 'free'
          ? Math.floor((performance.now() - (this.startTime ?? 0)) / 1000)
          : this.duration;

      this.sessionEnded = true;
      clearInterval(this.timerId);
      this.calculateFinalStats();
    }
  }

  /** Đếm ngược thời gian nếu chế độ là timed */
  startTimer(): void {
    this.countdownValue = this.duration;
    this.timerId = setInterval(() => {
      this.countdownValue--;

      if (this.countdownValue <= 0) {
        clearInterval(this.timerId);
        this.elapsedTimeInSeconds = this.duration;
        this.sessionEnded = true;
        this.calculateFinalStats();
      }
    }, 1000);
  }

  /** Reset session hiện tại để luyện lại nội dung đang chọn */
  retry(): void {
    this.userInput = '';
    this.startTime = null;
    this.wpm = null;
    this.sessionEnded = false;
    this.countdownValue = this.duration;
    clearInterval(this.timerId);
  }

  /** Gán văn bản mới → reset lại */
  setText(newText: string): void {
    this.retry(); // dùng retry vì textToType là getter
  }

  /** Tính toán WPM */
  calculateWPM(): void {
    if (!this.startTime) return;
    const elapsedMinutes = (performance.now() - this.startTime) / 60000;
    const wordsTyped = this.userInput.trim().split(/\s+/).length;
    this.wpm = Math.floor(wordsTyped / elapsedMinutes);
  }

  /** Kết quả sau khi hết giờ hoặc gõ xong */
  calculateFinalStats(): void {
    const totalTyped = this.userInput.length;
    this.correctCount = this.userInput
      .split('')
      .filter((char, i) => char === this.textToType[i]).length;

    this.incorrectCount = totalTyped - this.correctCount;
    this.accuracy = Math.floor((this.correctCount / totalTyped) * 100);
  }

  /** Phát âm thanh khi gõ phím */
  playKeySound(): void {
    const audio = new Audio('assets/sound/key.wav');
    audio.volume = 0.15;
    audio.play();
  }

  /** Trả về từng từ để highlight */
  getWords(): string[] {
    return this.textToType.split(' ');
  }

  /** Tính index bắt đầu của từng từ */
  get wordOffsets(): number[] {
    const words = this.getWords();
    const offsets: number[] = [];
    let index = 0;

    for (const word of words) {
      offsets.push(index);
      index += word.length + 1;
    }

    return offsets;
  }
}
