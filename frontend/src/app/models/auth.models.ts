export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}
