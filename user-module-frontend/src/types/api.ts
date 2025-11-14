export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface UserRegisterRequest {
  email: string;
  nickname: string;
  encryptedPassword: string;
  avatarUrl?: string;
  avatarBase64?: string;
  country?: string;
  gender?: number;
  verificationCode: string;
}

export interface UserLoginRequest {
  username: string;
  encryptedPassword: string;
}

export interface UserLoginResponse {
  userId: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
  token: string;
}

export interface UserRegisterResponse {
  userId: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
  country?: string;
  gender?: number;
  status: number;
  createdAt: string;
  token: string;
}

export interface UserInfoResponse {
  userId: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
  avatarBase64?: string;
  country?: string;
  gender?: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserVerifyResponse {
  userId: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
}

export interface UserResetPasswordRequest {
  email: string;
  encryptedPassword: string;
  verificationCode: string;
}

