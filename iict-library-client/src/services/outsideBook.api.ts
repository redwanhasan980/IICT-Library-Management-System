import { api } from '../config/api';
import type { OutsideBookEntry } from '../types/book.types';
import type { ApiResponse } from '../types/api.types';

export const outsideBookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOutsideBookEntry: builder.mutation<OutsideBookEntry, { title: string; author: string }>({
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
  useVerifyOutsideBookEntryMutation,
  useVerifyOutsideBookExitMutation,
} = outsideBookApi;
