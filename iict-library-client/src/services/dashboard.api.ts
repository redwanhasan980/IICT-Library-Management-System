import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { DashboardSummary, HomeDashboardData } from '../types/dashboard.types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardHome: builder.query<HomeDashboardData, void>({
      query: () => '/dashboard/home',
      transformResponse: (response: ApiResponse<HomeDashboardData>) => response.data,
      providesTags: ['Dashboard'],
    }),
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      transformResponse: (response: ApiResponse<DashboardSummary>) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardHomeQuery, useGetDashboardSummaryQuery } = dashboardApi;
