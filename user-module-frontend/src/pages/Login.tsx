import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { isAuthenticated } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  // 如果已登录，重定向到用户信息页
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.login({ username, password });
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '登录失败，请检查账号和密码是否正确');
    } finally {
      setLoading(false);
    }
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
      alert('密码重置成功！请使用新密码登录。');
    } catch (err: any) {
      setResetPasswordError(err.response?.data?.message || err.message || '重置密码失败');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            欢迎登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            还没有账户？{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              立即注册
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名/邮箱
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入邮箱或昵称"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(true);
                setResetPasswordError('');
                setResetPasswordData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  verificationCode: '',
                });
                setCountdown(0);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              忘记密码？
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
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
                  placeholder="请输入注册时使用的邮箱"
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

