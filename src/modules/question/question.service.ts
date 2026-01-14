import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  AnswerQuestionRequest,
  CreateQuestionRequest,
  GetQuestionRequest,
} from './interface';
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

  async answer({ attempId, questionId, answer }: AnswerQuestionRequest) {
    try {
      const attemp = await this.knex('exam_attemps')
        .join('exams', 'exam_attemps.exam_id', 'exams.id')
        .where('id', attempId)
        .select('started_at', 'finished_at', 'end_time')
        .first();

      if (!attemp) throw new BadRequestException('Data ujian tidak ditemukan');

      if (!attemp.started_at)
        throw new BadRequestException('Ujian belum dimulai');

      if (attemp.finished_at) {
        throw new BadRequestException('Anda sudah menyelesaikan ujian ini');
      }

      const now = new Date();
      if (new Date(attemp.end_time) < now)
        throw new BadRequestException('Waktu ujian telah habis');

      return await this.knex('user_answers')
        .insert({
          attemp_id: attempId,
          question_id: questionId,
          answer,
        })
        .onConflict(['attemp_id', 'question_id'])
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
