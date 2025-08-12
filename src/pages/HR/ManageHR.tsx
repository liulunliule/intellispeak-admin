import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import HRApplicationTable, { HRApplication } from "../../components/hr/HRApplications";
import api from '../../services/api';
import { Modal } from "../../components/ui/modal";

export default function ManageHR() {
    const [hrApplications, setHrApplications] = useState<HRApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCvModal, setShowCvModal] = useState(false);
    const [selectedCvUrls, setSelectedCvUrls] = useState<string[]>([]);

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

    const handleViewCv = (cvUrl: string) => {
        if (cvUrl) {
            const urls = cvUrl.split(';').filter(url => url.trim() !== '');
            setSelectedCvUrls(urls);
            setShowCvModal(true);
        }
    };

    const handleCloseCvModal = () => {
        setShowCvModal(false);
        setSelectedCvUrls([]);
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
                        onViewCv={handleViewCv}
                    />
                )}
                {!loading && !error && hrApplications.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Hiện tại không có người dùng yêu cầu quyền HR.</p>
                    </div>
                )}
            </ComponentCard>

            <Modal
                isOpen={showCvModal}
                onClose={handleCloseCvModal}
                className="max-w-4xl p-6"
                showCloseButton={true}
            >
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Xem CV</h3>
                </div>
                <div className="mt-4 max-h-[80vh] overflow-y-auto">
                    {selectedCvUrls.length > 0 ? (
                        selectedCvUrls.map((url, index) => (
                            <img key={index} src={url} alt={`CV Image ${index + 1}`} className="w-full h-auto mb-4" />
                        ))
                    ) : (
                        <p>Không có hình ảnh CV để hiển thị.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}