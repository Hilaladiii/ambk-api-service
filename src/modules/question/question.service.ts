import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  AnswerQuestionRequest,
  CreateQuestionRequest,
  GetQuestionRequest,
} from './interface';
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

  async answer({ attemptId, questionId, answer }: AnswerQuestionRequest) {
    try {
      const attempt = await this.knex('exam_attempts')
        .join('exams', 'exam_attempts.exam_id', 'exams.id')
        .where('id', attemptId)
        .select('started_at', 'finished_at', 'end_time')
        .first();

      if (!attempt) throw new BadRequestException('Data ujian tidak ditemukan');

      if (!attempt.started_at)
        throw new BadRequestException('Ujian belum dimulai');

      if (attempt.finished_at) {
        throw new BadRequestException('Anda sudah menyelesaikan ujian ini');
      }

      const now = new Date();
      if (new Date(attempt.end_time) < now)
        throw new BadRequestException('Waktu ujian telah habis');

      return await this.knex('user_answers')
        .insert({
          attempt_id: attemptId,
          question_id: questionId,
          answer,
        })
        .onConflict(['attempt_id', 'question_id'])
        .merge({
          answer,
        })
        .returning('answer')
        .first();
    } catch (error) {
      throw error;
    }
  }
}
