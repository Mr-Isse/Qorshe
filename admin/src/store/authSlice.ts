import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminAuthApi, clearAdminSession, type AdminUser } from '../api/auth.api';

type AuthState = { user: AdminUser | null; accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean; isLoading: boolean; error: string | null };
const initialState: AuthState = { user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: true, error: null };

export const restoreAdminSession = createAsyncThunk('adminAuth/restore', async () => adminAuthApi.me());
export const adminLogin = createAsyncThunk('adminAuth/login', async (input: { email: string; password: string }) => adminAuthApi.login(input));
export const adminLogout = createAsyncThunk('adminAuth/logout', async () => adminAuthApi.logout());

const slice = createSlice({ name: 'adminAuth', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(restoreAdminSession.fulfilled, (state, action) => { state.isLoading = false; if (action.payload.user.role === 'ADMIN') Object.assign(state, { user: action.payload.user, isAuthenticated: true }); else clearAdminSession(); });
  builder.addCase(restoreAdminSession.rejected, (state) => { Object.assign(state, { isLoading: false, isAuthenticated: false, user: null }); clearAdminSession(); });
  builder.addCase(adminLogin.pending, (state) => { state.isLoading = true; state.error = null; });
  builder.addCase(adminLogin.fulfilled, (state, action) => { state.isLoading = false; if (action.payload.user.role === 'ADMIN') Object.assign(state, { ...action.payload, isAuthenticated: true }); else { state.error = 'This account is not authorized for admin access.'; clearAdminSession(); } });
  builder.addCase(adminLogin.rejected, (state, action) => { state.isLoading = false; state.error = action.error.message ?? 'Login failed.'; });
  builder.addCase(adminLogout.fulfilled, () => initialState);
} });
export default slice.reducer;
