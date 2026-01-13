export interface PaginationParams {
  currentPage: number;
  itemsPerPage: number;
  skip: number;
}

export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
  total_page: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}
