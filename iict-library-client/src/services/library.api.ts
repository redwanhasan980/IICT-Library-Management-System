import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type {
  AnalyticsDashboard,
  Book,
  Loan,
  Reservation,
  ReservationStatus,
  SystemSetting,
} from '../types/book.types';

interface PaginatedBooksResponse {
  items: Book[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ImportSummary {
  rowsProcessed: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}

interface BookLookupResponse {
  book: Book;
  activeLoan?: Loan;
}

export const libraryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listBooks: builder.query<PaginatedBooksResponse, { q?: string; includeArchived?: boolean; page?: number; pageSize?: number } | undefined>({
      query: (params) => ({
        url: '/books',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedBooksResponse>) => response.data,
      providesTags: ['Books'],
    }),
    getBookById: builder.query<Book & { reservations?: Reservation[] }, string>({
      query: (id) => `/books/${id}`,
      transformResponse: (response: ApiResponse<Book & { reservations?: Reservation[] }>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Books', id }],
    }),
    createBook: builder.mutation<Book, Partial<Book>>({
      query: (body) => ({
        url: '/books',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Book>) => response.data,
      invalidatesTags: ['Books'],
    }),
    setBookArchiveStatus: builder.mutation<Book, { id: string; isArchived: boolean }>({
      query: ({ id, isArchived }) => ({
        url: `/books/${id}/archive`,
        method: 'PATCH',
        body: { isArchived },
      }),
      transformResponse: (response: ApiResponse<Book>) => response.data,
      invalidatesTags: ['Books'],
    }),

    createReservation: builder.mutation<Reservation, { bookId: string }>({
      query: (body) => ({
        url: '/reservations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Reservation>) => response.data,
      invalidatesTags: ['Reservations', 'Books'],
    }),
    cancelMyReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/reservations/${id}/cancel`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<Reservation>) => response.data,
      invalidatesTags: ['Reservations', 'Books'],
    }),
    listMyReservations: builder.query<Reservation[], void>({
      query: () => '/reservations/my',
      transformResponse: (response: ApiResponse<Reservation[]>) => response.data,
      providesTags: ['Reservations'],
    }),
    listPendingReservations: builder.query<Reservation[], void>({
      query: () => '/reservations/pending',
      transformResponse: (response: ApiResponse<Reservation[]>) => response.data,
      providesTags: ['Reservations'],
    }),
    listBookReservations: builder.query<Reservation[], string>({
      query: (bookId) => `/reservations/book/${bookId}`,
      transformResponse: (response: ApiResponse<Reservation[]>) => response.data,
      providesTags: ['Reservations'],
    }),
    updateReservationStatus: builder.mutation<Reservation, { id: string; status: ReservationStatus }>({
      query: ({ id, status }) => ({
        url: `/reservations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<Reservation>) => response.data,
      invalidatesTags: ['Reservations', 'Books'],
    }),

    issueLoan: builder.mutation<Loan, { bookId: string; userId: string; dueAt?: string }>({
      query: (body) => ({
        url: '/loans/issue',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Loan>) => response.data,
      invalidatesTags: ['Loans', 'Books', 'Reservations'],
    }),
    returnLoan: builder.mutation<Loan, string>({
      query: (id) => ({
        url: `/loans/${id}/return`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<Loan>) => response.data,
      invalidatesTags: ['Loans', 'Books', 'Reservations'],
    }),
    listMyLoans: builder.query<Loan[], void>({
      query: () => '/loans/my',
      transformResponse: (response: ApiResponse<Loan[]>) => response.data,
      providesTags: ['Loans'],
    }),
    lookupByAccession: builder.query<BookLookupResponse, string>({
      query: (accessionNumber) => `/loans/lookup/${encodeURIComponent(accessionNumber)}`,
      transformResponse: (response: ApiResponse<BookLookupResponse>) => response.data,
      providesTags: ['Loans', 'Books'],
    }),

    getPolicies: builder.query<SystemSetting, void>({
      query: () => '/policies',
      transformResponse: (response: ApiResponse<SystemSetting>) => response.data,
      providesTags: ['Policies'],
    }),
    updatePolicies: builder.mutation<SystemSetting, Partial<SystemSetting>>({
      query: (body) => ({
        url: '/policies',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<SystemSetting>) => response.data,
      invalidatesTags: ['Policies'],
    }),

    importBooksCsv: builder.mutation<ImportSummary, { csv: string }>({
      query: (body) => ({
        url: '/admin/tools/import/books',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ImportSummary>) => response.data,
      invalidatesTags: ['Books'],
    }),
    exportResourceCsv: builder.mutation<string, 'books' | 'loans' | 'outside-books' | 'members'>({
      query: (resource) => ({
        url: `/admin/tools/export/${resource}`,
        method: 'GET',
        responseHandler: 'text',
      }),
      transformResponse: (response: string) => response,
    }),

    getAnalyticsDashboard: builder.query<AnalyticsDashboard, { from?: string; to?: string } | undefined>({
      query: (params) => ({
        url: '/analytics/dashboard',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<AnalyticsDashboard>) => response.data,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useListBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useSetBookArchiveStatusMutation,
  useCreateReservationMutation,
  useCancelMyReservationMutation,
  useListMyReservationsQuery,
  useListPendingReservationsQuery,
  useListBookReservationsQuery,
  useUpdateReservationStatusMutation,
  useIssueLoanMutation,
  useReturnLoanMutation,
  useListMyLoansQuery,
  useLookupByAccessionQuery,
  useGetPoliciesQuery,
  useUpdatePoliciesMutation,
  useImportBooksCsvMutation,
  useExportResourceCsvMutation,
  useGetAnalyticsDashboardQuery,
} = libraryApi;
