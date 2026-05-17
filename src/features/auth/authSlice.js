import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initialize user from localStorage if available
const getInitialUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed;
    }
  } catch (e) {
    console.error('Error parsing user_data from localStorage:', e);
  }
  return null;
};

const initialState = {
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  logoutLoading: false,
  logoutError: null,
};

// Async logout thunk to call backend API
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/';
      
      // Call backend logout endpoint to blacklist refresh token
      if (refreshToken) {
        await axios.post(`${baseUrl}auth/logout/`, {
          refresh: refreshToken,
        });
      }
      
      return { success: true };
    } catch (error) {
      // Even if the API call fails, we should still clear local storage
      return { success: true, warning: error.response?.data?.detail || 'Logout API failed but local session cleared' };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, access, refresh } = action.payload;
      
      
      state.user = user;
      state.isAuthenticated = true;
      
      // Save tokens to localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Save user data to localStorage (CRITICAL for persistence)
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    },
    clearLogoutError: (state) => {
      state.logoutError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.logoutError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.logoutLoading = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.logoutError = action.payload;
        // Still clear local storage on error
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { setCredentials, logout, clearLogoutError } = authSlice.actions;
export default authSlice.reducer;
