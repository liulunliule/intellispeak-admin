import React, { useState, useEffect } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
// import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
// import PageMeta from "../../../components/common/PageMeta";
import api from "../../../services/api";
import { toast } from "react-toastify";
import Badge from "../../../components/ui/badge/Badge";

interface Package {
    packageId: number;
    packageName: string;
    description: string;
    price: number;
    interviewCount: number;
    cvAnalyzeCount: number;
    jdAnalyzeCount: number;
    createAt: string;
    updateAt: string;
    status?: "active" | "inactive";
}

const ManagePackage: React.FC = () => {
    const [packageData, setPackageData] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    // Modal hooks
    const { isOpen: isCreateModalOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
    const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

    const [newPackage, setNewPackage] = useState({
        packageName: "",
        description: "",
        price: 0,
        interviewCount: 0,
        cvAnalyzeCount: 0,
        jdAnalyzeCount: 0,
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await api.get("/package");

            if (response.data.code === 200) {
                const dataWithStatus = response.data.data.map((pkg: Package) => ({
                    ...pkg,
                    status: "active"
                }));
                setPackageData(dataWithStatus);
            } else {
                toast.error(response.data.message || "Lỗi khi lấy danh sách gói");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách gói:", error);
            toast.error("Lỗi khi lấy danh sách gói");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePackage = async () => {
        try {
            const response = await api.post("/package", newPackage);
            if (response.data.code === 200) {
                toast.success("Tạo gói thành công");
                fetchPackages();
                closeCreateModal();
                setNewPackage({
                    packageName: "",
                    description: "",
                    price: 0,
                    interviewCount: 0,
                    cvAnalyzeCount: 0,
                    jdAnalyzeCount: 0,
                });
            } else {
                toast.error(response.data.message || "Lỗi khi tạo gói");
            }
        } catch (error) {
            console.error("Lỗi khi tạo gói:", error);
            toast.error("Lỗi khi tạo gói");
        }
    };

    const handleUpdatePackage = async () => {
        if (!selectedPackage) return;

        try {
            const data = {
                packageName: selectedPackage.packageName,
                description: selectedPackage.description,
                price: selectedPackage.price,
                interviewCount: selectedPackage.interviewCount,
                cvAnalyzeCount: selectedPackage.cvAnalyzeCount,
                jdAnalyzeCount: selectedPackage.jdAnalyzeCount,
            };
            console.log("PUT /package/" + selectedPackage.packageId, data);
            const response = await api.put(`/package/${selectedPackage.packageId}`, data);

            console.log("Cập nhật gói:", response);

            if (response.data.code === 200) {
                toast.success("Cập nhật gói thành công");
                closeEditModal();
            } else {
                toast.error(response.data.message || "Lỗi khi cập nhật gói");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật gói:", error);
            toast.error("Lỗi khi cập nhật gói");
        }
    };

    const handleDeletePackage = async () => {
        if (!selectedPackage) return;

        try {
            const response = await api.delete(`/package/${selectedPackage.packageId}`);
            if (response.data.code === 200) {
                toast.success("Xóa gói thành công");
                // fetchPackages();
                closeDeleteModal();
            } else {
                toast.error(response.data.message || "Lỗi khi xóa gói");
            }
        } catch (error) {
            console.error("Lỗi khi xóa gói:", error);
            toast.error("Lỗi khi xóa gói");
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPackage(prev => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!selectedPackage) return;

        const { name, value } = e.target;
        setSelectedPackage(prev => ({
            ...prev!,
            [name]: name === "price" ? parseFloat(value) || 0 : value,
        }));
    };

    const toggleDropdown = (packageId: number) => {
        setDropdownOpen(dropdownOpen === packageId ? null : packageId);
    };

    const handleEditClick = (pkg: Package) => {
        setSelectedPackage(pkg);
        openEditModal();
        setDropdownOpen(null);
    };

    const handleDeleteClick = (pkg: Package) => {
        setSelectedPackage(pkg);
        openDeleteModal();
        setDropdownOpen(null);
    };


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Quản lý Gói
                    </h2>
                    <Button
                        onClick={openCreateModal}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.9999 1.5C4.8549 1.5 1.4999 4.855 1.4999 9C1.4999 13.145 4.8549 16.5 8.9999 16.5C13.1449 16.5 16.4999 13.145 16.4999 9C16.4999 4.855 13.1449 1.5 8.9999 1.5ZM12.7499 9.5625H9.5624V12.75H8.4374V9.5625H5.2499V8.4375H8.4374V5.25H9.5624V8.4375H12.7499V9.5625Z"
                                fill=""
                            />
                        </svg>
                        Thêm Gói Mới
                    </Button>
                </div>

                <ComponentCard title="Danh sách Gói">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.05]">
                                <thead className="bg-gray-50 dark:bg-white/[0.03]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Tên gói
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Mô tả
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Giá
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Trạng thái
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-white/[0.03] dark:divide-white/[0.05]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center dark:text-white">
                                                Đang tải...
                                            </td>
                                        </tr>
                                    ) : packageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center dark:text-white">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        packageData.map((pkg) => (
                                            <tr key={pkg.packageId}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                                                        {pkg.packageName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {pkg.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatPrice(pkg.price)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(pkg.createAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge size="sm" color={pkg.status === "active" ? "success" : "error"}>
                                                        {pkg.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => toggleDropdown(pkg.packageId)}
                                                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-gray-500"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>
                                                        {dropdownOpen === pkg.packageId && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => handleEditClick(pkg)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                    >
                                                                        Chỉnh sửa
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(pkg)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ComponentCard>
            </div>

            {/* Modal tạo gói mới */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Thêm Gói Mới
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Điền thông tin chi tiết để tạo gói mới.
                        </p>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Tên gói</Label>
                                    <Input
                                        type="text"
                                        name="packageName"
                                        value={newPackage.packageName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên gói"
                                    />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Giá (VND)</Label>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={newPackage.price.toString()}
                                        onChange={handleInputChange}
                                        placeholder="Nhập giá"
                                    />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Số lượt phỏng vấn</Label>
                                    <Input
                                        type="number"
                                        name="interviewCount"
                                        value={newPackage.interviewCount.toString()}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượt phỏng vấn"
                                    />
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Số lượt phân tích CV</Label>
                                    <Input
                                        type="number"
                                        name="cvAnalyzeCount"
                                        value={newPackage.cvAnalyzeCount.toString()}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượt phân tích CV"
                                    />
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Số lượt phân tích JD</Label>
                                    <Input
                                        type="number"
                                        name="jdAnalyzeCount"
                                        value={newPackage.jdAnalyzeCount.toString()}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượt phân tích JD"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label>Mô tả</Label>
                                    <textarea
                                        name="description"
                                        value={newPackage.description}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                        className="w-full px-4 py-2.5 text-theme-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeCreateModal}>
                                Hủy
                            </Button>
                            <Button size="sm" onClick={handleCreatePackage}>
                                Tạo Gói
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal chỉnh sửa gói */}
            {selectedPackage && (
                <Modal isOpen={isEditModalOpen} onClose={closeEditModal} className="max-w-[700px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Chỉnh sửa Gói
                            </h4>
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                                Cập nhật thông tin gói.
                            </p>
                        </div>

                        <form className="flex flex-col">
                            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Tên gói</Label>
                                        <Input
                                            type="text"
                                            name="packageName"
                                            value={selectedPackage.packageName}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập tên gói"
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Giá (VND)</Label>
                                        <Input
                                            type="number"
                                            name="price"
                                            value={selectedPackage.price.toString()}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập giá"
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Số lượt phỏng vấn</Label>
                                        <Input
                                            type="number"
                                            name="interviewCount"
                                            value={selectedPackage.interviewCount?.toString() || "0"}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập số lượt phỏng vấn"
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1"></div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Số lượt phân tích CV</Label>
                                        <Input
                                            type="number"
                                            name="cvAnalyzeCount"
                                            value={selectedPackage.cvAnalyzeCount?.toString() || "0"}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập số lượt phân tích CV"
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Số lượt phân tích JD</Label>
                                        <Input
                                            type="number"
                                            name="jdAnalyzeCount"
                                            value={selectedPackage.jdAnalyzeCount?.toString() || "0"}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập số lượt phân tích JD"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Mô tả</Label>
                                        <textarea
                                            name="description"
                                            value={selectedPackage.description}
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập mô tả"
                                            rows={3}
                                            className="w-full px-4 py-2.5 text-theme-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button size="sm" variant="outline" onClick={closeEditModal}>
                                    Hủy
                                </Button>
                                <Button size="sm" onClick={handleUpdatePackage}>
                                    Cập nhật
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* Modal xác nhận xóa */}
            {selectedPackage && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} className="max-w-[400px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[400px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h4 className="mb-2 mt-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Xác nhận xóa
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Bạn có chắc chắn muốn xóa gói{" "}
                            <span className="font-semibold text-gray-900 dark:text-white/90">
                                {selectedPackage.packageName}
                            </span>{" "}
                            không? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <Button size="sm" variant="outline" onClick={closeDeleteModal}>
                                Hủy
                            </Button>
                            <Button size="sm" variant="danger" onClick={handleDeletePackage}>
                                Xóa
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ManagePackage;