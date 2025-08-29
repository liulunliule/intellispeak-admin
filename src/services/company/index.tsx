import api from '../api';

export interface Company {
    companyId: number;
    name: string;
    shortName: string;
    description: string;
    logoUrl: string;
    website: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    hrList: {
        hrId: number;
        company: string;
        name: string;
        phone: string;
        country: string;
        experienceYears: number;
        linkedinUrl: string | null;
        cvUrl: string | null;
        submittedAt: string;
        hrStatus: string;
    }[];
    interviewTemplateList: {
        interviewSessionId: number;
        title: string;
        description: string;
        totalQuestion: number;
        durationEstimate: string;
        createdBy: {
            id: number;
            name: string;
            avatar: string | null;
        };
    }[];
}

export const getCompanies = async (): Promise<Company[]> => {
    try {
        const res = await api.get('/company/all');
        if (res.data.code === 200) {
            return res.data.data ?? [];
        } else {
            throw new Error(res.data.message || 'Error fetching companies');
        }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error loading companies');
    }
};

export const getCompanyById = async (companyId: number): Promise<Company> => {
    try {
        const res = await api.get(`/company/${companyId}`);
        if (res.data.code === 200) {
            return res.data.data;
        } else {
            throw new Error(res.data.message || 'Error fetching company details');
        }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error loading company details');
    }
};