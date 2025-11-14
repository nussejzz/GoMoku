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
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              退出登录
            </button>
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
                    {new Date(userInfo.createdAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">最后更新</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(userInfo.updatedAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

