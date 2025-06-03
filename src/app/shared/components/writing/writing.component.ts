import { Component, Input } from '@angular/core';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
})
export class WritingComponent {
  @Input() currentQuestion: DTOListQuestion | null = null;
  @Input() currentIndex: number = 0;
  @Input() totalQuestions: number = 0;
  @Input() showAnswer: boolean = true; // Có thể giữ lại hoặc chuyển ra ngoài nếu không cần

  writingWPM: number = 0;
  writingAccuracy: number = 100;
  userTyping: string = '';

  constructor() {}

  ngOnInit(): void {}

  /** Triggered on input typing change */
  onTypingChange(): void {
    const target = this.currentQuestion?.answer || '';
    const typed = this.userTyping;

    // Accuracy calculation
    let correct = 0;
    const minLen = Math.min(target.length, typed.length);
    for (let i = 0; i < minLen; i++) {
      if (typed[i] === target[i]) correct++;
    }
    this.writingAccuracy = Math.round((correct / target.length) * 100);

    // WPM (mocked or advanced logic later)
    this.writingWPM = Math.round(typed.trim().split(/\s+/).length / 0.5); // fake 30s session
  }

  /** Reset current writing session */
  resetWriting(): void {
    this.userTyping = '';
    this.writingAccuracy = 100;
    this.writingWPM = 0;
  }

  // Các hàm navigation (prev/next) sẽ được emit ra component cha (AudioPlayerComponent)
  // hoặc bạn có thể inject service để xử lý. Ở đây giả định emit.
  prev(): void {
    // Cần emit sự kiện lên component cha để điều hướng câu hỏi
    // Ví dụ: this.prevQuestion.emit();
    console.log('Previous question requested');
  }

  next(): void {
    // Cần emit sự kiện lên component cha để điều hướng câu hỏi
    // Ví dụ: this.nextQuestion.emit();
    console.log('Next question requested');
  }
}
