import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../interface';
import { Type } from 'class-transformer';
import {
  MultipleChoiceStructure,
  EssayStructure,
  MatchingStructure,
  TrueFalseStructure,
} from './question-structure.dto';
import {
  EssayAnswer,
  MatchingAnswer,
  MultipleChoiceAnswer,
  TrueFalseAnswer,
} from './question-answer.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  examId: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  point: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: MultipleChoiceStructure, name: QuestionType.MULTIPLE },
        { value: MatchingStructure, name: QuestionType.MATCHING },
        { value: EssayStructure, name: QuestionType.ESSAY },
        { value: TrueFalseStructure, name: QuestionType.TRUE_FALSE },
      ],
    },
  })
  structure:
    | MultipleChoiceStructure
    | EssayStructure
    | MatchingStructure
    | TrueFalseStructure;

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
  correctAnswer:
    | MultipleChoiceAnswer
    | MatchingAnswer
    | EssayAnswer
    | TrueFalseAnswer;
}
