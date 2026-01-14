
import { Knex } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface Tables {
      'exam_attempt_questions': {
        id: string;
        attempt_id: string | null;
        question_id: string | null;
        sort_order: number;
        is_flagged: boolean | null;
      };
      'exam_attempts': {
        id: string;
        exam_id: string | null;
        user_id: string | null;
        started_at: Date | null;
        finished_at: Date | null;
        total_score: number | null;
      };
      'exams': {
        id: string;
        title: string | null;
        description: string | null;
        created_by: string | null;
        start_time: Date | null;
        end_time: Date | null;
        duration: number | null;
        is_published: boolean | null;
        code: string | null;
      };
      'questions': {
        id: string;
        exam_id: string | null;
        type: string | null;
        question: string | null;
        point: number | null;
        structure: any | null;
        correct_answer: any | null;
      };
      'user_answers': {
        id: string;
        attempt_id: string | null;
        question_id: string | null;
        answer: any | null;
        score_obtained: number | null;
        feedback: string | null;
      };
      'users': {
        id: string;
        username: string | null;
        email: string | null;
        password: string | null;
        created_at: Date;
        updated_at: Date;
        role: string | null;
      };
    }
  }
}
