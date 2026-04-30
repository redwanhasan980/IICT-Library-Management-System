import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logOut } from '../services/auth.slice';

type ClientEnv = Record<string, string | boolean | undefined>;

const isTruthy = (value: string | boolean | undefined) =>
  value === true || ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());

const normalizeApiBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

export const selectApiBaseUrl = (env: ClientEnv) => {
  const onlineValue = env.ONLINE ?? env.VITE_ONLINE;
  const hasOnlineSwitch = onlineValue !== undefined;
  const selectedUrl = hasOnlineSwitch
    ? isTruthy(onlineValue)
      ? env.VITE_ONLINE_API_BASE_URL
      : env.VITE_LOCAL_API_BASE_URL
    : env.VITE_API_BASE_URL;

  return normalizeApiBaseUrl(typeof selectedUrl === 'string' ? selectedUrl : undefined) ?? 'http://localhost:5000/api';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: selectApiBaseUrl(import.meta.env),
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const user = state.auth.user;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    if (import.meta.env.VITE_ENABLE_DEV_AUTH === 'true' && user?.id) {
      headers.set('x-user-id', user.id);
    }

    if (import.meta.env.VITE_ENABLE_DEV_AUTH === 'true' && user?.role) {
      headers.set('x-user-role', user.role);
    }

    return headers;
  },
});

const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const state = api.getState() as RootState;

  if (result.error?.status === 401 && state.auth.token) {
    api.dispatch(logOut());
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['OutsideBooks', 'SpineLabel', 'Books', 'Reservations', 'Loans', 'Policies', 'Analytics', 'InventoryAudit', 'Fines', 'Users', 'Procurement', 'Reports', 'AuditLogs', 'Dashboard'],
  endpoints: () => ({}),
});
