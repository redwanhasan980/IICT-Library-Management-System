import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { LoanStatus } from '../types/book.types';
import type {
  AuditLogReport,
  CatalogInventoryReport,
  IssuedBookReport,
  LoanLifecycleReport,
  OutsideBookReport,
  ProcurementSummaryReport,
} from '../types/report.types';
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
    getReturnedBooksReport: builder.query<
      LoanLifecycleReport,
      {
        from?: string;
        to?: string;
        borrowerRole?: Role;
        q?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/returned-books',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<LoanLifecycleReport>) => response.data,
      providesTags: ['Reports'],
    }),
    getOverdueLoansReport: builder.query<
      LoanLifecycleReport,
      {
        from?: string;
        to?: string;
        borrowerRole?: Role;
        q?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/overdue-loans',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<LoanLifecycleReport>) => response.data,
      providesTags: ['Reports'],
    }),
    getOutsideBooksReport: builder.query<
      OutsideBookReport,
      {
        from?: string;
        to?: string;
        status?: 'ALL' | 'ENTERED' | 'EXITED';
        department?: 'CSE' | 'SWE' | 'EEE';
        q?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/outside-books',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<OutsideBookReport>) => response.data,
      providesTags: ['Reports'],
    }),
    getCatalogInventoryReport: builder.query<
      CatalogInventoryReport,
      {
        q?: string;
        department?: 'CSE' | 'SWE' | 'EEE';
        includeArchived?: boolean;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/catalog-inventory',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<CatalogInventoryReport>) => response.data,
      providesTags: ['Reports'],
    }),
    getProcurementSummaryReport: builder.query<
      ProcurementSummaryReport,
      {
        q?: string;
        procurementStatus?: 'NOT_STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
        shelvingStatus?: 'PENDING' | 'IN_PROGRESS' | 'SHELVED';
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/procurement-summary',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<ProcurementSummaryReport>) => response.data,
      providesTags: ['Reports'],
    }),
    getAuditLogReport: builder.query<
      AuditLogReport,
      {
        q?: string;
        actorId?: string;
        action?: string;
        entityType?: string;
        entityId?: string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/reports/audit-logs',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<AuditLogReport>) => response.data,
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetIssuedBooksReportQuery,
  useGetReturnedBooksReportQuery,
  useGetOverdueLoansReportQuery,
  useGetOutsideBooksReportQuery,
  useGetCatalogInventoryReportQuery,
  useGetProcurementSummaryReportQuery,
  useGetAuditLogReportQuery,
} = reportApi;
