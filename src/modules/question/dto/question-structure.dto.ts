import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { QuestionType } from '../interface';
import { Type } from 'class-transformer';

export class MultipleChoiceStructure {
  type: QuestionType.MULTIPLE;

  @IsArray()
  @ValidateNested({ each: true })
  options: {
    key: string;
    value: string;
  }[];
}

export class MatchingStructure {
  type: QuestionType.MATCHING;

  @IsArray()
  @ValidateNested({ each: true })
  items: {
    left: string;
    right: string;
  }[];
}

export class EssayStructure {
  type: QuestionType.ESSAY;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minWords?: number;
}

export class TrueFalseStructure {
  type: QuestionType.TRUE_FALSE;
}
