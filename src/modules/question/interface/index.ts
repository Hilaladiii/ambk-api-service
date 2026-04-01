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

export interface UpdateQuestionRequest {
  type?: QuestionType;
  question?: string;
  point?: number;
  structure?: object;
  correctAnswer?: object;
}

export interface GetQuestionRequest {
  attemptId: string;
  pagination: PaginationParams;
}

export interface GetByExamRequest {
  examId: string;
  pagination: PaginationParams;
}

export interface AnswerQuestionRequest {
  questionId: string;
  attemptId: string;
  answer: object;
}

export interface ToggleFlagRequest {
  attemptId: string;
  questionId: string;
}

