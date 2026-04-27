import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { LoanStatus } from '../types/book.types';
import type { IssuedBookReport } from '../types/report.types';
import type { Role } from '../types/user.types';

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIssuedBooksReport: builder.query<
      IssuedBookReport,
      {
        from?: string;
        to?: string;
        status?: LoanStatus | 'ALL';
        borrowerRole?: Role;
        q?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/issued-books',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<IssuedBookReport>) => response.data,
      providesTags: ['Reports'],
    }),
  }),
});

export const { useGetIssuedBooksReportQuery } = reportApi;
