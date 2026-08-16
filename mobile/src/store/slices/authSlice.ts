import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi, type AuthUser } from '../../api/auth.api';
import { clearSession, getSession, saveSession } from '../../utils/secureSession';

type AuthState = { user: AuthUser | null; accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean; isLoading: boolean; error: string | null };
const initialState: AuthState = { user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: true, error: null };

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const session = await getSession();
  if (!session.accessToken || !session.refreshToken) return null;
  const current = await authApi.me();
  return { ...session, user: current.user };
});

export const login = createAsyncThunk('auth/login', async (input: { email: string; password: string }) => {
  const result = await authApi.login(input);
  await saveSession(result.accessToken, result.refreshToken);
  return result;
});

export const logout = createAsyncThunk('auth/logout', async (_: void, { getState }) => {
  const state = getState() as { auth: AuthState };
  if (state.auth.refreshToken) await authApi.logout(state.auth.refreshToken).catch(() => undefined);
  await clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearAuthError: (state) => { state.error = null; }, setSession: (state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) => { Object.assign(state, { ...action.payload, isAuthenticated: true, isLoading: false, error: null }); } },
  extraReducers: (builder) => {
    builder.addCase(restoreSession.pending, (state) => { state.isLoading = true; });
    builder.addCase(restoreSession.fulfilled, (state, action) => { state.isLoading = false; if (action.payload) Object.assign(state, { ...action.payload, isAuthenticated: true }); else Object.assign(state, { user: null, accessToken: null, refreshToken: null, isAuthenticated: false }); });
    builder.addCase(restoreSession.rejected, (state, action) => { Object.assign(state, { isLoading: false, user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: action.error.message ?? 'Session expired.' }); clearSession().catch(() => undefined); });
    builder.addCase(login.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => { Object.assign(state, { ...action.payload, isAuthenticated: true, isLoading: false }); });
    builder.addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.error.message ?? 'Login failed.'; });
    builder.addCase(logout.fulfilled, () => initialState);
  },
});

export const { clearAuthError, setSession } = authSlice.actions;
export default authSlice.reducer;
