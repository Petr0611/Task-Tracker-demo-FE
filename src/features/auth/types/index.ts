// for login
export interface Credentials {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
}

export type ROLE = "ROLE_USER" | "ROLE_ADMIN";

export interface User {
  id: number;
  email: "string";
  role: ROLE;
  confirmationResent: boolean;
}

export interface AuthSliceState {
  isAuthenticated: boolean;
  user?: User;
  loginErrorMessage?: string;
}
