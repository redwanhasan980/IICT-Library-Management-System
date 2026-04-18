import { api } from '../config/api';
import { OutsideBookEntry } from '../types/book.types';

export const outsideBookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOutsideBookEntry: builder.mutation<OutsideBookEntry, { title: string; author: string }>({
      query: (data) => ({
        url: '/outside-books',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OutsideBooks'],
    }),
    getMyOutsideBookEntries: builder.query<OutsideBookEntry[], void>({
      query: () => '/outside-books/my-entries',
      providesTags: ['OutsideBooks'],
    }),
    getActiveOutsideBookEntries: builder.query<OutsideBookEntry[], void>({
      query: () => '/outside-books/active',
      providesTags: ['OutsideBooks'],
    }),
    verifyOutsideBookEntry: builder.mutation<OutsideBookEntry, string>({
      query: (id) => ({
        url: `/outside-books/${id}/verify-entry`,
        method: 'PATCH',
      }),
      invalidatesTags: ['OutsideBooks'],
    }),
    verifyOutsideBookExit: builder.mutation<OutsideBookEntry, string>({
      query: (id) => ({
        url: `/outside-books/${id}/verify-exit`,
        method: 'PATCH',
      }),
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
