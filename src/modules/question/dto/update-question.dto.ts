import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
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

export class UpdateQuestionDto {
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  point?: number;

  @IsOptional()
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
  structure?:
    | MultipleChoiceStructure
    | EssayStructure
    | MatchingStructure
    | TrueFalseStructure;

  @IsOptional()
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
  correctAnswer?:
    | MultipleChoiceAnswer
    | MatchingAnswer
    | EssayAnswer
    | TrueFalseAnswer;
}
