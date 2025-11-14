import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { isAuthenticated } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    country: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 如果已登录，重定向到用户信息页
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setError('请先输入邮箱');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setCodeLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.sendVerificationCode(formData.email);
      setSuccess('验证码已发送！开发模式下，请查看后端控制台日志获取验证码。验证码有效期为5分钟。');
      // 清除之前的验证码输入
      setFormData({ ...formData, verificationCode: '' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '发送验证码失败';
      if (errorMessage.includes('already exists') || errorMessage.includes('已存在')) {
        setError('该邮箱已被注册，请使用其他邮箱或直接登录');
      } else if (errorMessage.includes('Redis') || errorMessage.includes('连接')) {
        setError('服务暂时不可用，请稍后重试。如果问题持续，请联系管理员。');
      } else {
        setError(`发送验证码失败：${errorMessage}。请检查邮箱地址是否正确，或稍后重试。`);
      }
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('密码长度至少为6位字符');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致，请重新输入');
      return;
    }
    
    // 验证验证码格式
    if (!formData.verificationCode) {
      setError('请输入验证码');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setError('验证码必须为6位数字');
      return;
    }

    if (!/^\d{6}$/.test(formData.verificationCode)) {
      setError('验证码只能包含数字');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.register({
        email: formData.email,
        nickname: formData.nickname,
        password: formData.password,
        verificationCode: formData.verificationCode,
        country: formData.country || undefined,
        gender: formData.gender ? parseInt(formData.gender) : undefined,
      });
      navigate('/profile');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '注册失败';
      
      // 根据错误类型显示不同的提示
      if (errorMessage.includes('verification code') || errorMessage.includes('验证码')) {
        if (errorMessage.includes('expired') || errorMessage.includes('过期')) {
          setError('验证码已过期，请重新获取');
        } else if (errorMessage.includes('mismatch') || errorMessage.includes('不匹配') || errorMessage.includes('Invalid')) {
          setError('验证码错误，请检查后重试。如果验证码已过期，请重新获取。');
        } else {
          setError('验证码验证失败，请检查验证码是否正确或是否已过期');
        }
      } else if (errorMessage.includes('Email already exists') || errorMessage.includes('邮箱已存在')) {
        setError('该邮箱已被注册，请使用其他邮箱或直接登录');
      } else if (errorMessage.includes('Nickname already exists') || errorMessage.includes('昵称已存在')) {
        setError('该昵称已被使用，请选择其他昵称');
      } else if (errorMessage.includes('password') || errorMessage.includes('密码')) {
        setError('密码验证失败，请检查密码是否正确');
      } else {
        setError(`注册失败：${errorMessage}。请检查输入信息后重试。`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              立即登录
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{success}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                昵称 *
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="你的昵称"
                value={formData.nickname}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入密码（至少6位字符）"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">密码将使用RSA加密传输，安全可靠</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码 *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                邮箱验证码 *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  className="flex-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请输入6位数字验证码"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={formData.verificationCode}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={codeLoading || !formData.email}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {codeLoading ? '发送中...' : '获取验证码'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                验证码将发送到您的邮箱，开发模式下请查看后端控制台日志获取验证码。验证码有效期为5分钟。
              </p>
              {success && success.includes('验证码') && (
                <p className="mt-1 text-xs text-green-600 font-medium">
                  ✓ 验证码已发送，请查看后端日志或邮箱
                </p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                国家/地区 <span className="text-gray-400 text-xs">(选填)</span>
              </label>
              <input
                id="country"
                name="country"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如：中国"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                性别 <span className="text-gray-400 text-xs">(选填)</span>
              </label>
              <select
                id="gender"
                name="gender"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">请选择性别</option>
                <option value="0">不愿透露</option>
                <option value="1">男</option>
                <option value="2">女</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

