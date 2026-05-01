import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logOut } from '../services/auth.slice';

type ClientEnv = Record<string, string | boolean | undefined>;

const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_ONLINE_API_BASE_URL = 'https://iict-library-management-system-server.onrender.com/api';

const isTruthy = (value: string | boolean | undefined) =>
  value === true || ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());

const isLocalOrigin = (origin: string | undefined) =>
  !origin ||
  origin.startsWith('http://localhost') ||
  origin.startsWith('http://127.0.0.1') ||
  origin.startsWith('https://localhost') ||
  origin.startsWith('https://127.0.0.1');

const isLocalApiUrl = (value: string | undefined) =>
  Boolean(value?.includes('://localhost') || value?.includes('://127.0.0.1'));

const normalizeApiBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const getBrowserOrigin = () =>
  typeof window === 'undefined' ? undefined : window.location.origin;

export const selectApiBaseUrl = (env: ClientEnv, browserOrigin = getBrowserOrigin()) => {
  const onlineValue = env.ONLINE ?? env.VITE_ONLINE;
  const hasOnlineSwitch = onlineValue !== undefined;
  const selectedUrl = hasOnlineSwitch
    ? isTruthy(onlineValue)
      ? env.VITE_ONLINE_API_BASE_URL
      : env.VITE_LOCAL_API_BASE_URL
    : env.VITE_API_BASE_URL;
  const normalizedSelectedUrl = normalizeApiBaseUrl(typeof selectedUrl === 'string' ? selectedUrl : undefined);

  if (!isLocalOrigin(browserOrigin) && (!normalizedSelectedUrl || isLocalApiUrl(normalizedSelectedUrl))) {
    return normalizeApiBaseUrl(
      typeof env.VITE_ONLINE_API_BASE_URL === 'string' ? env.VITE_ONLINE_API_BASE_URL : DEFAULT_ONLINE_API_BASE_URL
    ) as string;
  }

  return normalizedSelectedUrl ?? DEFAULT_LOCAL_API_BASE_URL;
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
