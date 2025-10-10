import {createAppSlice} from "../../../app/createAppSlice";
import type {AuthSliceState, Credentials, UserRegistrationDto,} from "../types";
import * as api from "../services/api";
import {isAxiosError} from "axios";

const initialState: AuthSliceState = {
  isAuthenticated: false,
  user: undefined,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    login: create.asyncThunk(
      async (credentials: Credentials) => {
        return api.fetchLogin(credentials).catch((err) => {
          if (isAxiosError(err)) {
            throw new Error(
              err.response?.data?.message || "Internal Server Error"
            );
          }
        });
      },
      {
        pending: (state) => {
          state.isAuthenticated = false;
        },
        fulfilled: (state) => {
          state.isAuthenticated = true;
          state.loginErrorMessage = undefined;
        },
        rejected: (state, action) => {
          state.isAuthenticated = false;
          state.user = undefined;
          console.log(action.error);
          state.loginErrorMessage = action.error.message;
        },
      }
    ),

    register: create.asyncThunk(
      async (dto: UserRegistrationDto) => {
        return api.fetchRegister(dto);
        // The value we return becomes the `fulfilled` action payload
      },
      {
        pending: (state) => {
          state.isAuthenticated = false;
        },
        fulfilled: (state, action) => {
          state.isAuthenticated = true;
          state.user = action.payload;
        },
        rejected: (state) => {
          state.isAuthenticated = false;
          state.user = undefined;
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectUser: (state) => state.user,
    selectRole: (state) => state.user?.role,
    selectLoginError: (state) => state?.loginErrorMessage,
  },
});

// // Action creators are generated for each case reducer function.
export const { login, register } = authSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectIsAuthenticated,
  selectUser,
  selectRole,
  selectLoginError,
} = authSlice.selectors;
