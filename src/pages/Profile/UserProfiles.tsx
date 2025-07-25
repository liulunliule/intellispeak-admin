import React, { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import UserMetaCard from '../../components/userProfile/UserMetaCard';
import UserInfoCard from '../../components/userProfile/UserInfoCard';
import api from '../../services/api';

interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  userName: string;
  bio: string | null;
  role: string;
  phone: string | null;
  email: string;
  avatar: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  facebook: string | null;
  youtube: string | null;
}

const UserProfiles: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/auth/profile');
      if (response.data.code === 200) {
        setUser(response.data.data);
      } else {
        setError(response.data.message || 'Không thể tải thông tin hồ sơ');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PageMeta
        title="Hồ sơ Người dùng"
        description="Trang quản lý hồ sơ người dùng"
      />
      <PageBreadcrumb pageTitle="Hồ sơ" />
      <div className="container mx-auto px-4 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-100 lg:mb-7">
            Hồ sơ
          </h3>
          {loading && (
            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
              Đang tải thông tin hồ sơ...
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
          {!loading && !error && user && (
            <div className="space-y-6">
              <UserMetaCard user={user} refetchProfile={fetchProfile} />
              <UserInfoCard user={user} refetchProfile={fetchProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;