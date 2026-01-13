import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { calculatePagination } from '../utils/pagination';
import { PaginationParams } from '../types/pagination.type';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const page = query?.page;
    const perPage = query?.per_page;

    return calculatePagination(page, perPage);
  },
);
