import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['OutsideBooks', 'SpineLabel', 'Books', 'Reservations', 'Loans', 'Policies', 'Analytics', 'InventoryAudit', 'Fines', 'Users', 'Procurement'],
  endpoints: () => ({}),
});
