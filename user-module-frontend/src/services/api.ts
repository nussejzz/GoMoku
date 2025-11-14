import axios from 'axios';
import type {
  ApiResult,
  UserRegisterRequest,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterResponse,
  UserInfoResponse,
  UserVerifyResponse,
  UserResetPasswordRequest,
} from '../types/api';
import { encryptPassword } from '../utils/crypto';

const api = axios.create({
  baseURL: '/api/user',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  /**
   * 获取公钥
   */
  async getPublicKey(): Promise<string> {
    const response = await api.get<ApiResult<string>>('/public-key');
    return response.data.data;
  },

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('email', email);
    await api.post<ApiResult<void>>('/email/send-verification-code', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  /**
   * 用户注册
   */
  async register(request: Omit<UserRegisterRequest, 'encryptedPassword'> & { password: string }): Promise<UserRegisterResponse> {
    const encryptedPassword = await encryptPassword(request.password);
    const response = await api.post<ApiResult<UserRegisterResponse>>('/register', {
      ...request,
      encryptedPassword,
    });
    if (response.data.code === 200) {
      // 保存token和用户信息
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * 用户登录
   */
  async login(request: Omit<UserLoginRequest, 'encryptedPassword'> & { password: string }): Promise<UserLoginResponse> {
    const encryptedPassword = await encryptPassword(request.password);
    const response = await api.post<ApiResult<UserLoginResponse>>('/login', {
      ...request,
      encryptedPassword,
    });
    if (response.data.code === 200) {
      // 保存token和用户信息
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * 验证token
   */
  async verify(): Promise<UserVerifyResponse> {
    // token已通过请求拦截器自动添加
    const response = await api.get<ApiResult<UserVerifyResponse>>('/verify');
    return response.data.data;
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number): Promise<UserInfoResponse> {
    const response = await api.get<ApiResult<UserInfoResponse>>(`/user/${userId}`);
    return response.data.data;
  },

  /**
   * 重置密码
   */
  async resetPassword(request: Omit<UserResetPasswordRequest, 'encryptedPassword'> & { password: string }): Promise<void> {
    const encryptedPassword = await encryptPassword(request.password);
    await api.post<ApiResult<void>>('/reset-password', {
      ...request,
      encryptedPassword,
    });
  },

  /**
   * 退出登录
   */
  async logout(userId: number): Promise<void> {
    await api.post<ApiResult<void>>('/logout', null, {
      headers: {
        'X-USER-ID': userId.toString(),
      },
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  },
};

