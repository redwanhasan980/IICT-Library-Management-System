import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { Role, User } from '../types/user.types';

interface PaginatedUsersResponse {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
  studentRegNumber?: string;
  teacherId?: string;
  department?: 'CSE' | 'SWE' | 'EEE';
  currentSemester?: number;
  designation?: string;
  signatureData?: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<PaginatedUsersResponse, { q?: string; role?: Role; isActive?: boolean; page?: number; pageSize?: number } | undefined>({
      query: (params) => ({
        url: '/users',
        params: params ?? {},
      }),
      transformResponse: (response: ApiResponse<PaginatedUsersResponse>) => response.data,
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<User, Required<Pick<UserPayload, 'name' | 'email' | 'password' | 'role'>> & UserPayload>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<User, { id: string; body: UserPayload }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['Users'],
    }),
    setUserActiveStatus: builder.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSetUserActiveStatusMutation,
} = userApi;
