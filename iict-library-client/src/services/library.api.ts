import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type {
  AnalyticsDashboard,
  Book,
  BookImage,
  FinePayment,
  FineTransactionSummary,
  FineUserSummary,
  InventoryAuditResultsPayload,
  InventoryAuditResultStatus,
  InventoryAuditSession,
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

export type PopularBook = Book & { loanCount?: number };

interface ImportSummary {
  rowsProcessed: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}

interface BookLookupResponse {
  book: Book;
  activeLoan?: Loan;
  reservationHold?: Reservation;
}

interface PaginatedLoansResponse {
  items: Loan[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface BulkAuditScanResult {
  added: number;
}

interface RecordFinePaymentResponse {
  payment: FinePayment;
  updatedTransaction: FineTransactionSummary;
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
    listPublicBooks: builder.query<PaginatedBooksResponse, { q?: string; page?: number; pageSize?: number } | undefined>({
      query: (params) => ({
        url: '/books/public',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedBooksResponse>) => response.data,
      providesTags: ['Books'],
    }),
    listRecentBooks: builder.query<Book[], { limit?: number } | undefined>({
      query: (params) => ({
        url: '/books/recent',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<Book[]>) => response.data,
      providesTags: ['Books'],
    }),
    listPopularBooks: builder.query<PopularBook[], { limit?: number } | undefined>({
      query: (params) => ({
        url: '/books/popular',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PopularBook[]>) => response.data,
      providesTags: ['Books'],
    }),
    listRecommendedBooks: builder.query<Book[], { limit?: number } | undefined>({
      query: (params) => ({
        url: '/books/recommended',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<Book[]>) => response.data,
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
    updateBook: builder.mutation<Book, { id: string; body: Partial<Book> }>({
      query: ({ id, body }) => ({
        url: `/books/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Book>) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Books', id: arg.id }, 'Books'],
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
    deleteBook: builder.mutation<{ id: string; title: string; accessionNumber: string }, string>({
      query: (id) => ({
        url: `/books/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ id: string; title: string; accessionNumber: string }>) => response.data,
      invalidatesTags: ['Books', 'Dashboard', 'Reservations'],
    }),
    uploadBookImages: builder.mutation<BookImage[], { bookId: string; files: File[] }>({
      query: ({ bookId, files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));

        return {
          url: `/books/${bookId}/images`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<BookImage[]>) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Books', id: arg.bookId }, 'Books', 'Dashboard'],
    }),
    deleteBookImage: builder.mutation<BookImage[], { bookId: string; imageId: string }>({
      query: ({ bookId, imageId }) => ({
        url: `/books/${bookId}/images/${imageId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<BookImage[]>) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Books', id: arg.bookId }, 'Books', 'Dashboard'],
    }),
    reorderBookImages: builder.mutation<BookImage[], { bookId: string; imageIds: string[]; primaryImageId?: string }>({
      query: ({ bookId, imageIds, primaryImageId }) => ({
        url: `/books/${bookId}/images/order`,
        method: 'PATCH',
        body: { imageIds, primaryImageId },
      }),
      transformResponse: (response: ApiResponse<BookImage[]>) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Books', id: arg.bookId }, 'Books', 'Dashboard'],
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

    issueLoan: builder.mutation<Loan, {
      bookId?: string;
      accessionNumber?: string;
      userId?: string;
      studentRegNumber?: string;
      teacherId?: string;
      dueAt?: string;
      facultySignatureText?: string;
      overrideReservation?: boolean;
      reservationOverrideReason?: string;
    }>({
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
    listMyLoanHistory: builder.query<Loan[], void>({
      query: () => '/loans/history/me',
      transformResponse: (response: ApiResponse<Loan[]>) => response.data,
      providesTags: ['Loans'],
    }),
    listLoans: builder.query<PaginatedLoansResponse, {
      status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
      overdue?: boolean;
      borrowerRole?: 'STUDENT' | 'TEACHER';
      q?: string;
      page?: number;
      pageSize?: number;
    } | undefined>({
      query: (params) => ({
        url: '/loans',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedLoansResponse>) => response.data,
      providesTags: ['Loans'],
    }),
    getLoanById: builder.query<Loan, string>({
      query: (id) => `/loans/${id}`,
      transformResponse: (response: ApiResponse<Loan>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Loans', id }],
    }),
    getBorrowerHistory: builder.query<Loan[], string>({
      query: (userId) => `/loans/borrowers/${userId}/history`,
      transformResponse: (response: ApiResponse<Loan[]>) => response.data,
      providesTags: ['Loans'],
    }),
    getBookCirculationHistory: builder.query<Loan[], string>({
      query: (bookId) => `/loans/books/${bookId}/history`,
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

    createInventoryAuditSession: builder.mutation<InventoryAuditSession, { title: string; notes?: string }>({
      query: (body) => ({
        url: '/inventory-audits/sessions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<InventoryAuditSession>) => response.data,
      invalidatesTags: ['InventoryAudit'],
    }),
    listInventoryAuditSessions: builder.query<InventoryAuditSession[], void>({
      query: () => '/inventory-audits/sessions',
      transformResponse: (response: ApiResponse<InventoryAuditSession[]>) => response.data,
      providesTags: ['InventoryAudit'],
    }),
    getInventoryAuditSession: builder.query<InventoryAuditSession, string>({
      query: (id) => `/inventory-audits/sessions/${id}`,
      transformResponse: (response: ApiResponse<InventoryAuditSession>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'InventoryAudit', id }],
    }),
    addInventoryAuditScan: builder.mutation<unknown, { sessionId: string; accessionNumber: string }>({
      query: ({ sessionId, accessionNumber }) => ({
        url: `/inventory-audits/sessions/${sessionId}/scans`,
        method: 'POST',
        body: { accessionNumber },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'InventoryAudit', id: arg.sessionId }, 'InventoryAudit'],
    }),
    bulkAddInventoryAuditScans: builder.mutation<BulkAuditScanResult, { sessionId: string; accessionNumbers: string[] }>({
      query: ({ sessionId, accessionNumbers }) => ({
        url: `/inventory-audits/sessions/${sessionId}/scans/bulk`,
        method: 'POST',
        body: { accessionNumbers },
      }),
      transformResponse: (response: ApiResponse<BulkAuditScanResult>) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'InventoryAudit', id: arg.sessionId }, 'InventoryAudit'],
    }),
    closeInventoryAuditSession: builder.mutation<InventoryAuditSession, string>({
      query: (id) => ({
        url: `/inventory-audits/sessions/${id}/close`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<InventoryAuditSession>) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: 'InventoryAudit', id }, 'InventoryAudit'],
    }),
    listInventoryAuditResults: builder.query<InventoryAuditResultsPayload, { sessionId: string; status?: InventoryAuditResultStatus }>(
      {
        query: ({ sessionId, status }) => ({
          url: `/inventory-audits/sessions/${sessionId}/results`,
          params: status ? { status } : {},
        }),
        transformResponse: (response: ApiResponse<InventoryAuditResultsPayload>) => response.data,
        providesTags: (_result, _error, arg) => [{ type: 'InventoryAudit', id: arg.sessionId }, 'InventoryAudit'],
      }
    ),

    getMyFineSummary: builder.query<FineUserSummary, void>({
      query: () => '/fines/me/summary',
      transformResponse: (response: ApiResponse<FineUserSummary>) => response.data,
      providesTags: ['Fines'],
    }),
    getFineSummaryForUser: builder.query<FineUserSummary, string>({
      query: (userId) => `/fines/users/${userId}/summary`,
      transformResponse: (response: ApiResponse<FineUserSummary>) => response.data,
      providesTags: (_result, _error, userId) => [{ type: 'Fines', id: userId }],
    }),
    getFineDetailsForTransaction: builder.query<FineTransactionSummary, string>({
      query: (loanId) => `/fines/transactions/${loanId}`,
      transformResponse: (response: ApiResponse<FineTransactionSummary>) => response.data,
      providesTags: (_result, _error, loanId) => [{ type: 'Fines', id: loanId }],
    }),
    listUnpaidFines: builder.query<FineTransactionSummary[], { q?: string; role?: 'STUDENT' | 'TEACHER' } | undefined>({
      query: (params) => ({
        url: '/fines/unpaid',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<FineTransactionSummary[]>) => response.data,
      providesTags: ['Fines'],
    }),
    recordFinePayment: builder.mutation<RecordFinePaymentResponse, { loanId: string; amount: number; paymentDate?: string; note?: string }>({
      query: (body) => ({
        url: '/fines/payments',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<RecordFinePaymentResponse>) => response.data,
      invalidatesTags: ['Fines'],
    }),
    getFinePaymentHistory: builder.query<FinePayment[], { userId?: string; loanId?: string } | undefined>({
      query: (params) => ({
        url: '/fines/payments/history',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<FinePayment[]>) => response.data,
      providesTags: ['Fines'],
    }),
  }),
});

export const {
  useListBooksQuery,
  useListPublicBooksQuery,
  useListRecentBooksQuery,
  useListPopularBooksQuery,
  useListRecommendedBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useSetBookArchiveStatusMutation,
  useDeleteBookMutation,
  useUploadBookImagesMutation,
  useDeleteBookImageMutation,
  useReorderBookImagesMutation,
  useCreateReservationMutation,
  useCancelMyReservationMutation,
  useListMyReservationsQuery,
  useListPendingReservationsQuery,
  useListBookReservationsQuery,
  useUpdateReservationStatusMutation,
  useIssueLoanMutation,
  useReturnLoanMutation,
  useListMyLoansQuery,
  useListMyLoanHistoryQuery,
  useListLoansQuery,
  useGetLoanByIdQuery,
  useGetBorrowerHistoryQuery,
  useGetBookCirculationHistoryQuery,
  useLookupByAccessionQuery,
  useGetPoliciesQuery,
  useUpdatePoliciesMutation,
  useImportBooksCsvMutation,
  useExportResourceCsvMutation,
  useGetAnalyticsDashboardQuery,
  useCreateInventoryAuditSessionMutation,
  useListInventoryAuditSessionsQuery,
  useGetInventoryAuditSessionQuery,
  useAddInventoryAuditScanMutation,
  useBulkAddInventoryAuditScansMutation,
  useCloseInventoryAuditSessionMutation,
  useListInventoryAuditResultsQuery,
  useGetMyFineSummaryQuery,
  useGetFineSummaryForUserQuery,
  useGetFineDetailsForTransactionQuery,
  useListUnpaidFinesQuery,
  useRecordFinePaymentMutation,
  useGetFinePaymentHistoryQuery,
} = libraryApi;
