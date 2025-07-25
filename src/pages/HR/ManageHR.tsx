import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
// Đảm bảo đường dẫn này đúng với vị trí file HRApplications của bạn
import HRApplicationTable, { HRApplication } from "../../components/hr/HRApplications";
// Import instance API đã cấu hình sẵn
import api from '../../services/api'; // Điều chỉnh đường dẫn nếu cần

export default function ManageHR() {
    const [hrApplications, setHrApplications] = useState<HRApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Không cần định nghĩa API_BASE_URL hoặc axios.create ở đây nữa
    // const API_BASE_URL = 'https://endlessly-enabling-husky.ngrok-free.app';
    // const api = axios.create({...});

    const fetchHRAApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/hr-applications');
            console.log("Response data:", response.data);

            if (response.data.code === 200) {
                if (Array.isArray(response.data.data)) {
                    setHrApplications(response.data.data);
                } else {
                    setError("Dữ liệu nhận được không đúng định dạng.");
                }
            } else {
                setError(response.data.message || "Không thể tải danh sách yêu cầu HR.");
            }
        } catch (err: any) {
            console.error("Lỗi khi fetch yêu cầu HR:", err);
            setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn duyệt yêu cầu này?")) {
            return;
        }
        try {
            const response = await api.put(`/admin/hr/${id}/approve`);

            if (response.data.code === 200) {
                alert("Yêu cầu đã được duyệt thành công!");
                fetchHRAApplications();
            } else {
                alert(`Lỗi khi duyệt yêu cầu: ${response.data.message}`);
            }
        } catch (err: any) {
            console.error("Lỗi duyệt yêu cầu:", err);
            alert(`Đã xảy ra lỗi: ${err.response?.data?.message || err.message || "Có lỗi xảy ra khi duyệt."}`);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) {
            return;
        }
        try {
            const response = await api.put(`/admin/hr/${id}/reject`);

            if (response.data.code === 200) {
                alert("Yêu cầu đã được từ chối thành công!");
                fetchHRAApplications();
            } else {
                alert(`Lỗi khi từ chối yêu cầu: ${response.data.message}`);
            }
        } catch (err: any) {
            console.error("Lỗi từ chối yêu cầu:", err);
            alert(`Đã xảy ra lỗi: ${err.response?.data?.message || err.message || "Có lỗi xảy ra khi từ chối."}`);
        }
    };

    useEffect(() => {
        fetchHRAApplications();
    }, []);

    return (
        <div>
            <PageMeta title="Quản lý Yêu cầu HR | Admin Dashboard" description="Trang quản lý các yêu cầu đăng ký quyền HR." />
            <PageBreadcrumb pageTitle="Quản lý Yêu cầu HR" />
            <ComponentCard title="Danh sách Yêu cầu HR">
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu yêu cầu HR...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-red-500 font-medium">Lỗi: {error}</p>
                    </div>
                )}
                {!loading && !error && hrApplications.length > 0 && (
                    <HRApplicationTable
                        applications={hrApplications}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
                {!loading && !error && hrApplications.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Hiện tại không có người dùng yêu cầu quyền HR.</p>
                    </div>
                )}
            </ComponentCard>
        </div>
    );
}