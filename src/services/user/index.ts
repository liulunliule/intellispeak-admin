import api from '../api';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export interface Package {
  packageId: number;
  packageName: string;
  description: string;
  price: number;
  interviewCount: number;
  cvAnalyzeCount: number;
  jdAnalyzeCount: number;
  createAt: string;
  updateAt: string;
}

export const createUser = async (data: CreateUserRequest) => {
  try {
    return await api.post('/admin/create-user', data);
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};

export const getAllUsers = async () => {
  try {
    const res = await api.get('/admin/all-users');
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data?.message || 'Failed to fetch users');
    }
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error}`);
  }
};

export const banUser = async (userId: string) => {
  try {
    return await api.post(`/admin/ban-user/${userId}`);
  } catch (error) {
    throw new Error(`Failed to ban user: ${error}`);
  }
};

export const unbanUser = async (userId: string) => {
  try {
    return await api.post(`/admin/unban-user/${userId}`);
  } catch (error) {
    throw new Error(`Failed to unban user: ${error}`);
  }
};

export const updateUserRoleAdmin = async (userId: string, role: string) => {
  try {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data?.message || 'Failed to update user role');
    }
  } catch (error) {
    throw new Error(`Failed to update user role: ${error}`);
  }
};

export const getAllPackages = async (): Promise<Package[]> => {
  try {
    const res = await api.get('/package');
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data?.message || 'Failed to fetch packages');
    }
  } catch (error) {
    throw new Error(`Failed to fetch packages: ${error}`);
  }
};

export const upgradeUserPackage = async (userId: string, targetPackageId: number) => {
  try {
    const res = await api.put(`/admin/users/${userId}/upgrade-package`, { targetPackageId });
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data?.message || 'Failed to upgrade user package');
    }
  } catch (error) {
    throw new Error(`Failed to upgrade user package: ${error}`);
  }
};

// Có thể giữ lại hàm promoteToHR nếu có endpoint riêng cho việc này
export const promoteToHR = async (userId: string) => {
  try {
    const res = await api.put(`/admin/users/${userId}/role`, { role: 'HR' });
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data?.message || 'Failed to promote user to HR');
    }
  } catch (error) {
    throw new Error(`Failed to promote user to HR: ${error}`);
  }
};