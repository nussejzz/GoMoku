import type { UserLoginResponse } from '../types/api';

/**
 * 获取存储的token
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * 获取存储的用户信息
 */
export function getUserInfo(): UserLoginResponse | null {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) {
    return null;
  }
  try {
    return JSON.parse(userInfoStr);
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

