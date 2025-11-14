import JSEncrypt from 'jsencrypt';
import axios from 'axios';
import type { ApiResult } from '../types/api';

let publicKey: string | null = null;

/**
 * 获取RSA公钥
 */
export async function getPublicKey(): Promise<string> {
  if (publicKey) {
    return publicKey;
  }

  try {
    const response = await axios.get<ApiResult<string>>('/api/user/public-key');
    if (response.data.code === 200 && response.data.data) {
      publicKey = response.data.data;
      return publicKey;
    }
    throw new Error('Failed to get public key: invalid response');
  } catch (error: any) {
    console.error('Error fetching public key:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error('Failed to get public key: ' + errorMessage);
  }
}

/**
 * 使用RSA公钥加密密码
 */
export async function encryptPassword(password: string): Promise<string> {
  try {
    const pubKey = await getPublicKey();
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    const encrypted = encrypt.encrypt(password);
    if (!encrypted) {
      throw new Error('Encryption failed');
    }
    return encrypted;
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw error;
  }
}

/**
 * 清除缓存的公钥（用于重新获取）
 */
export function clearPublicKeyCache() {
  publicKey = null;
}

