import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ExamService } from './exam.service';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { Role } from 'src/commons/types/role.type';
import { CreateExamDto } from './dto/create-exam.dto';
import { Pagination } from 'src/commons/decorators/pagination.decorator';
import { PaginationParams } from 'src/commons/types/pagination.type';

@Controller('exam')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Post()
  @Auth([Role.ADMIN])
  async create(
    @GetCurrentUser('sub') creatorId: string,
    @Body() body: CreateExamDto,
  ) {
    return await this.examService.create({ creatorId, ...body });
  }

  @Post('enroll/:examId')
  @Auth([Role.PARTICIPANT])
  async enroll(
    @GetCurrentUser('sub') userId: string,
    @Param('examId') examId: string,
  ) {
    return await this.examService.enroll({ userId, examId });
  }

  @Get('enrolled')
  @Auth([Role.PARTICIPANT])
  async getEnrolled(
    @GetCurrentUser('sub') userId: string,
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
  ) {
    return await this.examService.getEnrolled({ userId, pagination, search });
  }

  @Post('attempt/:examId')
  @Auth([Role.PARTICIPANT])
  async attempt(
    @GetCurrentUser('sub') userId: string,
    @Param('examId') examId: string,
  ) {
    return this.examService.attempt({ userId, examId });
  }

  @Post(':examId/submit/:attemptId')
  @Auth([Role.PARTICIPANT])
  async submit(
    @Param('examId') examId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return await this.examService.submit({ examId, attemptId });
  }
}
