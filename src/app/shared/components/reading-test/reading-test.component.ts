import { Component, OnInit } from '@angular/core';
import {
  ReadingChild,
  ReadingChildAnswer,
  ReadingQuestion,
} from '../../DTO/reading-test.dto';

import { DE_1_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_1_RAW_QUESTIONS_READING';
import { DE_2_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_2_RAW_QUESTIONS_READING';
import { DE_3_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_3_RAW_QUESTIONS_READING';
import { DE_4_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_4_RAW_QUESTIONS_READING';
import { DE_5_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_5_RAW_QUESTIONS_READING';
import { DE_6_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_6_RAW_QUESTIONS_READING';
import { DE_7_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_7_RAW_QUESTIONS_READING';
import { DE_8_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_8_RAW_QUESTIONS_READING';
import { DE_9_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_9_RAW_QUESTIONS_READING';
import { DE_10_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_10_RAW_QUESTIONS_READING';
import { DE_11_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_11_RAW_QUESTIONS_READING';
import { DE_12_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_12_RAW_QUESTIONS_READING';
import { DE_13_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_13_RAW_QUESTIONS_READING';
import { DE_14_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_14_RAW_QUESTIONS_READING';
import { DE_15_RAW_QUESTIONS_READING } from 'src/assets/mock-data/Reading/DE_15_RAW_QUESTIONS_READING';

/**
 * Enum cho trạng thái luồng bài test
 */
enum TestStateEnum {
  StartScreen = 'StartScreen',
  InstructionsScreen = 'InstructionsScreen',
  TestInProgress = 'TestInProgress',
  ResultsScreen = 'ResultsScreen',
}

@Component({
  selector: 'app-reading-test',
  templateUrl: './reading-test.component.html',
  styleUrls: ['./reading-test.component.scss'],
})
export class ReadingTestComponent implements OnInit {
  allExamFiles: {
    name: string;
    questions: ReadingQuestion[];
    questionCount: number;
    timeAllowedMinutes: number;
  }[] = [];
  selectedExamIndex = 0;
  questions: ReadingQuestion[] = [];
  currentQuestionIndex = 0;
  currentState = TestStateEnum.StartScreen;
  TestStateEnum = TestStateEnum;

  // Thống kê kết quả
  correctAnswersCount = 0;
  incorrectAnswersCount = 0;
  unansweredCount = 0;

  userMessage = '';
  messageType: 'success' | 'error' | 'warning' = 'success';

  ngOnInit(): void {
    this.loadAllExams();
  }

  examSources: any = {
    1: DE_1_RAW_QUESTIONS_READING,
    2: DE_2_RAW_QUESTIONS_READING,
    3: DE_3_RAW_QUESTIONS_READING,
    4: DE_4_RAW_QUESTIONS_READING,
    5: DE_5_RAW_QUESTIONS_READING,
    6: DE_6_RAW_QUESTIONS_READING,
    7: DE_7_RAW_QUESTIONS_READING,
    8: DE_8_RAW_QUESTIONS_READING,
    9: DE_9_RAW_QUESTIONS_READING,
    10: DE_10_RAW_QUESTIONS_READING,
    11: DE_11_RAW_QUESTIONS_READING,
    12: DE_12_RAW_QUESTIONS_READING,
    13: DE_13_RAW_QUESTIONS_READING,
    14: DE_14_RAW_QUESTIONS_READING,
    15: DE_15_RAW_QUESTIONS_READING,
  };

  /**
   * Nạp toàn bộ đề thi (giả định đã build sẵn export default trong từng file .ts)
   */
  loadAllExams() {
    const examCount = 15;
    this.allExamFiles = [];
    for (let i = 1; i <= examCount; i++) {
      this.allExamFiles.push({
        name: `Đề ${i}`,
        questions: this.examSources[i],
        questionCount: 5,
        timeAllowedMinutes: 36,
      });
    }
  }

  get currentExamQuestionCountOnStartScreen() {
    return this.allExamFiles[this.selectedExamIndex]?.questionCount || 0;
  }

  onExamSelectionChange(event: any) {
    this.selectedExamIndex = +event.target.value;
  }

  goToInstructions() {
    this.currentState = TestStateEnum.InstructionsScreen;
  }

  startTest() {
    // Deep clone để không ảnh hưởng file gốc khi chọn đáp án
    this.questions = JSON.parse(
      JSON.stringify(this.allExamFiles[this.selectedExamIndex].questions)
    );
    this.resetUserAnswers(this.questions);
    this.currentQuestionIndex = 0;
    this.currentState = TestStateEnum.TestInProgress;
  }

  get currentQuestion(): ReadingQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;

      // Nếu là câu Drag/Drop
      if (this.currentQuestion.type === 6) {
        this.initClickToAssignQuestion(this.currentQuestion);
      }
    }
  }
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      // Nếu là câu Drag/Drop
      if (this.currentQuestion.type === 6) {
        this.initClickToAssignQuestion(this.currentQuestion);
      }
    }
  }

  finishTest() {
    this.calculateResults();
    this.currentState = TestStateEnum.ResultsScreen;
  }

  goToStartScreen() {
    this.currentState = TestStateEnum.StartScreen;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.resetUserAnswers(this.questions);
  }

  /**
   * Xác định loại câu hỏi cho binding UI, dựa vào type
   */
  getQuestionType(
    q: ReadingQuestion
  ): 'gapfill' | 'reorder' | 'mcq' | 'heading' | 'other' {
    if (q.type == 5) return 'gapfill'; // Email fill-in
    if (q.type == 6) return 'reorder'; // Sentence Reordering
    if (q.type == 3) return 'mcq'; // Multiple Choice from Text
    if (q.type == 4) return 'heading'; // Heading Matching
    return 'other';
  }

  /**
   * Xử lý chọn đáp án cho các loại có childs (MCQ, Heading Matching)
   */
  chooseChildAnswer(q: ReadingQuestion, childIdx: number, answerIdx: number) {
    // Chọn 1 đáp án, loại radio
    const child = q.childs[childIdx];
    child.answer.forEach((opt: ReadingChildAnswer, i: number) => {
      opt.choose = i === answerIdx;
    });
  }

  /**
   * Xử lý chọn heading cho từng đoạn (Heading Matching)
   */
  chooseHeading(q: ReadingQuestion, childIdx: number, headingIdx: number) {
    const child = q.childs[childIdx];
    child.answer.forEach((opt: ReadingChildAnswer, i: number) => {
      opt.choose = i === headingIdx;
    });
  }

  /**
   * Chọn thứ tự cho reorder (Sentence Reordering)
   * @param q
   * @param userSortArr
   */
  setUserOrder(q: ReadingQuestion, userSortArr: string[]) {
    if (Array.isArray(q.answer)) {
      q.answer.forEach((item: any, idx: number) => {
        item.user_sort = userSortArr[idx];
      });
    }
  }

  /**
   * Chấm điểm - xử lý TRỰC TIẾP trên data gốc
   */
  calculateResults() {
    let correct = 0,
      incorrect = 0,
      unanswered = 0;
    for (const q of this.questions) {
      if (q.childs && q.childs.length > 0) {
        // MCQ, Heading Matching
        let hasAnswered = false;
        let allCorrect = true;
        for (const child of q.childs) {
          let childAnswered = false,
            childCorrect = false;
          for (const opt of child.answer) {
            if (opt.choose) {
              childAnswered = true;
              if (opt.correct === 1) childCorrect = true;
            }
          }
          if (childAnswered) hasAnswered = true;
          if (!childCorrect) allCorrect = false;
        }
        if (!hasAnswered) unanswered++;
        else if (allCorrect) correct++;
        else incorrect++;
      } else {
        // Sentence Reordering
        if (Array.isArray(q.answer) && q.answer.length > 0) {
          let allAnswered = q.answer.every(
            (a: any) => a.user_sort && a.user_sort.trim() !== ''
          );
          let allCorrect = q.answer.every(
            (a: any) => a.answer_sort === a.user_sort
          );
          if (!allAnswered) unanswered++;
          else if (allCorrect) correct++;
          else incorrect++;
        }
      }
    }
    this.correctAnswersCount = correct;
    this.incorrectAnswersCount = incorrect;
    this.unansweredCount = unanswered;
  }

  getTotalScorableQuestions() {
    return this.questions.length;
  }

  showUserMessage(
    msg: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.userMessage = msg;
    this.messageType = type;
    setTimeout(() => this.clearUserMessage(), 2000);
  }
  clearUserMessage() {
    this.userMessage = '';
  }

  // Kiểm tra child đã trả lời?
  isChildAnswered(child: ReadingChild): boolean {
    return (
      Array.isArray(child.answer) &&
      child.answer.some((opt: ReadingChildAnswer) => opt.choose)
    );
  }

  // Kiểm tra child đúng?
  isChildCorrect(child: ReadingChild): boolean {
    return (
      Array.isArray(child.answer) &&
      child.answer.some(
        (opt: ReadingChildAnswer) => opt.choose && opt.correct === 1
      )
    );
  }

  // Kiểm tra child sai?
  isChildWrong(child: ReadingChild): boolean {
    return this.isChildAnswered(child) && !this.isChildCorrect(child);
  }

  // Với dạng reorder:
  isReorderAnswered(q: ReadingQuestion): boolean {
    return (
      Array.isArray(q.answer) &&
      q.answer.every((ans: any) => ans.user_sort && ans.user_sort.trim() !== '')
    );
  }
  isReorderCorrect(q: ReadingQuestion): boolean {
    return (
      this.isReorderAnswered(q) &&
      q.answer.every((ans: any) => ans.user_sort === ans.answer_sort)
    );
  }
  isReorderWrong(q: ReadingQuestion): boolean {
    return this.isReorderAnswered(q) && !this.isReorderCorrect(q);
  }

  onChooseGapfill(child: ReadingChild, value: string) {
    child.answer.forEach(
      (opt: ReadingChildAnswer) => (opt.choose = opt.answer === value)
    );
  }

  onChooseMCQ(child: ReadingChild, value: string) {
    child.answer.forEach(
      (opt: ReadingChildAnswer) => (opt.choose = opt.answer === value)
    );
  }

  onChooseHeading(child: ReadingChild, value: string) {
    child.answer.forEach(
      (opt: ReadingChildAnswer) => (opt.choose = opt.answer === value)
    );
  }

  getSelectedAnswer(child: ReadingChild): string {
    const selected = child.answer.find((a: ReadingChildAnswer) => a.choose);
    return selected ? selected.answer : '';
  }

  onChooseAnswer(child: ReadingChild, value: string) {
    child.answer.forEach(
      (opt: ReadingChildAnswer) => (opt.choose = opt.answer === value)
    );
  }
  resetUserAnswers(questions: ReadingQuestion[]) {
    questions.forEach((q) => {
      // Nếu là dạng có childs (MCQ, Gapfill, Heading matching, ...)
      if (q.childs && q.childs.length) {
        q.childs.forEach((child) => {
          if (child.answer && child.answer.length) {
            child.answer.forEach((ans) => {
              ans.choose = false;
            });
          }
        });
      }
      // Nếu là dạng answer thứ tự (sentence reordering)
      if (q.answer && Array.isArray(q.answer)) {
        q.answer.forEach((a) => {
          if ('user_sort' in a) {
            a.user_sort = '';
          }
        });
      }
    });
  }

  // Cho mỗi câu type 6, nên có hai biến state cho drag/drop:
  orderedSlots: ReadingChildAnswer[] = [];
  availableChoices: ReadingChildAnswer[] = [];
  EMPTY_SLOT: ReadingChildAnswer = { answer: '', correct: 0, choose: false };

  initClickToAssignQuestion(currentQuestion: any) {
    const slotCount = currentQuestion.answer.length;
    if (
      !(currentQuestion.orderedSlots && currentQuestion.orderedSlots.length > 0)
    ) {
      this.orderedSlots = Array(slotCount).fill(this.EMPTY_SLOT);
    }
    this.availableChoices = currentQuestion.answer.map((item: any) => ({
      ...item,
    }));
  }

  /**
   * Khi bấm vào 1 choice ở bên phải, tự động điền vào slot trống đầu tiên bên trái.
   */
  chooseChoice(choice: ReadingChildAnswer) {
    const firstEmptyIndex = this.orderedSlots.findIndex(
      (slot) => slot.answer === ''
    );
    if (firstEmptyIndex !== -1) {
      this.orderedSlots[firstEmptyIndex] = choice;
      this.availableChoices = this.availableChoices.filter(
        (item) => item !== choice
      );
      this.currentQuestion.userOrder = this.orderedSlots;
    }
  }

  /**
   * Khi bấm vào slot đã chọn bên trái, trả lại choice về bên phải.
   */
  removeSlot(i: number) {
    const slot = this.orderedSlots[i];
    if (slot && slot.answer !== '') {
      this.availableChoices.push(slot);
      this.orderedSlots[i] = this.EMPTY_SLOT; // Reset slot về object trống, không dùng null!
      this.currentQuestion.userOrder = this.orderedSlots;
    }
  }

  isUnanswered(q: any): boolean {
    if (q.type === 6) {
      return !q.userOrder || !q.userOrder.length;
    }
    return !q.userAnswer;
  }

  get totalQuestions(): number {
    return this.questions?.length || 0;
  }

  getUserOrder(q: any): string[] {
    // Trả về thứ tự user đã xếp cho type 6
    if (q.type === 6) {
      // Giả sử bạn đã lưu mảng user chọn vào q.orderedSlots
      return (q.orderedSlots || []).map((slot: any) => slot?.title || '');
    }
    return [];
  }

  getCorrectOrder(q: any): string[] {
    if (q.type === 6) {
      return (q.answer || []).map((ans: any) => ans.title);
    }
    return [];
  }

  getUserAnswer(q: any): string {
    // Lấy đáp án user chọn cho các loại khác
    if (q.type !== 6) {
      // Lưu user answer lúc submit vào q.userAnswer, nếu chưa có thì trả về ''
      return q.userAnswer || '';
    }
    return '';
  }

  getCorrectAnswer(q: ReadingChild): ReadingChildAnswer {
    if (q.type !== 6) {
      // Lấy đáp án đúng từ q.answer theo mock của bạn
      if (Array.isArray(q.answer)) {
        const correct = q.answer.find((a: any) => a.correct === 1);
        return correct ? correct : { answer: '', correct: 0, choose: false };
      }

      return { answer: '', correct: 0, choose: false };
    }
    return { answer: '', correct: 0, choose: false };
  }

  // Hàm tính tổng số câu nhỏ và số câu nhỏ trả lời đúng
  getCorrectSmallQuestionsCount(): number {
    let correctCount = 0;
    for (const q of this.questions) {
      // Các loại có mảng childs (chọn đáp án, điền từ, v.v.)
      if (q.childs && q.childs.length > 0) {
        for (const child of q.childs) {
          // Đếm đúng nếu có 1 answer được chọn và correct=1
          if (child.answer?.some((a) => a.choose && a.correct === 1)) {
            correctCount++;
          }
        }
      }
      // Drag & Drop, Sort, Matching v.v.
      else if (q.type === 6 && Array.isArray(q.userOrder)) {
        for (let i = 0; i < q.answer.length; i++) {
          if (q.userOrder[i]?.title === q.answer[i]?.title) {
            correctCount++;
          }
        }
      }
      // Các loại khác tự bổ sung thêm if cần
    }
    return correctCount;
  }

  getTotalSmallQuestionsCount(): number {
    let total = 0;
    for (const q of this.questions) {
      if (q.childs && q.childs.length > 0) total += q.childs.length;
      else if (q.type === 6 && Array.isArray(q.answer))
        total += q.answer.length;
      // ... nếu còn loại khác
    }
    return total;
  }

  getAptisScore(correctSmallAnswers: number) {
    // Quy đổi điểm và cấp bậc theo bảng
    if (correctSmallAnswers >= 23)
      return { score: 46 + (correctSmallAnswers - 23) * 2, level: 'C' };
    if (correctSmallAnswers >= 19)
      return { score: 38 + (correctSmallAnswers - 19) * 2, level: 'B2' };
    if (correctSmallAnswers >= 13)
      return { score: 26 + (correctSmallAnswers - 13) * 2, level: 'B1' };
    return { score: 0, level: 'Below B1' };
  }
}
