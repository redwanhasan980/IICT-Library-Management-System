import { api } from '../config/api';
import type { OutsideBookEntry } from '../types/book.types';
import type { ApiResponse } from '../types/api.types';

export const outsideBookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOutsideBookEntry: builder.mutation<
      OutsideBookEntry,
      { title: string; author: string; studentRegNumber: string; department: string; currentSemester: number }
    >({
      query: (data) => ({
        url: '/outside-books',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<OutsideBookEntry>) => response.data,
      invalidatesTags: ['OutsideBooks'],
    }),
    getMyOutsideBookEntries: builder.query<OutsideBookEntry[], void>({
      query: () => '/outside-books/my-entries',
      transformResponse: (response: ApiResponse<OutsideBookEntry[]>) => response.data,
      providesTags: ['OutsideBooks'],
    }),
    getActiveOutsideBookEntries: builder.query<OutsideBookEntry[], void>({
      query: () => '/outside-books/active',
      transformResponse: (response: ApiResponse<OutsideBookEntry[]>) => response.data,
      providesTags: ['OutsideBooks'],
    }),
    getOutsideBookLogs: builder.query<
      { items: OutsideBookEntry[]; page: number; pageSize: number; total: number; totalPages: number },
      {
        q?: string;
        status?: 'ENTERED' | 'EXITED';
        verifiedEntry?: boolean;
        verifiedExit?: boolean;
        department?: string;
        studentRegNumber?: string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/outside-books',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<{ items: OutsideBookEntry[]; page: number; pageSize: number; total: number; totalPages: number }>) =>
        response.data,
      providesTags: ['OutsideBooks'],
    }),
    getOutsideBookEntryById: builder.query<OutsideBookEntry, string>({
      query: (id) => `/outside-books/${id}`,
      transformResponse: (response: ApiResponse<OutsideBookEntry>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'OutsideBooks', id }],
    }),
    markOutsideBookExit: builder.mutation<OutsideBookEntry, string>({
      query: (id) => ({
        url: `/outside-books/${id}/exit`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<OutsideBookEntry>) => response.data,
      invalidatesTags: ['OutsideBooks'],
    }),
    verifyOutsideBookEntry: builder.mutation<OutsideBookEntry, string>({
      query: (id) => ({
        url: `/outside-books/${id}/verify-entry`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<OutsideBookEntry>) => response.data,
      invalidatesTags: ['OutsideBooks'],
    }),
    verifyOutsideBookExit: builder.mutation<OutsideBookEntry, string>({
      query: (id) => ({
        url: `/outside-books/${id}/verify-exit`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<OutsideBookEntry>) => response.data,
      invalidatesTags: ['OutsideBooks'],
    }),
  }),
});

export const {
  useCreateOutsideBookEntryMutation,
  useGetMyOutsideBookEntriesQuery,
  useGetActiveOutsideBookEntriesQuery,
  useGetOutsideBookLogsQuery,
  useGetOutsideBookEntryByIdQuery,
  useMarkOutsideBookExitMutation,
  useVerifyOutsideBookEntryMutation,
  useVerifyOutsideBookExitMutation,
} = outsideBookApi;
