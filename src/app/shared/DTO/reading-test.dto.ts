// src/app/shared/DTO/reading-test.dto.ts

/**
 * Câu hỏi reading aptis 1 đề.
 * Dạng 1: Có childs (mỗi child là 1 câu, mỗi child có answer: mảng các phương án, có thuộc tính choose/correct)
 * Dạng 2: Không có childs, answer là mảng thứ tự.
 */
export type ReadingQuestion = {
    id: number;
    skill_id: number;
    type: number;
    title: string;
    explain: string | null;
    audio_url: string | null;
    answer: ReadingChildAnswer[]; // Có thể là array các option cho mỗi child, hoặc array answer_sort cho thứ tự.
    sort_by: number;
    childs: ReadingChild[] | [];
    userOrder?: ReadingChildAnswer[];
};

export type ReadingChild = {
    id: number;
    skill_id: number;
    type: number;
    title: string;
    explain: string;
    audio_url: string | null;
    answer: ReadingChildAnswer[];
    sort_by: number;
    parent_id: number;
    maximum_number: number;
    seconds_max: number;
    userOrder?: ReadingChildAnswer[];
};

export type ReadingChildAnswer = {
    answer: string;
    correct: number;
    choose: boolean;
    title?: string;
    answer_sort?: string;
    order?: number;
};


