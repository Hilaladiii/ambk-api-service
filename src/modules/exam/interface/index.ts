import { PaginationParams } from 'src/commons/types/pagination.type';

export interface CreateExamRequest {
  creatorId: string;
  title: string;
  description?: string;
  code: string;
  startTime: string;
  endTime: string;
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
