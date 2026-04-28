import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { AuditLogList } from '../types/audit.types';

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAuditLogs: builder.query<
      AuditLogList,
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
        url: '/audit-logs',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<AuditLogList>) => response.data,
      providesTags: ['AuditLogs'],
    }),
  }),
});

export const { useListAuditLogsQuery } = auditApi;
