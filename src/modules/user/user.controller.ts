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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { Role } from 'src/commons/types/role.type';
import { Pagination } from 'src/commons/decorators/pagination.decorator';
import { PaginationParams } from 'src/commons/types/pagination.type';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async create(@Body() body: CreateUserDto) {
    return await this.userService.create({ ...body });
  }

  @Get('me')
  @Auth()
  async getMe(@GetCurrentUser('sub') userId: string) {
    return await this.userService.get(userId);
  }

  @Put('me')
  @Auth()
  async updateMe(
    @GetCurrentUser('sub') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.update(userId, body);
  }

  @Get()
  @Auth([Role.ADMIN])
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
  ) {
    return await this.userService.findAll(pagination, search);
  }

  @Delete(':id')
  @Auth([Role.ADMIN])
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
