import { api } from '../config/api';
import { setCredentials } from './auth.slice';
import { User } from '../types/user.types';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<{ user: User; token: string }, any>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (error) {
                    // console.log(error);
                }
            },
        }),
    }),
});

export const { useLoginMutation } = authApi;

export const selectCurrentUser = (state: any) => state.auth.user;