import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import { CreateQuestionRequest, GetQuestionRequest } from './interface';
import { PaginationParams } from 'src/commons/types/pagination.type';
import { responsePaginate } from 'src/commons/utils/pagination';

@Injectable()
export class QuestionService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async create(payload: CreateQuestionRequest) {
    const exam = await this.knex('exams')
      .select('id')
      .where({ id: payload.examId })
      .first();

    if (!exam) throw new BadRequestException('Invalid exam id');

    return await this.knex('questions')
      .insert({
        exam_id: payload.examId,
        correct_answer: payload.correctAnswer,
        point: payload.point,
        question: payload.question,
        structure: payload.structure,
        type: payload.type,
      })
      .returning('*');
  }

  async getByExamId({ examId, pagination }: GetQuestionRequest) {
    const query = this.knex('questions')
      .join('exams', 'questions.exam_id', 'exams.id')
      .where({ exam_id: examId })
      .select('type', 'question', 'point', 'structure');

    return responsePaginate(query, pagination);
  }
}
