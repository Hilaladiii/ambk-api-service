import { Knex } from 'knex';
import { PaginatedResponse, PaginationParams } from '../types/pagination.type';

export function calculatePagination(
  page: string | number,
  per_page: string | number,
): PaginationParams {
  const currentPage = parseInt(String(page || 1), 10);
  const itemsPerPage = parseInt(String(per_page || 10), 10);

  const safePage = currentPage < 1 ? 1 : currentPage;
  const safePerPage = itemsPerPage < 1 ? 10 : itemsPerPage;

  const skip = (safePage - 1) * safePerPage;

  return { currentPage: safePage, itemsPerPage: safePerPage, skip };
}

export async function responsePaginate<T>(
  queryBuilder: Knex.QueryBuilder,
  pagination: PaginationParams,
): Promise<PaginatedResponse<T>> {
  const countQuery = queryBuilder
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as total')
    .first();

  const itemsQuery = queryBuilder
    .offset(pagination.skip)
    .limit(pagination.itemsPerPage);

  const [totalResult, items] = await Promise.all([countQuery, itemsQuery]);

  const total = parseInt(totalResult?.total || '0', 10);
  const totalPage = Math.ceil(total / pagination.itemsPerPage);

  return {
    items: items as T[],
    meta: {
      page: pagination.currentPage,
      per_page: pagination.itemsPerPage,
      total,
      total_page: totalPage,
    },
  };
}
