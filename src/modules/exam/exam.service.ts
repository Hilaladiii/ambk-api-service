import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import {
  AttemptExamRequest,
  CreateExamRequest,
  EnrollExamRequest,
  GetEnrollExams,
  SubmitExamRequest,
  UpdateExamRequest,
} from './interface';
import { responsePaginate } from 'src/commons/utils/pagination';
import { calculateScore } from 'src/commons/utils/calculate-score';
import { PaginationParams } from 'src/commons/types/pagination.type';

@Injectable()
export class ExamService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async findAll(pagination: PaginationParams, search?: string) {
    try {
      const query = this.knex('exams')
        .select(
          'id',
          'title',
          'code',
          'duration',
          'start_time',
          'end_time',
          'is_published',
        )
        .orderBy('start_time', 'desc');

      if (search) {
        query.where('title', 'ilike', `%${search}%`);
      }

      return responsePaginate(query, pagination);
    } catch (error) {
      throw error;
    }
  }

  async getByIdDetail(id: string) {
    try {
      const exam = await this.knex('exams').select('*').where({ id }).first();

      if (!exam) throw new NotFoundException('Exam not found');
      return exam;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: UpdateExamRequest) {
    try {
      const exam = await this.getById(id);

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.code !== undefined) updateData.code = data.code;
      if (data.startTime !== undefined) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.isPublished !== undefined)
        updateData.is_published = data.isPublished;

      if (Object.keys(updateData).length > 0) {
        await this.knex('exams').update(updateData).where({ id });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.knex('exams').where({ id }).del();
      if (!deleted) throw new NotFoundException('Exam not found');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getAttempts(examId: string, pagination: PaginationParams) {
    try {
      const query = this.knex('exam_attempts')
        .join('users', 'exam_attempts.user_id', 'users.id')
        .where('exam_attempts.exam_id', examId)
        .select(
          'exam_attempts.id',
          'users.username',
          'users.email',
          'exam_attempts.started_at',
          'exam_attempts.finished_at',
          'exam_attempts.total_score',
        )
        .orderBy('exam_attempts.started_at', 'desc');

      return responsePaginate(query, pagination);
    } catch (error) {
      throw error;
    }
  }

  async getMyHistory(userId: string, pagination: PaginationParams) {
    try {
      const query = this.knex('exam_attempts')
        .join('exams', 'exam_attempts.exam_id', 'exams.id')
        .where('exam_attempts.user_id', userId)
        .whereNotNull('exam_attempts.finished_at')
        .select(
          'exam_attempts.id',
          'exams.title',
          'exams.code',
          'exam_attempts.started_at',
          'exam_attempts.finished_at',
          'exam_attempts.total_score',
        )
        .orderBy('exam_attempts.finished_at', 'desc');

      return responsePaginate(query, pagination);
    } catch (error) {
      throw error;
    }
  }

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
        .join('exam_attempts', 'exams.id', 'exam_attempts.exam_id')
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

      const [newEnroll] = await this.knex('exam_attempts')
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

  async attempt({ examId, userId }: AttemptExamRequest) {
    try {
      await this.getById(examId);

      return this.knex.transaction(async (trx) => {
        const [attempt] = await trx('exam_attempts')
          .insert({
            user_id: userId,
            exam_id: examId,
            started_at: new Date(),
          })
          .returning('*');

        const questions = await trx('questions')
          .select('id')
          .where('exam_id', examId);

        const shuffledQuestions = this.shuffleArray(questions);
        const mappingPayload = shuffledQuestions.map((q, index) => ({
          attempt_id: attempt.id,
          question_id: q.id,
          sort_order: index + 1,
        }));

        await trx('exam_attempt_questions').insert(mappingPayload);
      });
    } catch (error) {
      throw error;
    }
  }

  async submit({ examId, attemptId }: SubmitExamRequest) {
    try {
      await this.getById(examId);

      const answers = await this.knex('user_answers')
        .join('questions', 'user_answers.question_id', 'questions.id')
        .where('user_answers.exam_attempt_id', attemptId)
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

      await this.knex('exam_attempts')
        .update({
          total_score: totalScore,
          finished_at: new Date(),
        })
        .where({ id: attemptId });
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    const exam = await this.knex('exams').select('id').where({ id }).first();

    if (!exam) throw new BadRequestException('Invalid exam id');
    return exam;
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
