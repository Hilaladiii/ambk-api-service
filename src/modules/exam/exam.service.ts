import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  AttempExamRequest,
  CreateExamRequest,
  EnrollExamRequest,
  GetEnrollExams,
  SubmitExamRequest,
} from './interface';
import { responsePaginate } from 'src/commons/utils/pagination';
import { calculateScore } from 'src/commons/utils/calculate-score';

@Injectable()
export class ExamService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async create(data: CreateExamRequest) {
    try {
      const user = await this.knex('users')
        .select('id')
        .where({ id: data.creatorId })
        .first();

      if (!user) throw new BadRequestException('Invalid user id');

      const [newExam] = await this.knex('exams')
        .insert({
          title: data.title,
          created_by: user.id,
          code: data.code,
          description: data.description,
          duration: data.duration,
          start_time: data.startTime,
          end_time: data.endTime,
          is_published: data.isPublished,
        })
        .returning('*');

      return newExam;
    } catch (error) {
      throw error;
    }
  }

  async getEnrolled({ userId, pagination, search }: GetEnrollExams) {
    try {
      const query = this.knex('exams')
        .join('exam_attemps', 'exams.id', 'exam_attemps.exam_id')
        .where({ user_id: userId })
        .select(['title', 'description', 'start_time', 'end_time', 'duration'])
        .orderBy('title', 'desc');

      if (search) {
        query.andWhere('title', 'ilike', `%${search}%`);
      }

      return responsePaginate(query, pagination);
    } catch (error) {
      throw error;
    }
  }

  async enroll({ examId, userId }: EnrollExamRequest) {
    try {
      await this.getById(examId);

      const [newEnroll] = await this.knex('exam_attemps')
        .insert({
          exam_id: examId,
          user_id: userId,
        })
        .returning(['exam_id', 'user_id']);

      return newEnroll;
    } catch (error) {
      throw error;
    }
  }

  async attemp({ examId, userId }: AttempExamRequest) {
    try {
      await this.getById(examId);

      const [attemp] = await this.knex('exam_attemps')
        .update({
          started_at: new Date(),
        })
        .where({ exam_id: examId })
        .andWhere({ user_id: userId })
        .returning('*');

      return attemp;
    } catch (error) {
      throw error;
    }
  }

  async submit({ examId, attempId }: SubmitExamRequest) {
    try {
      await this.getById(examId);

      const answers = await this.knex('user_answers')
        .join('questions', 'user_answers.question_id', 'questions.id')
        .where('user_answers.exam_attemp_id', attempId)
        .select(
          'user_answers.id as answer_id',
          'answer',
          'correct_answer',
          'point',
          'type',
        );

      let totalScore = 0;
      const updates = [];

      for (const item of answers) {
        const obtainedScore = calculateScore(
          item.type,
          item.answer,
          item.correct_answer,
          item.point,
        );

        totalScore += obtainedScore;

        updates.push(
          this.knex('user_answers')
            .update({
              score_obtained: obtainedScore,
            })
            .where({
              id: item.answer_id,
            }),
        );
      }

      await Promise.all(updates);

      await this.knex('exam_attemps')
        .update({
          total_score: totalScore,
          finished_at: new Date(),
        })
        .where({ id: attempId });
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    const exam = await this.knex('exams').select('id').where({ id }).first();

    if (!exam) throw new BadRequestException('Invalid exam id');
    return exam;
  }
}
