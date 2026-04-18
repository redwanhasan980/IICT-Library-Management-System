import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
}

const AUTH_STORAGE_KEY = 'iict_library_auth';

const readPersistedAuth = (): AuthState => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { user: null, token: null };
    }

    const parsed = JSON.parse(raw) as AuthState;
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    };
  } catch {
    return { user: null, token: null };
  }
};

const persistAuth = (state: AuthState) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
};

const initialState: AuthState = readPersistedAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
      persistAuth(state);
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      persistAuth(state);
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
