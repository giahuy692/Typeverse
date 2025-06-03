// listening.component.ts
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DE_2_RAW_QUESTIONS } from 'src/assets/mock-data/DE_2_RAW_QUESTIONS';
import { DE_3_RAW_QUESTIONS } from 'src/assets/mock-data/DE_3_RAW_QUESTIONS';
import { DE_4_RAW_QUESTIONS } from 'src/assets/mock-data/DE_4_RAW_QUESTIONS';
import { DE_5_RAW_QUESTIONS } from 'src/assets/mock-data/DE_5_RAW_QUESTIONS';
import { DE_6_RAW_QUESTIONS } from 'src/assets/mock-data/DE_6_RAW_QUESTIONS';
import { DE_7_RAW_QUESTIONS } from 'src/assets/mock-data/DE_7_RAW_QUESTIONS';
import { DE_8_RAW_QUESTIONS } from 'src/assets/mock-data/DE_8_RAW_QUESTIONS';
import { DE_9_RAW_QUESTIONS } from 'src/assets/mock-data/DE_9_RAW_QUESTIONS';
import { DE_10_RAW_QUESTIONS } from 'src/assets/mock-data/DE_10_RAW_QUESTIONS';
import { DE_11_RAW_QUESTIONS } from 'src/assets/mock-data/DE_11_RAW_QUESTIONS';
import { DE_12_RAW_QUESTIONS } from 'src/assets/mock-data/DE_12_RAW_QUESTIONS';
import { DE_13_RAW_QUESTIONS } from 'src/assets/mock-data/DE_13_RAW_QUESTIONS';
import { DE_14_RAW_QUESTIONS } from 'src/assets/mock-data/DE_14_RAW_QUESTIONS';
import { DE_15_RAW_QUESTIONS } from 'src/assets/mock-data/DE_15_RAW_QUESTIONS';
import { DE_1_RAW_QUESTIONS } from 'src/assets/mock-data/DE_1_RAW_QUESTIONS';

// ENUMS
export enum TestState {
  StartScreen,
  InstructionsScreen,
  TestInProgress
}

export enum QuestionDisplayType {
  MCQ,
  GroupedMCQ,
  DropdownMatch,
  Unsupported
}

// INTERFACES FOR QUESTION DATA FROM JSON
interface RawAnswerOption {
  answer: string;
  is_correct?: number;
  correct?: number;
}

interface RawQuestionData {
  id: number;
  title: string;
  audio_url: string | null;
  answer: RawAnswerOption[] | null; // Null for parent questions of type 2, 3, 5
  type: number;
  sort_by: number;
  childs?: RawQuestionData[];
  content?: string;
  explain?: string | null;
  skill_id?: number;
}

interface JsonListQuestionResponseData {
  count?: string;
  data?: RawQuestionData[];
}

interface JsonListSkillResponseDataItem {
  id: number;
  name: string;
  description: string;
  time: number;
  questions_count: number;
}

interface JsonFileRootItem {
  url: string;
  method: string;
  data: JsonListQuestionResponseData | JsonListSkillResponseDataItem[] | any;
}


// INTERFACES FOR COMPONENT'S QUESTION STRUCTURE
interface OptionState {
  label: string;
  text: string;
  status: 'correct' | 'incorrect' | 'neutral' | 'unanswered';
}

interface QuestionBase {
  id: number;
  userFriendlyId: string;
  isBookmarked: boolean;
  playCount: number;
}

interface QuestionMCQ extends QuestionBase {
  displayType: QuestionDisplayType.MCQ;
  questionText: string;
  audioUrl: string;
  options: OptionState[];
  selectedAnswerLabel?: string;
  correctAnswerLabel: string;
  isAnswered: boolean;
}

interface SubQuestionMCQ {
  id: number;
  questionText: string;
  options: OptionState[];
  selectedAnswerLabel?: string;
  correctAnswerLabel: string;
  isBookmarked: boolean;
  isAnswered: boolean;
  audioUrl?: string;
  playCount: number;
}

interface QuestionGroupedMCQ extends QuestionBase {
  displayType: QuestionDisplayType.GroupedMCQ;
  mainInstruction: string;
  mainAudioUrl?: string;
  subQuestions: SubQuestionMCQ[];
}

interface DropdownOption {
  text: string;
}

interface SubQuestionDropdown {
  id: number;
  promptText: string;
  dropdownAudioUrl?: string;
  options: DropdownOption[];
  selectedOptionText?: string;
  correctOptionText: string;
  isBookmarked: boolean;
  isAnswered: boolean;
  status: 'correct' | 'incorrect' | 'neutral' | 'unanswered';
  playCount: number;
}

interface QuestionDropdownMatch extends QuestionBase {
  displayType: QuestionDisplayType.DropdownMatch;
  mainInstruction: string;
  mainAudioUrl?: string;
  subQuestions: SubQuestionDropdown[];
}

interface QuestionUnsupported extends QuestionBase {
  displayType: QuestionDisplayType.Unsupported;
  title: string;
  rawType: number;
}

type QuestionUnion = QuestionMCQ | QuestionGroupedMCQ | QuestionDropdownMatch | QuestionUnsupported;

interface ExamFileEntry {
  name: string;
  fileName: string;
  rawQuestionList?: RawQuestionData[];
  parsedQuestions?: QuestionUnion[];
  questionCount?: number;
}

// --- END MOCK DATA ---

@Component({
  selector: 'app-listening-test',
  templateUrl: './listening-test.component.html',
  styleUrls: ['./listening-test.component.scss']
})
export class ListeningTestComponent implements OnInit, OnDestroy {
  TestStateEnum = TestState;
  QuestionDisplayTypeEnum = QuestionDisplayType;
  currentState: TestState = TestState.StartScreen;

  allExamFiles: ExamFileEntry[] = [];
  selectedExamIndex: number = 0;

  questions: QuestionUnion[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion!: QuestionUnion;

  totalTimeInSeconds: number = 40 * 60;
  timeRemaining: string = '40:00';
  private timerInterval: any;

  audioPlayer = new Audio();
  isPlayingAudio: boolean = false;
  readonly maxAudioPlays: number = 2;
  readonly baseUrl = 'https://chungchigiaoduc.vn';

  userMessage: string | null = null;
  messageType: 'success' | 'error' | 'warning' = 'success';

  // HttpClient is not needed if all data is embedded
  constructor(private cdRef: ChangeDetectorRef /*, private http: HttpClient*/) {}

  ngOnInit(): void {
    this.prepareExamFileList();
    if (this.allExamFiles.length > 0) {
      this.fetchAndCacheQuestionCount(this.selectedExamIndex);
    }
  }

  prepareExamFileList(): void {
    this.allExamFiles = [
      { name: "Đề thi 1", fileName: "Listening Đề 1.json", rawQuestionList: DE_1_RAW_QUESTIONS },
      { name: "Đề thi 2", fileName: "Listening Đề 2.json", rawQuestionList: DE_2_RAW_QUESTIONS },
      { name: "Đề thi 3", fileName: "Listening Đề 3.json", rawQuestionList: DE_3_RAW_QUESTIONS },
      { name: "Đề thi 4", fileName: "Listening Đề 4.json", rawQuestionList: DE_4_RAW_QUESTIONS },
      { name: "Đề thi 5", fileName: "Listening Đề 5.json", rawQuestionList: DE_5_RAW_QUESTIONS },
      { name: "Đề thi 6", fileName: "Listening Đề 6.json", rawQuestionList: DE_6_RAW_QUESTIONS },
      { name: "Đề thi 7", fileName: "Listening Đề 7.json", rawQuestionList: DE_7_RAW_QUESTIONS },
      { name: "Đề thi 8", fileName: "Listening Đề 8.json", rawQuestionList: DE_8_RAW_QUESTIONS },
      { name: "Đề thi 9", fileName: "Listening Đề 9.json", rawQuestionList: DE_9_RAW_QUESTIONS },
      { name: "Đề thi 10", fileName: "Listening Đề 10.json", rawQuestionList: DE_10_RAW_QUESTIONS },
      { name: "Đề thi 11", fileName: "Listening Đề 11.json", rawQuestionList: DE_11_RAW_QUESTIONS },
      { name: "Đề thi 12", fileName: "Listening Đề 12.json", rawQuestionList: DE_12_RAW_QUESTIONS },
      { name: "Đề thi 13", fileName: "Listening Đề 13.json", rawQuestionList: DE_13_RAW_QUESTIONS },
      { name: "Đề thi 14", fileName: "Listening Đề 14.json", rawQuestionList: DE_14_RAW_QUESTIONS },
      { name: "Đề thi 15", fileName: "Listening Đề 15.json", rawQuestionList: DE_15_RAW_QUESTIONS },
    ];
     this.allExamFiles.forEach((exam) => {
        if (exam.rawQuestionList && exam.rawQuestionList.length > 0) {
            const tempParsed = this._parseRawQuestions(exam.rawQuestionList);
            exam.questionCount = tempParsed.filter(q => q.displayType !== QuestionDisplayType.Unsupported).length;
        } else {
            // If rawQuestionList is explicitly an empty array (placeholder), count is 0
            // If rawQuestionList is undefined (not yet fetched/filled), count remains undefined
            exam.questionCount = (exam.rawQuestionList && exam.rawQuestionList.length === 0) ? 0 : undefined;
        }
    });
  }
  
  fetchAndCacheQuestionCount(examIndex: number): void {
    const examFileEntry = this.allExamFiles[examIndex];
    // Only calculate if not already done and raw data is available
    if (examFileEntry && examFileEntry.questionCount === undefined && examFileEntry.rawQuestionList) {
      if (examFileEntry.rawQuestionList.length > 0) {
          const tempParsedQuestions = this._parseRawQuestions(examFileEntry.rawQuestionList);
          examFileEntry.questionCount = tempParsedQuestions.filter(q => q.displayType !== QuestionDisplayType.Unsupported).length;
      } else {
          examFileEntry.questionCount = 0; // Empty data array
      }
      this.cdRef.detectChanges();
    } else if (examFileEntry && !examFileEntry.rawQuestionList) {
        // This case implies data should be fetched, but we are using embedded data.
        // For now, if rawQuestionList is not even an empty array, it means data is missing in constants.
        console.warn(`Raw data for ${examFileEntry.name} is missing in constants.`);
        examFileEntry.questionCount = 0; // Or handle as an error
        this.cdRef.detectChanges();
    }
  }
  
  onExamSelectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedExamIndex = parseInt(selectElement.value, 10);
    this.fetchAndCacheQuestionCount(this.selectedExamIndex);
  }

  get currentExamQuestionCountOnStartScreen(): string {
    if (this.allExamFiles.length > 0 && this.selectedExamIndex < this.allExamFiles.length && this.allExamFiles[this.selectedExamIndex]) {
      const count = this.allExamFiles[this.selectedExamIndex].questionCount;
      if (count === undefined) return 'N/A'; // Or 'Đang tải...' if you had an async fetch
      return count.toString();
    }
    return 'N/A';
  }

  private _parseRawQuestions(rawQuestions: RawQuestionData[]): QuestionUnion[] {
    const questionLabels = ['A', 'B', 'C', 'D', 'E'];
    const parsed: QuestionUnion[] = rawQuestions.map((rq, index) => {
      const userFriendlyId = `Câu ${rq.sort_by !== undefined ? rq.sort_by : index + 1}`;
      const commonAudioUrl = rq.audio_url ? this.baseUrl + rq.audio_url : undefined;
      const cleanHtml = (htmlString: string | null | undefined): string => htmlString ? htmlString.replace(/<[^>]*>/g, '').trim() : '';

      switch (rq.type) {
        case 1:
          if (!rq.answer || !rq.audio_url) return { id: rq.id, displayType: QuestionDisplayType.Unsupported, userFriendlyId, title: cleanHtml(rq.title), rawType: rq.type, playCount:0, isBookmarked: false } as QuestionUnsupported;
          let correctAnswerLabelMCQ: string = '';
          const optionsMCQ: OptionState[] = rq.answer.map((ans, optIndex) => {
            const label = questionLabels[optIndex];
            if (ans.is_correct === 1) correctAnswerLabelMCQ = label;
            return { label, text: ans.answer, status: 'unanswered' };
          });
          return {
            id: rq.id, displayType: QuestionDisplayType.MCQ, questionText: cleanHtml(rq.title), audioUrl: this.baseUrl + rq.audio_url,
            options: optionsMCQ, playCount: 0, isBookmarked: false, correctAnswerLabel: correctAnswerLabelMCQ, userFriendlyId, isAnswered: false
          } as QuestionMCQ;

        case 2:
        case 5:
          const parentInstructionMCQ = cleanHtml(rq.content || rq.title);
          if (!rq.childs || rq.childs.length === 0) return { id: rq.id, displayType: QuestionDisplayType.Unsupported, userFriendlyId, title: parentInstructionMCQ, rawType: rq.type, playCount:0, isBookmarked: false } as QuestionUnsupported;
          const subQuestionsMCQ: SubQuestionMCQ[] = rq.childs.map(child => {
            let correctSubAnswerLabel: string = '';
            const subOptions: OptionState[] = child.answer ? child.answer.map((ans, optIndex) => {
              const label = questionLabels[optIndex];
              if (ans.is_correct === 1) correctSubAnswerLabel = label;
              return { label, text: ans.answer, status: 'unanswered' };
            }) : [];
            return {
              id: child.id, questionText: cleanHtml(child.title), options: subOptions, correctAnswerLabel: correctSubAnswerLabel,
              isBookmarked: false, isAnswered: false, audioUrl: child.audio_url ? this.baseUrl + child.audio_url : undefined, playCount: 0
            };
          });
          return {
            id: rq.id, displayType: QuestionDisplayType.GroupedMCQ, mainInstruction: parentInstructionMCQ, mainAudioUrl: commonAudioUrl,
            subQuestions: subQuestionsMCQ, playCount: 0, isBookmarked: false, userFriendlyId
          } as QuestionGroupedMCQ;
        
        case 3:
          const parentInstructionDropdown = cleanHtml(rq.content || rq.title);
          if (!rq.childs || rq.childs.length === 0) return { id: rq.id, displayType: QuestionDisplayType.Unsupported, userFriendlyId, title: parentInstructionDropdown, rawType: rq.type, playCount:0, isBookmarked: false } as QuestionUnsupported;
          const subQuestionsDropdown: SubQuestionDropdown[] = rq.childs.filter(child => child.answer && child.answer.length > 0).map(child => {
            const childOptions: DropdownOption[] = child.answer!.map(ans => ({ text: ans.answer }));
            const correctOpt = child.answer!.find(ans => ans.correct === 1 || ans.is_correct === 1);
            return {
              id: child.id, promptText: cleanHtml(child.title), dropdownAudioUrl: child.audio_url ? this.baseUrl + child.audio_url : undefined,
              options: childOptions, correctOptionText: correctOpt ? correctOpt.answer : '',
              isBookmarked: false, isAnswered: false, status: 'unanswered', playCount: 0
            };
          });
           if (subQuestionsDropdown.length === 0 && rq.childs && rq.childs.length > 0) {
             console.warn(`No valid subquestions with answers parsed for Type 3 parent question ID: ${rq.id}`);
             return { id: rq.id, displayType: QuestionDisplayType.Unsupported, userFriendlyId, title: parentInstructionDropdown, rawType: rq.type, playCount:0, isBookmarked: false } as QuestionUnsupported;
           }
          return {
            id: rq.id, displayType: QuestionDisplayType.DropdownMatch, mainInstruction: parentInstructionDropdown, mainAudioUrl: commonAudioUrl,
            subQuestions: subQuestionsDropdown, playCount: 0, isBookmarked: false, userFriendlyId
          } as QuestionDropdownMatch;

        default:
          console.warn(`Unsupported question type: ${rq.type} for question ID: ${rq.id}`);
          return { id: rq.id, displayType: QuestionDisplayType.Unsupported, userFriendlyId, title: cleanHtml(rq.title), rawType: rq.type, playCount:0, isBookmarked: false } as QuestionUnsupported;
      }
    })
    .sort((a, b) => {
        const numA = parseInt(a.userFriendlyId.replace('Câu ', ''), 10);
        const numB = parseInt(b.userFriendlyId.replace('Câu ', ''), 10);
        return numA - numB;
    });
    return parsed;
  }

  // Navigation and Test Flow
  goToInstructions(): void {
    this.currentState = TestState.InstructionsScreen;
    if (this.allExamFiles[this.selectedExamIndex] && this.allExamFiles[this.selectedExamIndex].questionCount === undefined) {
        this.fetchAndCacheQuestionCount(this.selectedExamIndex);
    }
  }

  startTest(): void {
    this.clearUserMessage();
    const examIndex = this.selectedExamIndex;

    if (this.allExamFiles.length > 0 && examIndex < this.allExamFiles.length) {
      const selectedExamFile = this.allExamFiles[examIndex];
      
      // Use pre-loaded rawQuestionList from constants
      const rawQs = selectedExamFile.rawQuestionList;

      if (rawQs && rawQs.length > 0) {
        this.questions = this._parseRawQuestions(rawQs);
        selectedExamFile.parsedQuestions = this.questions; // Cache parsed questions
        // Update questionCount based on actual parsed questions that are supported
        selectedExamFile.questionCount = this.questions.filter(q => q.displayType !== QuestionDisplayType.Unsupported).length;

        if (selectedExamFile.questionCount > 0) {
          this.currentState = TestState.TestInProgress;
          this.currentQuestionIndex = 0;
          this.totalTimeInSeconds = 40 * 60; // Reset timer
          this.loadQuestion(this.currentQuestionIndex);
          this.startOverallTimer();
        } else {
          this.showUserMessage(`Không tìm thấy câu hỏi phù hợp trong ${selectedExamFile.name}.`, 'error');
        }
      } else { 
          this.showUserMessage(`Dữ liệu cho ${selectedExamFile.name} là rỗng hoặc chưa được cung cấp. Vui lòng điền dữ liệu vào các hằng số trong component.`, 'warning');
      }
    } else {
      this.showUserMessage("Đề thi không hợp lệ đã được chọn.", 'error');
    }
  }

  loadQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestion = this.questions[index];
      this.isPlayingAudio = false;
      if (this.audioPlayer) this.audioPlayer.pause();
    }
  }

  nextQuestion(): void {
    this.clearUserMessage();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.loadQuestion(this.currentQuestionIndex);
    } else {
      this.finishTest();
    }
  }

  previousQuestion(): void {
    this.clearUserMessage();
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.loadQuestion(this.currentQuestionIndex);
    }
  }

  toggleBookmark(): void {
    if (this.currentQuestion) {
      this.currentQuestion.isBookmarked = !this.currentQuestion.isBookmarked;
    }
  }
  
  selectOption(optionLabel: string, subQuestionId?: number): void {
    this.clearUserMessage();
    if (!this.currentQuestion) return;
  
    const applySelection = (question: QuestionMCQ | SubQuestionMCQ, optLabel: string) => {
      if (!question.isAnswered) {
        question.selectedAnswerLabel = optLabel;
        question.isAnswered = true;
        question.options.forEach(opt => {
          if (opt.label === optLabel) { 
            opt.status = opt.label === question.correctAnswerLabel ? 'correct' : 'incorrect';
          } else if (opt.label === question.correctAnswerLabel) { 
            if (optLabel !== question.correctAnswerLabel) opt.status = 'correct';
            else opt.status = 'neutral';
          } else { 
            if(opt.status !== 'correct') opt.status = 'neutral';
          }
        });
      }
    };
  
    if (this.currentQuestion.displayType === QuestionDisplayType.MCQ) {
      applySelection(this.currentQuestion as QuestionMCQ, optionLabel);
    } else if (this.currentQuestion.displayType === QuestionDisplayType.GroupedMCQ && subQuestionId !== undefined) {
      const qGroup = this.currentQuestion as QuestionGroupedMCQ;
      const subQ = qGroup.subQuestions.find(sq => sq.id === subQuestionId);
      if (subQ) {
        applySelection(subQ, optionLabel);
      }
    }
    this.cdRef.detectChanges();
  }
  
  handleDropdownChange(event: Event, subQuestionId: number): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
        this.selectDropdownOption(target.value, subQuestionId);
    }
  }

  selectDropdownOption(selectedText: string, subQuestionId: number): void {
    this.clearUserMessage();
    if (!this.currentQuestion || this.currentQuestion.displayType !== QuestionDisplayType.DropdownMatch) return;

    const qMatch = this.currentQuestion as QuestionDropdownMatch;
    const subQ = qMatch.subQuestions.find(sq => sq.id === subQuestionId);

    if (subQ && !subQ.isAnswered) {
      subQ.selectedOptionText = selectedText;
      subQ.isAnswered = true;
      if (selectedText === subQ.correctOptionText) {
        subQ.status = 'correct';
      } else {
        subQ.status = 'incorrect';
      }
    }
    this.cdRef.detectChanges();
  }

  getPlayButtonText(): string { 
    if (this.isPlayingAudio) return 'Dừng';
    return 'Phát Audio Chính';
  }

  getSubQuestionPlayButtonText(subQuestion: SubQuestionMCQ | SubQuestionDropdown): string {
    let audioUrl: string | undefined;
    if ('audioUrl' in subQuestion && subQuestion.audioUrl) { 
        audioUrl = subQuestion.audioUrl;
    } else if ('dropdownAudioUrl' in subQuestion && subQuestion.dropdownAudioUrl) { 
        audioUrl = subQuestion.dropdownAudioUrl;
    }

    if (this.isPlayingAudio && this.audioPlayer.src === audioUrl) {
      return 'Dừng';
    }
    return 'Phát';
  }
  
  startOverallTimer(): void {
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.totalTimeInSeconds > 0) {
        this.totalTimeInSeconds--;
        this.updateTimerDisplay();
      } else {
        clearInterval(this.timerInterval);
        this.showUserMessage("Hết giờ làm bài!", 'error');
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

  showUserMessage(message: string, type: 'success' | 'error' | 'warning'): void {
    this.userMessage = message;
    this.messageType = type;
    setTimeout(() => {
      this.clearUserMessage();
    }, 5000);
  }

  clearUserMessage(): void {
    this.userMessage = null;
  }

  finishTest(): void {
    clearInterval(this.timerInterval);
    const score = this.calculateScore();
    const totalScorable = this.getTotalScorableQuestions();
    console.log("Test Finished. Score:", score, "/", totalScorable, "Answers:", this.questions);
    this.showUserMessage(`Bạn đã hoàn thành bài thi! Điểm số: ${score}/${totalScorable}`, 'success');
  }

  calculateScore(): number {
    let score = 0;
    this.questions.forEach(q => {
      if (q.displayType === QuestionDisplayType.MCQ) {
        if (q.isAnswered && q.selectedAnswerLabel === q.correctAnswerLabel) {
          score++;
        }
      } else if (q.displayType === QuestionDisplayType.GroupedMCQ) {
        q.subQuestions.forEach(subQ => {
          if (subQ.isAnswered && subQ.selectedAnswerLabel === subQ.correctAnswerLabel) {
            score++;
          }
        });
      } else if (q.displayType === QuestionDisplayType.DropdownMatch) {
        q.subQuestions.forEach(subQ => {
          if (subQ.isAnswered && subQ.selectedOptionText === subQ.correctOptionText) {
            score++;
          }
        });
      }
    });
    return score;
  }

  getTotalScorableQuestions(): number {
    let total = 0;
    this.questions.forEach(q => {
      if (q.displayType === QuestionDisplayType.MCQ) {
        total++;
      } else if (q.displayType === QuestionDisplayType.GroupedMCQ) {
        total += q.subQuestions.length;
      } else if (q.displayType === QuestionDisplayType.DropdownMatch) {
        total += q.subQuestions.length;
      }
    });
    return total;
  }

  playMainAudio(): void {
    this.clearUserMessage();
    let audioUrlToPlay: string | undefined = undefined;
    let currentPlayCountTarget: { playCount: number } | undefined = undefined;

    if (!this.currentQuestion) return;

    if (this.currentQuestion.displayType === QuestionDisplayType.MCQ) {
        const q = this.currentQuestion as QuestionMCQ;
        audioUrlToPlay = q.audioUrl;
        currentPlayCountTarget = q;
    } else if (this.currentQuestion.displayType === QuestionDisplayType.GroupedMCQ) {
        const q = this.currentQuestion as QuestionGroupedMCQ;
        audioUrlToPlay = q.mainAudioUrl;
        currentPlayCountTarget = q;
    } else if (this.currentQuestion.displayType === QuestionDisplayType.DropdownMatch) {
        const q = this.currentQuestion as QuestionDropdownMatch;
        audioUrlToPlay = q.mainAudioUrl;
        currentPlayCountTarget = q;
    }

    if (!audioUrlToPlay) {
      this.showUserMessage("Không có file audio chính cho phần này.", 'warning');
      return;
    }
     if (!currentPlayCountTarget) return;


    if (this.audioPlayer.src !== audioUrlToPlay) {
        this.audioPlayer.src = audioUrlToPlay;
        this.isPlayingAudio = false;
    }

    if (this.audioPlayer.paused || this.audioPlayer.ended) {
      if (currentPlayCountTarget.playCount < this.maxAudioPlays) {
        this.audioPlayer.play()
          .then(() => {
            this.isPlayingAudio = true;
            currentPlayCountTarget!.playCount++;
            this.cdRef.detectChanges();
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            this.showUserMessage("Lỗi phát audio: " + error.message, 'error');
            this.isPlayingAudio = false;
            this.cdRef.detectChanges();
          });
        
        this.audioPlayer.onended = () => {
          this.isPlayingAudio = false;
          this.cdRef.detectChanges();
        };
      } else {
        this.showUserMessage("Bạn đã hết số lần nghe cho đoạn ghi âm này.", 'warning');
      }
    } else {
      this.audioPlayer.pause();
      this.isPlayingAudio = false;
    }
  }

  playSubQuestionAudio(subQuestion: SubQuestionMCQ | SubQuestionDropdown): void {
    this.clearUserMessage();
    let audioUrlToPlay: string | undefined;

    if ('audioUrl' in subQuestion && subQuestion.audioUrl) { 
        audioUrlToPlay = subQuestion.audioUrl;
    } else if ('dropdownAudioUrl' in subQuestion && subQuestion.dropdownAudioUrl) { 
        audioUrlToPlay = subQuestion.dropdownAudioUrl;
    }

    if (!audioUrlToPlay) {
        this.showUserMessage("Không có file audio cho câu hỏi phụ này.", 'warning');
        return;
    }

    if (this.isPlayingAudio && this.audioPlayer.src !== audioUrlToPlay) {
        this.audioPlayer.pause(); 
        this.isPlayingAudio = false;
    }
    
    if (this.audioPlayer.src !== audioUrlToPlay) {
        this.audioPlayer.src = audioUrlToPlay;
        this.isPlayingAudio = false; 
    }

    if (this.audioPlayer.paused || this.audioPlayer.ended) {
        if (subQuestion.playCount < this.maxAudioPlays) {
            this.audioPlayer.play()
              .then(() => {
                this.isPlayingAudio = true; 
                subQuestion.playCount++;
                this.cdRef.detectChanges();
              })
              .catch(error => {
                console.error("Error playing sub-question audio:", error);
                this.showUserMessage("Lỗi phát audio.", 'error');
                this.isPlayingAudio = false;
                this.cdRef.detectChanges();
              });
            this.audioPlayer.onended = () => {
                this.isPlayingAudio = false;
                this.cdRef.detectChanges();
            };
        } else {
            this.showUserMessage("Bạn đã hết số lần nghe cho đoạn ghi âm này.", 'warning');
        }
    } else { 
        this.audioPlayer.pause();
        this.isPlayingAudio = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.removeAttribute('src'); 
      this.audioPlayer.load();
    }
  }
}