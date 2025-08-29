import api from '../api';

export interface Transaction {
  id: number;
  orderCode: number;
  transactionStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  amount: number;
  description: string;
  createAt: string;
  user: {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    userName: string;
    email: string;
    role: string;
    packageId: number | null;
    packageName: string | null;
    birthday: string | null;
    avatar: string | null;
    status: string | null;
    phone: string | null;
    bio: string | null;
    website: string | null;
    github: string | null;
    linkedin: string | null;
    facebook: string | null;
    youtube: string | null;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    cvAnalyzeUsed: number;
    jdAnalyzeUsed: number;
    interviewUsed: number;
  };
  apackage: {
    packageId: number;
    packageName: string;
    description: string;
    price: number;
    interviewCount: number;
    cvAnalyzeCount: number;
    jdAnalyzeCount: number;
  };
}

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const res = await api.get('/transaction/transactions');
    if (res.data.code === 200) {
      return res.data.data ?? [];
    } else {
      throw new Error(res.data.message || 'Error fetching transactions');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error loading transactions');
  }
};

export const getTotalRevenue = async (): Promise<number> => {
    try {
        const res = await api.get('/transaction/total-revenue');
        console.log(res);
        if (res.data && res.status === 200) {
            return res.data.data;
        } else {
            throw new Error(res.data?.message || 'Failed to fetch total revenue');
        }
    } catch (error) {
        throw new Error(`Failed to fetch total revenue: ${error}`);
    }
};