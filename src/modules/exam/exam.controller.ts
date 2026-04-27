import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { Role } from 'src/commons/types/role.type';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Pagination } from 'src/commons/decorators/pagination.decorator';
import { PaginationParams } from 'src/commons/types/pagination.type';

@Controller('exams')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Get()
  @Auth([Role.ADMIN])
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
  ) {
    return await this.examService.findAll(pagination, search);
  }

  @Get('history')
  @Auth([Role.PARTICIPANT])
  async getMyHistory(
    @GetCurrentUser('sub') userId: string,
    @Pagination() pagination: PaginationParams,
  ) {
    return await this.examService.getMyHistory(userId, pagination);
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

  @Get(':id')
  @Auth([Role.ADMIN])
  async getByIdDetail(@Param('id') id: string) {
    return await this.examService.getByIdDetail(id);
  }

  @Get(':id/attempts')
  @Auth([Role.ADMIN])
  async getAttempts(
    @Param('id') id: string,
    @Pagination() pagination: PaginationParams,
  ) {
    return await this.examService.getAttempts(id, pagination);
  }

  @Post()
  @Auth([Role.ADMIN])
  async create(
    @GetCurrentUser('sub') creatorId: string,
    @Body() body: CreateExamDto,
  ) {
    return await this.examService.create({ creatorId, ...body });
  }

  @Put(':id')
  @Auth([Role.ADMIN])
  async update(@Param('id') id: string, @Body() body: UpdateExamDto) {
    return await this.examService.update(id, body);
  }

  @Delete(':id')
  @Auth([Role.ADMIN])
  async delete(@Param('id') id: string) {
    return await this.examService.delete(id);
  }

  @Post('enroll/:examId')
  @Auth([Role.PARTICIPANT])
  async enroll(
    @GetCurrentUser('sub') userId: string,
    @Param('examId') examId: string,
  ) {
    return await this.examService.enroll({ userId, examId });
  }

  @Post('enroll-by-code')
  @Auth([Role.PARTICIPANT])
  async enrollByCode(
    @GetCurrentUser('sub') userId: string,
    @Body('code') code: string,
  ) {
    return await this.examService.enrollByCode({ userId, code });
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

  @Get('attempt/:attemptId/detail')
  @Auth([Role.PARTICIPANT])
  async getAttemptDetail(@Param('attemptId') attemptId: string) {
    return await this.examService.getAttemptDetail(attemptId);
  }
}
