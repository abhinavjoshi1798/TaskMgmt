import { AuthState, User } from '@/constants/interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getItem, getJSON, setItem, setJSON, removeItem } from '@/utils/localStorage';

const initialState: AuthState = {
  user: getJSON<User>('user'),
  token: getItem('token'),
  isAuthenticated: getItem('isAuthenticated') === 'true',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    
    loginUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setItem('token', action.payload.token);
      setJSON('user', action.payload.user);
      setItem('isAuthenticated', 'true');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeItem('token');
      removeItem('user');
      removeItem('isAuthenticated');
    },
  },
  
});

export const {loginUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
