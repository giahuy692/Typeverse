    // src/app/shared/DTO/reading-question.ts

    // Interface cho các lựa chọn đáp án thô (từ mock data)
    export interface RawQuestionOption {
      answer: string;
      correct: 0 | 1; // 0 for incorrect, 1 for correct
      choose?: boolean; // Indicates if it's a pre-selected option in mock data (can be ignored for test logic)
    }

    // Interface cho các câu hỏi con thô (childs) trong raw data
    export interface RawChildQuestion {
      id: number;
      skill_id: number;
      type: number; // 3, 4, 5, 6
      title: string; // Question text or paragraph for type 4
      explain: string | null;
      audio_url: string | null; // Not typically used for reading, but exists in raw data
      answer: RawQuestionOption[] | { title: string; answer_sort: string; }[] | null; // Varies by type
      sort_by: number;
      parent_id: number;
      maximum_number: number;
      seconds_max: number;
    }

    // Interface cho các câu hỏi cha thô (parent) trong raw data
    export interface RawParentQuestion {
      id: number;
      skill_id: number;
      type: number; // 3, 4, 5
      title: string; // Main passage or email title
      explain: string | null;
      audio_url: string | null;
      answer: null; // Parent usually has null answer
      sort_by: number;
      childs: RawChildQuestion[];
    }

    // DTO cho lựa chọn đáp án đã xử lý (để hiển thị trong UI)
    export interface AptisOption {
      id: string; // Unique ID for the option (e.g., q1-opt1)
      text: string; // Text of the option
      isCorrectOption?: boolean; // Whether this is the correct option
    }

    // DTO cho một câu hỏi đã xử lý (để hiển thị trong UI)
    export interface AptisProcessedQuestion {
      id: string; // Unique ID for the question
      rawId: number; // Original ID from raw data
      questionType: 'gap_fill_mcq' | 'heading_match' | 'matching_person_text' | 'reorder' | 'unknown';
      mainContent?: string; // The main passage/email text (for context)
      questionText: string; // The actual question text or paragraph text
      options?: AptisOption[]; // Options for MCQ, Heading Match, Matching Person
      correctAnswerText?: string; // Correct answer text (for gap-fill or reorder combined text)
      correctOptionId?: string; // ID of the correct option (for MCQ, Heading Match, Matching Person)

      reorderSentences?: { text: string; originalIndex: number; }[]; // For type 6 questions
      correctReorderOrder?: string[]; // The correct order of sentences for type 6

      userSelectedOptionId?: string; // User's selected option ID (for MCQ, Heading Match, Matching Person)
      userReorderOrder?: string[]; // User's reordered sentence texts (for type 6)
      isCorrect?: boolean; // Whether the user's answer was correct
      userAnswerText?: string; // The text of the user's selected answer (for review)
    }

    // DTO cho một bài thi Reading đã xử lý
    export interface AptisReadingTest {
      id: string; // Unique ID for the test (e.g., 'DE_1_READING')
      rawParentId: number; // Original ID of the parent from raw data
      title: string; // Title of the test (e.g., "Aptis Reading Test 1 - Email...")
      questions: AptisProcessedQuestion[]; // Array of processed questions
    }
    