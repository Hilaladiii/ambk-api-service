import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { Role } from 'src/commons/types/role.type';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Pagination } from 'src/commons/decorators/pagination.decorator';
import { PaginationParams } from 'src/commons/types/pagination.type';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get('exam/:examId')
  @Auth([Role.ADMIN])
  async getByExamId(
    @Pagination() pagination: PaginationParams,
    @Param('examId') examId: string,
  ) {
    return await this.questionService.getByExamId({ examId, pagination });
  }

  @Post()
  @Auth([Role.ADMIN])
  async create(@Body() body: CreateQuestionDto) {
    return await this.questionService.create({ ...body });
  }

  @Get(':id')
  @Auth([Role.ADMIN])
  async getById(@Param('id') id: string) {
    return await this.questionService.getById(id);
  }

  @Put(':id')
  @Auth([Role.ADMIN])
  async update(@Param('id') id: string, @Body() body: UpdateQuestionDto) {
    return await this.questionService.update(id, body);
  }

  @Delete(':id')
  @Auth([Role.ADMIN])
  async delete(@Param('id') id: string) {
    return await this.questionService.delete(id);
  }

  @Get('attempt/:attemptId')
  @Auth()
  async getByAttemptId(
    @Pagination() pagination: PaginationParams,
    @Param('attemptId') attemptId: string,
  ) {
    return await this.questionService.getByAttemptId({ attemptId, pagination });
  }

  @Post(':questionId/answer/:attemptId')
  @Auth([Role.PARTICIPANT])
  async answer(
    @Param('questionId') questionId: string,
    @Param('attemptId') attemptId: string,
    @Body() body: AnswerQuestionDto,
  ) {
    return await this.questionService.answer({
      attemptId,
      questionId,
      ...body,
    });
  }

  @Patch(':questionId/flag/:attemptId')
  @Auth([Role.PARTICIPANT])
  async toggleFlag(
    @Param('questionId') questionId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return await this.questionService.toggleFlag({ attemptId, questionId });
  }
}
