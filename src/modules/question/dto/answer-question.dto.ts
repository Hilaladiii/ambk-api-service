import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import {
  EssayAnswer,
  MatchingAnswer,
  MultipleChoiceAnswer,
  TrueFalseAnswer,
} from './question-answer.dto';
import { QuestionType } from '../interface';

export class AnswerQuestionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: MultipleChoiceAnswer, name: QuestionType.MULTIPLE },
        { value: MatchingAnswer, name: QuestionType.MATCHING },
        { value: EssayAnswer, name: QuestionType.ESSAY },
        { value: TrueFalseAnswer, name: QuestionType.TRUE_FALSE },
      ],
    },
  })
  answer: MultipleChoiceAnswer | MatchingAnswer | EssayAnswer | TrueFalseAnswer;
}
