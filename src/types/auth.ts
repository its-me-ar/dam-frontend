export type Role = 'ADMIN' | 'USER' | 'MANAGER';

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  userId: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type User = {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  createdAt: string;
};
