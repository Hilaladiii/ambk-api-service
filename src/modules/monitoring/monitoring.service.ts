import { Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';

@Injectable()
export class MonitoringService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async logActivity(attemptId: string, eventType: 'FOCUS' | 'UNFOCUS') {
    return this.knex('exam_attempt_activities').insert({
      attempt_id: attemptId,
      event_type: eventType,
    });
  }

  async markAsCheated(attemptId: string) {
    return this.knex('exam_attempts')
      .where({ id: attemptId })
      .update({ is_cheated: true });
  }
}
