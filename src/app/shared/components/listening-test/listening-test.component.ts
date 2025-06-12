// listening.component.ts
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { DE_10_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_10_RAW_QUESTIONS_LISTENING';
import { DE_11_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_11_RAW_QUESTIONS_LISTENING';
import { DE_12_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_12_RAW_QUESTIONS_LISTENING';
import { DE_13_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_13_RAW_QUESTIONS_LISTENING';
import { DE_14_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_14_RAW_QUESTIONS_LISTENING';
import { DE_15_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_15_RAW_QUESTIONS_LISTENING';
import { DE_1_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_1_RAW_QUESTIONS_LISTENING';
import { DE_2_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_2_RAW_QUESTIONS_LISTENING';
import { DE_3_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_3_RAW_QUESTIONS_LISTENING';
import { DE_4_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_4_RAW_QUESTIONS_LISTENING';
import { DE_5_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_5_RAW_QUESTIONS_LISTENING';
import { DE_6_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_6_RAW_QUESTIONS_LISTENING';
import { DE_7_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_7_RAW_QUESTIONS_LISTENING';
import { DE_8_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_8_RAW_QUESTIONS_LISTENING';
import { DE_9_RAW_QUESTIONS_LISTENING } from 'src/assets/mock-data/Listening/DE_9_RAW_QUESTIONS_LISTENING';

// ENUMS
export enum TestState {
  StartScreen,
  InstructionsScreen,
  TestInProgress,
  ResultsScreen, // New state for displaying results
}

// INTERFACES FOR QUESTION DATA FROM JSON
class DTOAnswer {
  answer: string = '';
  correct: number = 0;
  choose: boolean = false;
}

class DTOQuestion {
  id: number = 0;
  title: string = '';
  audio_url: string | null = '';
  answer: DTOAnswer[] | null = []; // Null for parent questions of type 2, 3, 5
  type: number = 1;
  sort_by?: number;
  childs?: DTOQuestion[] | null;
  content?: string;
  explain?: string | null = '';
  skill_id?: number;
  playCount: number = 0;
  tip?: string;
  isAnswered?: boolean = false;
  my_answer?: DTOAnswer;
}

class ExamFileEntry {
  name: string = '';
  listQuestion: DTOQuestion[] = [];
}

// --- END MOCK DATA ---

@Component({
  selector: 'app-listening-test',
  templateUrl: './listening-test.component.html',
  styleUrls: ['./listening-test.component.scss'],
})
export class ListeningTestComponent implements OnInit, OnDestroy {
  TestStateEnum = TestState;
  currentState: TestState = TestState.StartScreen;

  allExamFiles: ExamFileEntry[] = [];
  selectedExamIndex: number = 0;
  currentQuestionIndex: number = 0;

  listQuestion: DTOQuestion[] = [];
  currentQuestion: DTOQuestion = new DTOQuestion();
  currentExam: ExamFileEntry = new ExamFileEntry();

  totalTimeInSeconds: number = 40 * 60;
  timeRemaining: string = '40:00';
  private timerInterval: any;

  audioPlayer = new Audio();
  isPlayingAudio: boolean = false;
  readonly maxAudioPlays: number = 2;
  // readonly baseUrl = 'https://chungchigiaoduc.vn';

  messageType: 'success' | 'error' | 'warning' = 'success';

  // New properties for results summary
  correctAnswersCount: number = 0;
  incorrectAnswersCount: number = 0;
  unansweredCount: number = 0;

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.prepareExamFileList();
  }

  prepareExamFileList(): void {
    this.allExamFiles = [
      { name: 'Đề thi 1', listQuestion: DE_1_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 2', listQuestion: DE_2_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 3', listQuestion: DE_3_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 4', listQuestion: DE_4_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 5', listQuestion: DE_5_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 6', listQuestion: DE_6_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 7', listQuestion: DE_7_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 8', listQuestion: DE_8_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 9', listQuestion: DE_9_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 10', listQuestion: DE_10_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 11', listQuestion: DE_11_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 12', listQuestion: DE_12_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 13', listQuestion: DE_13_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 14', listQuestion: DE_14_RAW_QUESTIONS_LISTENING },
      { name: 'Đề thi 15', listQuestion: DE_15_RAW_QUESTIONS_LISTENING },
    ];
    this.listQuestion = this.allExamFiles[this.selectedExamIndex].listQuestion;
  }

  // Navigation and Test Flow
  goToInstructions(): void {
    this.currentState = TestState.InstructionsScreen;
  }

  // Navigation and Test Flow
  onStartTest(): void {
    this.currentState = TestState.TestInProgress;
    this.currentQuestion = this.listQuestion[0];
    this.currentQuestion.answer = this.shuffleArray(this.currentQuestion.answer);
    this.currentExam = this.allExamFiles[0];
    this.currentQuestionIndex = 0;
    this.startOverallTimer();

    this.correctAnswersCount = 0;
    this.incorrectAnswersCount = 0;
    this.unansweredCount = 0;
  }

  /** Hàm xử lý chọn đề thi
   */
  onExamSelectionChange(index: number): void {
    this.selectedExamIndex = index;
    this.currentExam = this.allExamFiles[index];
    this.listQuestion = this.allExamFiles[index].listQuestion;
  }

  selectOption(answer: DTOAnswer, listAnswer: DTOAnswer[] | null): void {
    answer.choose = true;
    this.currentQuestion.isAnswered = true;

    listAnswer?.forEach((item) => {
      if (item !== answer) {
        item.choose = false;
      }
    });
  }

  getOptionLetter(i: number): string {
    // 65 là mã ASCII của 'A'
    return String.fromCharCode(65 + i);
  }

  shuffleArray<T>(array: DTOAnswer[] | null): DTOAnswer[] | null {
    const result = array?.slice(); // copy mảng để không ảnh hưởng tham chiếu gốc
    if (!result) {
      return null;
    }
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }


  // loadQuestion(index: number): void {
  //   if (index >= 0 && index < this.questions.length) {
  //     this.currentQuestion = this.questions[index];
  //     this.isPlayingAudio = false;
  //     if (this.audioPlayer) this.audioPlayer.pause();
  //   }
  // }

  nextQuestion(): void {
    this.clearUserMessage();

    if (this.currentQuestionIndex < this.listQuestion.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.listQuestion[this.currentQuestionIndex];
      this.currentQuestion.answer = this.shuffleArray(this.currentQuestion.answer);
    } else {
      this.finishTest(); // Auto-submit when reaching the end
    }
  }

  previousQuestion(): void {
    this.clearUserMessage();

    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.listQuestion[this.currentQuestionIndex];
      this.currentQuestion.answer = this.shuffleArray(this.currentQuestion.answer);
    }
  }

  //   toggleBookmark(): void {
  //     if (this.currentQuestion) {
  //       this.currentQuestion.isBookmarked = !this.currentQuestion.isBookmarked;
  //     }
  //   }

  //   getPlayButtonText(): string {
  //     if (this.isPlayingAudio) return 'Dừng';
  //     return 'Phát Audio Chính';
  //   }

  //   getSubQuestionPlayButtonText(subQuestion: SubQuestionMCQ | SubQuestionDropdown): string {
  //     let audioUrl: string | undefined;
  //     if ('audioUrl' in subQuestion && subQuestion.audioUrl) {
  //         audioUrl = subQuestion.audioUrl;
  //     } else if ('dropdownAudioUrl' in subQuestion && subQuestion.dropdownAudioUrl) {
  //         audioUrl = subQuestion.dropdownAudioUrl;
  //     }

  //     if (this.isPlayingAudio && this.audioPlayer.src === audioUrl) {
  //       return 'Dừng';
  //     }
  //     return 'Phát';
  //   }

  startOverallTimer(): void {
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.totalTimeInSeconds > 0) {
        this.totalTimeInSeconds--;
        this.updateTimerDisplay();
      } else {
        clearInterval(this.timerInterval);
        this.showUserMessage('Hết giờ làm bài!', 'error');
        this.finishTest();
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    const minutes = Math.floor(this.totalTimeInSeconds / 60);
    const seconds = this.totalTimeInSeconds % 60;
    this.timeRemaining = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  Message: string = '';
  showUserMessage(
    message: string,
    type: 'success' | 'error' | 'warning'
  ): void {
    this.Message = message;
    this.messageType = type;
    setTimeout(() => {
      this.clearUserMessage();
    }, 5000);
  }

  clearUserMessage(): void {
    this.Message = '';
  }

  finishTest(): void {
    clearInterval(this.timerInterval); // Dừng bộ đếm thời gian
    this.audioPlayer.pause(); // Dừng bất kỳ âm thanh nào đang phát

    this.calculateResults(); // Tính toán số câu đúng/sai/chưa trả lời
    this.currentState = TestState.ResultsScreen; // Chuyển trạng thái sang màn hình kết quả
    this.cdRef.detectChanges(); // Đảm bảo UI được cập nhật
  }

  prepareFlatResultItems(): void {
    // this.flatResultItems = [];
    // this.questions.forEach(q => {
    //   if (q.displayType === QuestionDisplayType.MCQ) {
    //     this.flatResultItems.push(q as QuestionMCQ);
    //   } else if (q.displayType === QuestionDisplayType.GroupedMCQ) {
    //     const groupedQ = q as QuestionGroupedMCQ;
    //     groupedQ.subQuestions.forEach(subQ => {
    //       this.flatResultItems.push(subQ);
    //     });
    //   } else if (q.displayType === QuestionDisplayType.DropdownMatch) {
    //     const dropdownQ = q as QuestionDropdownMatch;
    //     dropdownQ.subQuestions.forEach(subQ => {
    //       this.flatResultItems.push(subQ);
    //     });
    //   }
    //   // Bỏ qua Unsupported questions
    // });
  }

  calculateResults(): void {
    // Duyệt qua mảng flatResultItems đã chuẩn bị
    // this.flatResultItems.forEach(item => {
    //   if (item.isAnswered) {
    //     if (item.userSelectedAnswer && (item.userSelectedAnswer.correct === 1 || item.userSelectedAnswer.correct === 1)) {
    //       this.correctAnswersCount++;
    //     } else {
    //       this.incorrectAnswersCount++;
    //     }
    //   } else {
    //     this.unansweredCount++;
    //   }
    // });
  }

  //   getTotalScorableQuestions(): number {
  //     // Nên sử dụng this.flatResultItems.length sau khi nó đã được chuẩn bị
  //     // hoặc tính toán lại dựa trên logic tương tự prepareFlatResultItems
  //     // Ví dụ:
  //     let total = 0;
  //     this.questions.forEach(q => {
  //       if (q.displayType === QuestionDisplayType.MCQ) {
  //         total++;
  //       } else if (q.displayType === QuestionDisplayType.GroupedMCQ) {
  //         total += q.subQuestions.length;
  //       } else if (q.displayType === QuestionDisplayType.DropdownMatch) {
  //         total += q.subQuestions.length;
  //       }
  //     });
  //     return total;
  //   }

  playMainAudio(): void {
    this.clearUserMessage();
    if (!this.currentQuestion) return;

    if (!this.currentQuestion.audio_url) {
      this.showUserMessage(
        'Không có file audio chính cho phần này.',
        'warning'
      );
      return;
    }

    if (this.audioPlayer.src !== this.currentQuestion.audio_url) {
      this.audioPlayer.src = this.currentQuestion.audio_url;
      this.isPlayingAudio = false;
    }

    if (this.audioPlayer.paused || this.audioPlayer.ended) {
      if (this.currentQuestion.playCount < this.maxAudioPlays) {
        this.audioPlayer
          .play()
          .then(() => {
            this.isPlayingAudio = true;
            this.currentQuestion!.playCount++;
            this.cdRef.detectChanges();
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
            this.showUserMessage('Lỗi phát audio: ' + error.message, 'error');
            this.isPlayingAudio = false;
            this.cdRef.detectChanges();
          });

        this.audioPlayer.onended = () => {
          this.isPlayingAudio = false;
          this.cdRef.detectChanges();
        };
      } else {
        this.showUserMessage(
          'Bạn đã hết số lần nghe cho đoạn ghi âm này.',
          'warning'
        );
      }
    } else {
      this.audioPlayer.pause();
      this.isPlayingAudio = false;
    }
  }

  getSelectedAnswerValue(answers: DTOAnswer[] | null): string | null {
    console.log(answers);
    if (answers) {
      const chosen = answers.find((a) => a.choose);
      return chosen ? chosen.answer : '';
    }
    return '';
  }

  //Hàm đánh giá màu (đúng/sai)
  getRightAnswer(listAnswer: DTOAnswer[] | null): DTOAnswer | null {
    if (listAnswer) {
      for (const item of listAnswer) {
        if (item.correct == 1) {
          return item;
        }
      }
    }
    return null;
  }

  //   playSubQuestionAudio(subQuestion: SubQuestionMCQ | SubQuestionDropdown): void {
  //     this.clearUserMessage();
  //     let audioUrlToPlay: string | undefined;

  //     if ('audioUrl' in subQuestion && subQuestion.audioUrl) {
  //         audioUrlToPlay = subQuestion.audioUrl;
  //     } else if ('dropdownAudioUrl' in subQuestion && subQuestion.dropdownAudioUrl) {
  //         audioUrlToPlay = subQuestion.dropdownAudioUrl;
  //     }

  //     if (!audioUrlToPlay) {
  //         this.showUserMessage("Không có file audio cho câu hỏi phụ này.", 'warning');
  //         return;
  //     }

  //     if (this.isPlayingAudio && this.audioPlayer.src !== audioUrlToPlay) {
  //         this.audioPlayer.pause();
  //         this.isPlayingAudio = false;
  //     }

  //     if (this.audioPlayer.src !== audioUrlToPlay) {
  //         this.audioPlayer.src = audioUrlToPlay;
  //         this.isPlayingAudio = false;
  //     }

  //     if (this.audioPlayer.paused || this.audioPlayer.ended) {
  //         if (subQuestion.playCount < this.maxAudioPlays) {
  //             this.audioPlayer.play()
  //               .then(() => {
  //                 this.isPlayingAudio = true;
  //                 subQuestion.playCount++;
  //                 this.cdRef.detectChanges();
  //               })
  //               .catch(error => {
  //                 console.error("Error playing sub-question audio:", error);
  //                 this.showUserMessage("Lỗi phát audio.", 'error');
  //                 this.isPlayingAudio = false;
  //                 this.cdRef.detectChanges();
  //               });
  //             this.audioPlayer.onended = () => {
  //                 this.isPlayingAudio = false;
  //                 this.cdRef.detectChanges();
  //             };
  //         } else {
  //             this.showUserMessage("Bạn đã hết số lần nghe cho đoạn ghi âm này.", 'warning');
  //         }
  //     } else {
  //         this.audioPlayer.pause();
  //         this.isPlayingAudio = false;
  //     }
  //   }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.removeAttribute('src');
      this.audioPlayer.load();
    }
  }

    // New method to navigate back to the start screen
    goToStartScreen(): void {
      // Reset component state for a new test if necessary
      this.currentState = TestState.StartScreen;
      this.currentQuestionIndex = 0;
      this.audioPlayer.pause();
      this.audioPlayer.removeAttribute('src');
      this.audioPlayer.load();
      this.correctAnswersCount = 0;
      this.incorrectAnswersCount = 0;
      this.unansweredCount = 0;
      clearInterval(this.timerInterval); // Stop timer if it's still running for some reason
      this.timeRemaining = '40:00'; // Reset display timer
      this.cdRef.detectChanges();
    }

  //   // Helper method to determine the overall styling for a question in results
  //   getQuestionResultClasses(question: QuestionUnion): { [key: string]: boolean } {
  //     let isCorrectOverall = false;
  //     let isIncorrectOverall = false;
  //     let isUnansweredOverall = false;

  //     if (question.displayType === QuestionDisplayType.MCQ) {
  //       const q = question as QuestionMCQ;
  //       if (q.isAnswered) {
  //         isCorrectOverall = (q.userSelectedAnswer?.correct === 1 || q.userSelectedAnswer?.correct === 1);
  //         isIncorrectOverall = !isCorrectOverall;
  //       } else {
  //         isUnansweredOverall = true;
  //       }
  //     } else if (question.displayType === QuestionDisplayType.GroupedMCQ) {
  //       const q = question as QuestionGroupedMCQ;
  //       const answeredSubQuestions = q.subQuestions.filter(sq => sq.isAnswered);
  //       if (answeredSubQuestions.length === 0) {
  //         isUnansweredOverall = true;
  //       } else {
  //         // A grouped question is correct overall if ALL answered sub-questions are correct
  //         isCorrectOverall = q.subQuestions.every(subQ => !subQ.isAnswered || (subQ.userSelectedAnswer?.correct === 1 || subQ.userSelectedAnswer?.correct === 1));
  //         // A grouped question is incorrect overall if ANY answered sub-question is incorrect
  //         isIncorrectOverall = q.subQuestions.some(subQ => subQ.isAnswered && !(subQ.userSelectedAnswer?.correct === 1 || subQ.userSelectedAnswer?.correct === 1));
  //       }
  //     } else if (question.displayType === QuestionDisplayType.DropdownMatch) {
  //       const q = question as QuestionDropdownMatch;
  //       const answeredSubQuestions = q.subQuestions.filter(sq => sq.isAnswered);
  //       if (answeredSubQuestions.length === 0) {
  //         isUnansweredOverall = true;
  //       } else {
  //         // Similar logic for dropdown match
  //         isCorrectOverall = q.subQuestions.every(subQ => !subQ.isAnswered || (subQ.userSelectedAnswer?.correct === 1 || subQ.userSelectedAnswer?.correct === 1));
  //         isIncorrectOverall = q.subQuestions.some(subQ => subQ.isAnswered && !(subQ.userSelectedAnswer?.correct === 1 || subQ.userSelectedAnswer?.correct === 1));
  //       }
  //     }

  //     return {
  //       'border-green-300 bg-green-50': isCorrectOverall,
  //       'border-red-300 bg-red-50': isIncorrectOverall,
  //       'border-gray-200 bg-gray-50': isUnansweredOverall
  //     };
  //   }

  // // Helper to get selected answer text for display in results
  //   getUserSelectedAnswerText(item: QuestionMCQ | SubQuestionMCQ | SubQuestionDropdown): string {
  //     if (item.isAnswered && item.userSelectedAnswer) {
  //       if ('selectedAnswerLabel' in item && item.selectedAnswerLabel) {
  //         return `${item.selectedAnswerLabel}. ${item.userSelectedAnswer.answer}`;
  //       }
  //       else if ('selectedOptionText' in item && item.selectedOptionText) {
  //         return item.userSelectedAnswer.answer;
  //       }
  //     }
  //     return 'Chưa trả lời';
  //   }

  //   // Helper to get correct answer text for display in results
  //   getCorrectAnswerText(item: QuestionMCQ | SubQuestionMCQ | SubQuestionDropdown): string {
  //     if ('correctAnswerLabel' in item && item.correctAnswerLabel) {
  //       const mcqOrSubMcqItem = item as (QuestionMCQ | SubQuestionMCQ);
  //       const correctOption = mcqOrSubMcqItem.options.find(
  //         (opt: { label: string; text: string }) => opt.label === mcqOrSubMcqItem.correctAnswerLabel
  //       );
  //       return `${mcqOrSubMcqItem.correctAnswerLabel}. ${correctOption?.text || ''}`;
  //     }
  //     else if ('correctOptionText' in item && item.correctOptionText) {
  //       const dropdownItem = item as SubQuestionDropdown;
  //       return dropdownItem.correctOptionText;
  //     }
  //     return ''; // Should not happen for supported question types
  //   }

  //   // Helper to get correctness status text for display in results
  //   getAnswerStatusText(item: QuestionMCQ | SubQuestionMCQ | SubQuestionDropdown): string {
  //     if (!item.isAnswered) {
  //       return 'Chưa trả lời';
  //     }

  //     if (item.userSelectedAnswer && (item.userSelectedAnswer.correct === 1 || item.userSelectedAnswer.correct === 1)) {
  //       return 'Đúng';
  //     } else {
  //       return 'Sai';
  //     }
  //   }
}
