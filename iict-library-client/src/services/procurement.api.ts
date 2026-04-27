import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type {
  BookRequisition,
  Department,
  PaginatedProcurementResponse,
  ProcurementApplication,
  ProcurementOrder,
  ProcurementStatus,
  ProcurementSummary,
  ShelvingStatus,
  Vendor,
} from '../types/procurement.types';

export interface ApplicationPayload {
  applicationCode: string;
  budgetYear: number;
  allocatedBudget: number;
  department: Department;
}

export interface RequisitionPayload {
  requisitionCode: string;
  applicationId: string;
  bookTitle: string;
  authorName: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  quantity: number;
  pricePerUnit?: number;
  totalPrice?: number;
}

export interface VendorPayload {
  vendorCode: string;
  vendorName: string;
  quotationDetails?: string;
}

export interface ProcurementPayload {
  procurementCode: string;
  requisitionId: string;
  vendorId: string;
  procurementApprovalDate?: string;
  deliveryDate?: string;
  handoverDateToIICT?: string;
  bookReceivingRecord?: string;
  shelvingStatus?: ShelvingStatus;
  procurementStatus?: ProcurementStatus;
}

export const procurementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProcurementSummary: builder.query<ProcurementSummary, void>({
      query: () => '/procurements/summary',
      transformResponse: (response: ApiResponse<ProcurementSummary>) => response.data,
      providesTags: ['Procurement'],
    }),
    listProcurementApplications: builder.query<
      PaginatedProcurementResponse<ProcurementApplication>,
      { q?: string; department?: Department; budgetYear?: number; page?: number; pageSize?: number } | undefined
    >({
      query: (params) => ({
        url: '/procurements/applications',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedProcurementResponse<ProcurementApplication>>) => response.data,
      providesTags: ['Procurement'],
    }),
    createProcurementApplication: builder.mutation<ProcurementApplication, ApplicationPayload>({
      query: (body) => ({
        url: '/procurements/applications',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ProcurementApplication>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    updateProcurementApplication: builder.mutation<ProcurementApplication, { id: string; body: Partial<ApplicationPayload> }>({
      query: ({ id, body }) => ({
        url: `/procurements/applications/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<ProcurementApplication>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    listBookRequisitions: builder.query<
      PaginatedProcurementResponse<BookRequisition>,
      { q?: string; applicationId?: string; page?: number; pageSize?: number } | undefined
    >({
      query: (params) => ({
        url: '/procurements/requisitions',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedProcurementResponse<BookRequisition>>) => response.data,
      providesTags: ['Procurement'],
    }),
    createBookRequisition: builder.mutation<BookRequisition, RequisitionPayload>({
      query: (body) => ({
        url: '/procurements/requisitions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BookRequisition>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    updateBookRequisition: builder.mutation<BookRequisition, { id: string; body: Partial<RequisitionPayload> }>({
      query: ({ id, body }) => ({
        url: `/procurements/requisitions/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<BookRequisition>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    listVendors: builder.query<PaginatedProcurementResponse<Vendor>, { q?: string; page?: number; pageSize?: number } | undefined>({
      query: (params) => ({
        url: '/procurements/vendors',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedProcurementResponse<Vendor>>) => response.data,
      providesTags: ['Procurement'],
    }),
    createVendor: builder.mutation<Vendor, VendorPayload>({
      query: (body) => ({
        url: '/procurements/vendors',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Vendor>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    updateVendor: builder.mutation<Vendor, { id: string; body: Partial<VendorPayload> }>({
      query: ({ id, body }) => ({
        url: `/procurements/vendors/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Vendor>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    listProcurementOrders: builder.query<
      PaginatedProcurementResponse<ProcurementOrder>,
      {
        q?: string;
        requisitionId?: string;
        vendorId?: string;
        procurementStatus?: ProcurementStatus;
        shelvingStatus?: ShelvingStatus;
        page?: number;
        pageSize?: number;
      } | undefined
    >({
      query: (params) => ({
        url: '/procurements/orders',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedProcurementResponse<ProcurementOrder>>) => response.data,
      providesTags: ['Procurement'],
    }),
    createProcurementOrder: builder.mutation<ProcurementOrder, ProcurementPayload>({
      query: (body) => ({
        url: '/procurements/orders',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ProcurementOrder>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
    updateProcurementOrder: builder.mutation<ProcurementOrder, { id: string; body: Partial<ProcurementPayload> }>({
      query: ({ id, body }) => ({
        url: `/procurements/orders/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<ProcurementOrder>) => response.data,
      invalidatesTags: ['Procurement'],
    }),
  }),
});

export const {
  useGetProcurementSummaryQuery,
  useListProcurementApplicationsQuery,
  useCreateProcurementApplicationMutation,
  useUpdateProcurementApplicationMutation,
  useListBookRequisitionsQuery,
  useCreateBookRequisitionMutation,
  useUpdateBookRequisitionMutation,
  useListVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useListProcurementOrdersQuery,
  useCreateProcurementOrderMutation,
  useUpdateProcurementOrderMutation,
} = procurementApi;
