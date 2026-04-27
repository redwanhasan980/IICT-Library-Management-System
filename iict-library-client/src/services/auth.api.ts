import { api } from '../config/api';
import type { ApiResponse } from '../types/api.types';
import type { Role, User } from '../types/user.types';
import { logOut, setCredentials } from './auth.slice';

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, 'STUDENT' | 'TEACHER'>;
  studentRegNumber?: string;
  teacherId?: string;
  department: 'CSE' | 'SWE' | 'EEE';
  currentSemester?: number;
  designation?: string;
  signatureData?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // login error is surfaced to UI through RTK Query state
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // registration error is surfaced to UI through RTK Query state
        }
      },
    }),
    bootstrapAdmin: builder.mutation<AuthResponse, { setupToken: string; name: string; email: string; password: string }>({
      query: (body) => ({
        url: '/auth/bootstrap-admin',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // bootstrap error is surfaced to UI through RTK Query state
        }
      },
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['Users'],
    }),
    logout: builder.mutation<null, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<null>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
          dispatch(api.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useBootstrapAdminMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
