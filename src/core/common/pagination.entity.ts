export interface TPaginationQuery {
  pageSize?: number;
  pageNumber?: number;
}

export interface TPaginationResponse<T> {
  data: T[];
  meta: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
  };
}
