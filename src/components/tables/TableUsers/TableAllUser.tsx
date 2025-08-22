import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
// import Badge from "../../ui/badge/Badge";
import { useState, useEffect } from "react";
import api from '../../../services/api';
import { useModal } from "../../../hooks/useModal";
// Removed unused modal, button, label, input imports
import { useNavigate } from "react-router";


interface User {
    userId: string;
    userName: string;
    email: string;
    role: string;
    avatar: string;
    createAt: string;
}


export default function TableAllUser() {
    const navigate = useNavigate();
    const { openModal } = useModal();
    const [users, setUsers] = useState<User[]>([]);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    // Removed unused selectedUser state

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await api.get('/admin/all-users');
                if (res.data && res.data.code === 200) {
                    setUsers(res.data.data);
                }
                console.log('Fetched users:', res.data.data);
            } catch {
                // handle error
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);


    const handleEdit = () => {
        openModal();
        setDropdownOpen(null);
    };

    const handleDelete = () => {
        // TODO: implement delete logic
        setDropdownOpen(null);
    };

    const handleDetail = (userId: string) => {
        navigate(`/profile?id=${userId}`);
        setDropdownOpen(null);
    };

    const toggleDropdown = (userId: string) => {
        setDropdownOpen(dropdownOpen === userId ? null : userId);
    };


    if (loading) return <div>Loading user list...</div>;


    // Get unique roles from users
    const roles = Array.from(new Set(users.map(u => u.role))).filter(Boolean);
    // If no role is selected, show all
    const filteredUsers = roleFilter.length === 0 ? users : users.filter(u => roleFilter.includes(u.role));

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    // Checkbox handlers
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
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Username</TableCell>
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
                                            <div className="w-10 h-10 overflow-hidden rounded-full">
                                                <img width={40} height={40} src={user.avatar} alt={user.userName} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">{user.userName}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user.role}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{new Date(user.createAt).toLocaleString()}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="relative">
                                            <button onClick={() => toggleDropdown(user.userId)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                            {dropdownOpen === user.userId && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
                                                    <div className="py-1">
                                                        <button onClick={() => handleDetail(user.userId)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Details</button>
                                                        <button onClick={handleEdit} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Edit</button>
                                                        <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700">Delete</button>
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
}