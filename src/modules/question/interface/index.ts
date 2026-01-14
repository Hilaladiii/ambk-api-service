import { PaginationParams } from 'src/commons/types/pagination.type';

export enum QuestionType {
  MULTIPLE = 'MULTIPLE',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface CreateQuestionRequest {
  examId: string;
  type: QuestionType;
  question: string;
  point: number;
  structure: object;
  correctAnswer: object;
}

export interface GetQuestionRequest {
  examId: string;
  pagination: PaginationParams;
}

export interface AnswerQuestionRequest {
  questionId: string;
  attempId: string;
  answer: object;
}
