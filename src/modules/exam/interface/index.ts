import { PaginationParams } from 'src/commons/types/pagination.type';

export interface CreateExamRequest {
  creatorId: string;
  title: string;
  description?: string;
  code: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isPublished: boolean;
}

export interface EnrollExamRequest {
  examId: string;
  userId: string;
}

export interface GetEnrollExams {
  userId: string;
  pagination: PaginationParams;
  search?: string;
}

export interface AttemptExamRequest {
  examId: string;
  userId: string;
}

export interface SubmitExamRequest {
  examId: string;
  attemptId: string;
}
