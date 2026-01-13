import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { Role } from 'src/commons/types/role.type';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Pagination } from 'src/commons/decorators/pagination.decorator';
import { PaginationParams } from 'src/commons/types/pagination.type';

@Controller('question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  @Auth([Role.ADMIN])
  async create(@Body() body: CreateQuestionDto) {
    return await this.questionService.create({ ...body });
  }

  @Get(':examId')
  @Auth()
  async getByExamId(
    @Pagination() pagination: PaginationParams,
    @Param('examId') examId: string,
  ) {
    return await this.questionService.getByExamId({ examId, pagination });
  }
}
