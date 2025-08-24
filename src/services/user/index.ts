export const unbanUser = async (userId: string) => {
  try {
    return await api.post(`/admin/unban-user/${userId}`);
  } catch (error) {
    throw new Error(`Failed to unban user: ${error}`);
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
import api from '../api';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export const createUser = async (data: CreateUserRequest) => {
  try {
    return await api.post('/admin/create-user', data);
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};
