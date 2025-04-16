export interface IPagedResult<T> {
  pagesCount: number;
  currentPage: number;
  totalCount: number;
  resultCount: number;
  limit: number;
  data: T[];
}
