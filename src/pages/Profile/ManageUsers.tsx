import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import * as userService from '../../services/user';
import { Company, getCompanies } from '../../services/company'; // Import Company từ company.ts
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TableAllUser from "../../components/tables/TableUsers/TableAllUser";

interface UserDetail {
    userId: string;
    userName: string;
    email: string;
    role: string;
    avatar: string | null;
    createAt: string;
    isDeleted: boolean;
    packageId: number | null;
    packageName: string | null;
}

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
}

export default function ManageUsers() {
    const { isOpen, openModal, closeModal } = useModal();
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: '',
    });
    const [error, setError] = useState('');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
    const [userListRefreshKey, setUserListRefreshKey] = useState(0);
    const [packages, setPackages] = useState<Package[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const response = await getCompanies();
                setCompanies(response);
            } catch (err) {
                console.error('Failed to fetch companies:', err);
            }
        }
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (detailModalOpen) {
            async function fetchPackages() {
                try {
                    const packageData = await userService.getAllPackages();
                    setPackages(packageData);
                    if (detailUser && detailUser.packageId) {
                        setSelectedPackageId(detailUser.packageId);
                    } else {
                        setSelectedPackageId(null);
                    }
                } catch (err) {
                    console.error('Failed to fetch packages:', err);
                }
            }
            fetchPackages();
        }
    }, [detailModalOpen, detailUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!form.email || !form.firstName || !form.lastName || !form.password || !form.role) {
            setError('Please fill in all required fields');
            return;
        }
        try {
            await userService.createUser({
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                password: form.password,
                role: form.role,
            });
            closeModal();
            setForm({ email: '', firstName: '', lastName: '', password: '', confirmPassword: '', role: '' });
            setUserListRefreshKey((k) => k + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        }
    };

    const handleShowDetail = (user: UserDetail) => {
        setDetailUser(user);
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setDetailUser(null);
        setSelectedPackageId(null);
        setSelectedCompanyId(null);
        setShowCompanyDropdown(false);
        setPackages([]);
    };

    const handleBanUnban = async () => {
        if (!detailUser) return;
        try {
            if (detailUser.isDeleted) {
                await userService.unbanUser(detailUser.userId);
                setDetailUser({ ...detailUser, isDeleted: false });
            } else {
                await userService.banUser(detailUser.userId);
                setDetailUser({ ...detailUser, isDeleted: true });
            }
            setUserListRefreshKey((k) => k + 1);
        } catch (err) {
            alert((err as Error).message || 'Failed to update user status');
        }
    };

    const handleMakeAdmin = async () => {
        if (!detailUser) return;
        try {
            await userService.updateUserRoleAdmin(detailUser.userId);
            setDetailUser({ ...detailUser, role: 'ADMIN' });
            setUserListRefreshKey((k) => k + 1);
            alert('User promoted to ADMIN successfully');
        } catch (err) {
            alert((err as Error).message || 'Failed to promote user to ADMIN');
        }
    };

    const handlePromoteToHR = async () => {
        if (!detailUser || selectedCompanyId === null) {
            alert('Please select a company to promote the user to HR');
            return;
        }
        try {
            await userService.promoteToHR(detailUser.userId, selectedCompanyId.toString());
            setDetailUser({ ...detailUser, role: 'HR' });
            setUserListRefreshKey((k) => k + 1);
            alert('User promoted to HR successfully');
        } catch (err) {
            alert((err as Error).message || 'Failed to promote user to HR');
        }
    };

    const handleUpgradePackage = async () => {
        if (!detailUser || selectedPackageId === null) return;
        try {
            await userService.upgradeUserPackage(detailUser.userId, selectedPackageId);
            const selectedPackage = packages.find(p => p.packageId === selectedPackageId);
            setDetailUser({
                ...detailUser,
                packageId: selectedPackageId,
                packageName: selectedPackage ? selectedPackage.packageName : null,
            });
            setUserListRefreshKey((k) => k + 1);
        } catch (err) {
            alert((err as Error).message || 'Failed to upgrade user package');
        }
    };

    const handleShowCompanyDropdown = () => {
        setShowCompanyDropdown(true);
    };

    return (
        <>
            <PageMeta
                title="User Management"
                description="This is the profile dashboard page."
            />
            <PageBreadcrumb pageTitle="User Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        User Management
                    </h2>
                    <Button
                        onClick={openModal}
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
                        Create User
                    </Button>
                </div>

                <ComponentCard title="User List">
                    <TableAllUser onShowDetail={handleShowDetail} refreshKey={userListRefreshKey} />
                </ComponentCard>

                {/* User Detail Modal */}
                <Modal isOpen={detailModalOpen} onClose={closeDetailModal} className="max-w-[700px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10 shadow-lg">
                        <div className="px-4">
                            <h4 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white/90">
                                User Details
                            </h4>
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                View and manage user account information
                            </p>
                        </div>
                        {detailUser && (
                            <div className="flex flex-col gap-8 px-4">
                                <div className="flex flex-col items-center gap-3">
                                    <img
                                        src={detailUser.avatar || 'https://via.placeholder.com/96'}
                                        alt={detailUser.userName}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                    />
                                    <div className="text-xl font-semibold text-gray-800 dark:text-white/90">{detailUser.userName}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{detailUser.email}</div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</Label>
                                        <Input value={detailUser.userId} disabled className="mt-1 bg-gray-50 dark:bg-gray-800" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
                                        <Input value={detailUser.role} disabled className="mt-1 bg-gray-50 dark:bg-gray-800" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</Label>
                                        <Input value={new Date(detailUser.createAt).toLocaleString()} disabled className="mt-1 bg-gray-50 dark:bg-gray-800" />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                                        <Input value={detailUser.isDeleted ? 'Banned' : 'Active'} disabled className="mt-1 bg-gray-50 dark:bg-gray-800" />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Package</Label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <select
                                                value={selectedPackageId ?? ''}
                                                onChange={(e) => setSelectedPackageId(Number(e.target.value) || null)}
                                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
                                            >
                                                <option value="">None</option>
                                                {packages.map((pkg) => (
                                                    <option key={pkg.packageId} value={pkg.packageId}>
                                                        {pkg.packageName}
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={handleUpgradePackage}
                                                disabled={selectedPackageId === null || selectedPackageId === detailUser.packageId}
                                                className="px-4 py-2 text-sm font-medium"
                                            >
                                                Upgrade Package
                                            </Button>
                                        </div>
                                    </div>
                                    {detailUser.role !== 'HR' && (
                                        <div className="lg:col-span-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">HR Promotion</Label>
                                            <div className="mt-1">
                                                {!showCompanyDropdown ? (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={handleShowCompanyDropdown}
                                                        className="px-4 py-2 text-sm font-medium"
                                                    >
                                                        Become HR
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <select
                                                            value={selectedCompanyId ?? ''}
                                                            onChange={(e) => setSelectedCompanyId(Number(e.target.value) || null)}
                                                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
                                                        >
                                                            <option value="">Select company</option>
                                                            {companies.map((company) => (
                                                                <option key={company.companyId} value={company.companyId}>
                                                                    {company.name} ({company.shortName})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={handlePromoteToHR}
                                                            disabled={selectedCompanyId === null}
                                                            className="px-4 py-2 text-sm font-medium"
                                                        >
                                                            Promote to HR
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-6">
                                    <Button
                                        size="sm"
                                        variant={detailUser.isDeleted ? 'primary' : 'danger'}
                                        onClick={handleBanUnban}
                                        className="px-4 py-2 text-sm font-medium"
                                    >
                                        {detailUser.isDeleted ? 'Unban User' : 'Ban User'}
                                    </Button>
                                    {detailUser.role !== 'ADMIN' && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={handleMakeAdmin}
                                            className="px-4 py-2 text-sm font-medium"
                                        >
                                            Make Admin
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-3 px-4 mt-8">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeDetailModal}
                                className="px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Create New User
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Fill in the details to create a new user account.
                        </p>
                    </div>

                    <form className="flex flex-col" onSubmit={handleCreateUser}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div>
                                    <Label>First Name</Label>
                                    <Input name="firstName" type="text" placeholder="Enter first name" value={form.firstName} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label>Last Name</Label>
                                    <Input name="lastName" type="text" placeholder="Enter last name" value={form.lastName} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Email Address</Label>
                                    <Input name="email" type="email" placeholder="Enter email address" value={form.email} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Password</Label>
                                    <Input name="password" type="password" placeholder="Enter password" value={form.password} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Confirm Password</Label>
                                    <Input name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-2">
                                    <Label>Role</Label>
                                    <select name="role" value={form.role} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                        <option value="">Select role</option>
                                        <option value="USER">User</option>
                                        <option value="HR">HR</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <Label>Bio</Label>
                                    <textarea
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder="Enter bio"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button size="sm">
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}