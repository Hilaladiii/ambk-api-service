import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  AnswerQuestionRequest,
  CreateQuestionRequest,
  GetByExamRequest,
  GetQuestionRequest,
  ToggleFlagRequest,
  UpdateQuestionRequest,
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

  async getByExamId({ examId, pagination }: GetByExamRequest) {
    const query = this.knex('questions')
      .where({ exam_id: examId })
      .select('id', 'type', 'question', 'point', 'structure', 'correct_answer')
      .orderBy('id', 'asc');

    return responsePaginate(query, pagination);
  }

  async getById(id: string) {
    const question = await this.knex('questions')
      .where({ id })
      .first();

    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(id: string, payload: UpdateQuestionRequest) {
    try {
      const question = await this.getById(id);

      const updateData: any = {};
      if (payload.type !== undefined) updateData.type = payload.type;
      if (payload.question !== undefined) updateData.question = payload.question;
      if (payload.point !== undefined) updateData.point = payload.point;
      if (payload.structure !== undefined) updateData.structure = payload.structure;
      if (payload.correctAnswer !== undefined) updateData.correct_answer = payload.correctAnswer;

      if (Object.keys(updateData).length > 0) {
        await this.knex('questions').update(updateData).where({ id });
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.knex('questions').where({ id }).del();
      if (!deleted) throw new NotFoundException('Question not found');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getByAttemptId({ attemptId, pagination }: GetQuestionRequest) {
    const query = this.knex('exam_attempt_questions')
      .join('questions', 'exam_attempt_questions.question_id', 'questions.id')
      .leftJoin('user_answers', function () {
        this.on('user_answers.question_id', '=', 'questions.id').andOnVal(
          'user_answers.attempt_id',
          '=',
          attemptId,
        );
      })
      .where('exam_attempt_questions.attempt_id', attemptId)
      .select([
        'questions.id',
        'questions.type',
        'questions.question',
        'questions.structure',
        'exam_attempt_questions.sort_order',
        'exam_attempt_questions.is_flagged',
        'user_answers.answer as saved_answer',
      ])
      .orderBy('exam_attempt_questions.sort_order', 'asc');

    return responsePaginate(query, pagination);
  }

  async answer({ attemptId, questionId, answer }: AnswerQuestionRequest) {
    try {
      const attempt = await this.knex('exam_attempts')
        .join('exams', 'exam_attempts.exam_id', 'exams.id')
        .where('exam_attempts.id', attemptId)
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

  async toggleFlag({ attemptId, questionId }: ToggleFlagRequest) {
    try {
      const mapping = await this.knex('exam_attempt_questions')
        .where({ attempt_id: attemptId, question_id: questionId })
        .first();

      if (!mapping) throw new NotFoundException('Question mapping not found in this attempt');

      const isFlagged = !mapping.is_flagged;
      await this.knex('exam_attempt_questions')
        .update({ is_flagged: isFlagged })
        .where({ attempt_id: attemptId, question_id: questionId });

      return { is_flagged: isFlagged };
    } catch (error) {
      throw error;
    }
  }
}
