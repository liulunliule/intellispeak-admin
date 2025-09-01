import api from '../api';

export async function getMonthlyRevenue(year: number, month: number): Promise<number> {
  try {
    const response = await api.get(`/admin/monthly-revenue?year=${year}&month=${month}`);
    if (response.data && typeof response.data.data === 'number') {
      return response.data.data;
    }
    console.warn(`API returned unexpected data for ${year}-${month}:`, response.data);
    return 0;
  } catch (error) {
    console.error(`Error fetching revenue for ${year}-${month}:`, error);
    return 0;
  }
}

export async function getDailyRevenue(): Promise<string> {
  try {
    const response = await api.get('/admin/daily-revenue');
    if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0 && typeof response.data.data[0].Amount === 'string') {
      return response.data.data[0].Amount;
    }
    console.warn(`API returned unexpected data for daily revenue:`, response.data);
    return '0';
  } catch (error) {
    console.error(`Error fetching daily revenue:`, error);
    return '0';
  }
}

export async function getPackageStats(year: number): Promise<{ name: string; data: number[] }[]> {
  try {
    const response = await api.get(`/admin/package-stats?year=${year}`);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    console.warn(`API returned unexpected data for package stats in ${year}:`, response.data);
    return [];
  } catch (error) {
    console.error(`Error fetching package stats for ${year}:`, error);
    return [];
  }
}