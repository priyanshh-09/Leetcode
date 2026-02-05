import {createAsyncThunk, createSlice, isRejectedWithValue} from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'
import { response } from 'express';


export const registerUser = createAsyncThunk(
    'auth/register',
    async(userData,{rejectWithValue})=>{
        try{
          const response = await axiosClient.post('/user/register', userData);
          return response.data.user;
        }catch(err){
            return rejectWithValue(err);
        }
    }
)

export const loginUser = createAsyncThunk("auth/login", async(credentials,{rejectWithValue})=>{
    try{
      const response = await axiosClient.post("/user/login", credentials);
      return response.data.user;
    } 
    catch (err) {
      return rejectWithValue(err);
    }
  },
)

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const {data} = await axiosClient.post("/user/check");
      return data.user;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
)

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async ( _, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return null;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

const authSlice = createSlice({
    name:'auth',
    initialState:{
        user:null,
        isAuthenticated: false,
        loading:false,
        error:null
    },
    reducers:{

    },
    extraReducers:(builder)=>{
        builder

            //register
          .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = !!action.payload;
            state.user = action.payload;
            state.error = null;
          })
          .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload?.message || "Something went wrong";
          })
           
          //loginUser
          .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
          })

          .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = !!action.payload;
            state.user = action.payload;
          })
          .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Something went wrong";
            state.isAuthenticated = false;
            state.user = null;
          })

          //checkAuth

          .addCase(checkAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
          })

          .addCase(checkAuth.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = !!action.payload;
            state.user = action.payload;
          })
          .addCase(checkAuth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Something went wrong";
            state.isAuthenticated = false;
            state.user = null;
          })

          //logout
          .addCase(logoutUser.pending, (state) => {
            state.loading = true;
            state.error = null;
          })

          .addCase(logoutUser.fulfilled, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
          })
          .addCase(logoutUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Something went wrong";
            state.isAuthenticated = false;
            state.user = null;
          });
    }
})

export default authSlice.reducer;