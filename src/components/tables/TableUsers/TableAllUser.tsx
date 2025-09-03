import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { useState, useEffect } from "react";
import * as userService from '../../../services/user';
import * as companyService from "../../../services/company";
import { MoreDotIcon } from "../../../icons";

interface User {
    userId: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    role: string;
    avatar: string;
    createAt: string;
    isDeleted: boolean;
}

interface TableAllUserProps {
    onShowDetail?: (user: any) => void;
    refreshKey?: number;
}

const TableAllUser = ({ onShowDetail, refreshKey }: TableAllUserProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [banUserId, setBanUserId] = useState<string | null>(null);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const data = await userService.getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
        companyService.getCompanies();
    }, [refreshKey]);

    const handleBan = async (userId: string) => {
        try {
            await userService.banUser(userId);
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isDeleted: true } : u));
        } catch (error) {
            console.error(error);
        } finally {
            setDropdownOpen(null);
            setBanUserId(null);
            setIsBanModalOpen(false);
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            await userService.unbanUser(userId);
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isDeleted: false } : u));
        } catch (error) {
            console.error(error);
        } finally {
            setDropdownOpen(null);
        }
    };

    const openBanModal = (userId: string) => {
        setBanUserId(userId);
        setIsBanModalOpen(true);
        setDropdownOpen(null);
    };

    const handleDetail = (user: User) => {
        if (onShowDetail) onShowDetail(user);
        setDropdownOpen(null);
    };

    const toggleDropdown = (userId: string) => {
        setDropdownOpen(dropdownOpen === userId ? null : userId);
    };

    if (loading) return <div className="dark:text-white">Loading user list...</div>;

    const roles = Array.from(new Set(users.map(u => u.role))).filter(Boolean);
    const filteredUsers = roleFilter.length === 0 ? users : users.filter(u => roleFilter.includes(u.role));
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    const handleRoleChange = (role: string) => {
        setRoleFilter(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    return (
        <>
            <div className="flex items-center mb-4 gap-4">
                <span className="text-sm font-medium text-gray-700">Role:</span>
                {roles.map(role => (
                    <label key={role} className="flex items-center gap-1 text-sm text-black dark:text-gray-500">
                        <input
                            type="checkbox"
                            checked={roleFilter.includes(role)}
                            onChange={() => handleRoleChange(role)}
                        /> {role}
                    </label>
                ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Avatar</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Full name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created At</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 overflow-hidden rounded-full dark:text-white">
                                                <img width={40} height={40} src={user.avatar} alt={user.userName} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.userName}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {user.isDeleted ? (
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">Banned</span>
                                        ) : (
                                            user.role
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{new Date(user.createAt).toLocaleString()}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="relative">
                                            <button onClick={() => toggleDropdown(user.userId)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <MoreDotIcon className="h-5 w-5 text-gray-500" />
                                            </button>
                                            {dropdownOpen === user.userId && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
                                                    <div className="py-1">
                                                        <button onClick={() => handleDetail(user)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Details</button>
                                                        {user.isDeleted ? (
                                                            <button
                                                                onClick={() => handleUnban(user.userId)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 dark:text-green-400 dark:hover:bg-gray-700"
                                                            >
                                                                Unban
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openBanModal(user.userId)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                                disabled={user.isDeleted}
                                                                style={user.isDeleted ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                            >
                                                                Ban
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Ban User Confirmation Modal */}
            {isBanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-lg text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto text-red-500 mb-4"
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
                        <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Confirm Ban
                        </h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                            Are you sure you want to ban this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 rounded border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => { setIsBanModalOpen(false); setBanUserId(null); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                onClick={() => banUserId && handleBan(banUserId)}
                            >
                                Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    className="dark:text-white px-3 py-1 rounded border border-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={`dark:text-white px-3 py-1 rounded border border-gray-300 mx-1 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800'}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
                <button
                    className="dark:text-white px-3 py-1 rounded border border-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default TableAllUser;