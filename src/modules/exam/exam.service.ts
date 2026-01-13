import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  CreateExamRequest,
  EnrollExamRequest,
  GetEnrollExams,
} from './interface';
import { responsePaginate } from 'src/commons/utils/pagination';

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
    const query = this.knex('exams')
      .join('exam_attemps', 'exams.id', 'exam_attemps.exam_id')
      .where({ user_id: userId })
      .select(['title', 'description', 'start_time', 'end_time', 'duration'])
      .orderBy('title', 'desc');

    if (search) {
      query.andWhere('title', 'ilike', `%${search}%`);
    }

    return responsePaginate(query, pagination);
  }

  async enroll({ examId, userId }: EnrollExamRequest) {
    try {
      const exam = await this.knex('exams')
        .select('id')
        .where({ id: examId })
        .first();

      if (!exam) throw new BadRequestException('Invalid exam id');

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
}
