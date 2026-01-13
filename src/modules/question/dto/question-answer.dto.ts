import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../interface';
import { Type } from 'class-transformer';

export class MultipleChoiceAnswer {
  type: QuestionType.MULTIPLE;

  @IsNotEmpty()
  @IsString()
  key: string;
}

export class TrueFalseAnswer {
  type: QuestionType.TRUE_FALSE;

  @IsNotEmpty()
  @IsBoolean()
  value: boolean;
}

class MatchingPair {
  @IsNotEmpty()
  @IsString()
  left: string;

  @IsNotEmpty()
  @IsString()
  right: string;
}

export class MatchingAnswer {
  type: QuestionType.MATCHING;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MatchingPair)
  pairs: MatchingPair[];
}

export class EssayAnswer {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  modelAnswer?: string;
}
