export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export const paginate = (page?: number, limit?: number): PaginationResult => {
  const currentPage = page && page > 0 ? page : 1;

  const currentLimit = limit && limit > 0 ? limit : 10;

  return {
    page: currentPage,
    limit: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  };
};
