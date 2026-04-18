import { api } from '../config/api';
import { setCredentials } from './auth.slice';
import type { User } from '../types/user.types';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch {
                    // login error is surfaced to UI through RTK Query state
                }
            },
        }),
    }),
});

export const { useLoginMutation } = authApi;
