import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getUserInfo, clearAuth, isAuthenticated } from '../utils/auth';
import type { UserInfoResponse } from '../types/api';

export default function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadUserInfo = async () => {
      try {
        const storedUser = getUserInfo();
        if (storedUser) {
          const info = await apiService.getUserInfo(storedUser.userId);
          setUserInfo(info);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || '获取用户信息失败');
        if (err.response?.status === 401) {
          clearAuth();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    const storedUser = getUserInfo();
    if (storedUser) {
      try {
        await apiService.logout(storedUser.userId);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    clearAuth();
    navigate('/login');
  };

  const handleSendVerificationCode = async () => {
    if (!resetPasswordData.email) {
      setResetPasswordError('请输入邮箱地址');
      return;
    }
    try {
      setResetPasswordError('');
      await apiService.sendVerificationCode(resetPasswordData.email);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setResetPasswordError(err.response?.data?.message || err.message || '发送验证码失败');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');

    if (!resetPasswordData.email || !resetPasswordData.password || !resetPasswordData.verificationCode) {
      setResetPasswordError('请填写所有必填项');
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setResetPasswordError('两次输入的密码不一致');
      return;
    }

    if (resetPasswordData.password.length < 6) {
      setResetPasswordError('密码长度至少为6位');
      return;
    }

    setResetPasswordLoading(true);
    try {
      await apiService.resetPassword({
        email: resetPasswordData.email,
        password: resetPasswordData.password,
        verificationCode: resetPasswordData.verificationCode,
      });
      setShowResetPassword(false);
      setResetPasswordData({
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
      });
      setCountdown(0);
      alert('密码重置成功！');
    } catch (err: any) {
      setResetPasswordError(err.response?.data?.message || err.message || '重置密码失败');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return '未更新';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '未更新';
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '未更新';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">个人中心</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetPassword(true);
                  setResetPasswordData((prev) => ({ ...prev, email: userInfo?.email || '' }));
                  setResetPasswordError('');
                  setCodeSent(false);
                  setCountdown(0);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                重置密码
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {userInfo && (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">用户ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{userInfo.userId}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">邮箱地址</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userInfo.email}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">昵称</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{userInfo.nickname}</dd>
                </div>

                {userInfo.avatarUrl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">头像</dt>
                    <dd className="mt-1">
                      <img
                        src={userInfo.avatarUrl}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </dd>
                  </div>
                )}

                {userInfo.country && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">国家/地区</dt>
                    <dd className="mt-1 text-sm text-gray-900">{userInfo.country}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500">性别</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未设置'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">账户状态</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        userInfo.status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {userInfo.status === 1 ? '✓ 正常' : '未激活'}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">注册时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(userInfo.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">最后更新</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(userInfo.updatedAt)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* 重置密码模态框 */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">重置密码</h3>
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetPasswordData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    verificationCode: '',
                  });
                  setResetPasswordError('');
                  setCodeSent(false);
                  setCountdown(0);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="px-6 py-4">
              {resetPasswordError && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                  <div className="text-sm text-red-800">{resetPasswordError}</div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetPasswordData.email}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={resetPasswordLoading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="reset-verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    id="reset-verification-code"
                    type="text"
                    value={resetPasswordData.verificationCode}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, verificationCode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入验证码"
                    required
                    disabled={resetPasswordLoading}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={countdown > 0 || resetPasswordLoading}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {countdown > 0 ? `${countdown}秒` : '发送验证码'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="至少6位字符"
                  required
                  disabled={resetPasswordLoading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="请再次输入密码"
                  required
                  disabled={resetPasswordLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      verificationCode: '',
                    });
                    setResetPasswordError('');
                    setCodeSent(false);
                    setCountdown(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  disabled={resetPasswordLoading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? '处理中...' : '确认重置'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

