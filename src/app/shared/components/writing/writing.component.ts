import { Component, OnInit } from '@angular/core';
import { speakinglist } from 'src/assets/mock-data/speaking-practise';
import { WRITING_PROMPTS, WritingPrompt } from 'src/assets/mock-data/writing-prompts';
import { DTOListQuestion } from '../../DTO/DTOListQuestion';
import { LIST_QUESTIONS } from 'src/assets/mock-data/list-question-data';
// Import mảng template. Đổi đường dẫn cho đúng project bạn!

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
})
export class WritingComponent {
  data: DTOListQuestion[] = LIST_QUESTIONS;
}
