import React, { useEffect, useState, useRef } from "react";
import api from '../../../services/api';
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

interface Topic {
    topicId: number;
    title: string;
    description: string;
}

const ManageTopics: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // State cho chức năng Thêm
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [adding, setAdding] = useState(false);

    // State cho chức năng Sửa
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDesc, setEditedDesc] = useState("");
    const [updating, setUpdating] = useState(false);

    // State cho chức năng Xóa
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State và Ref cho dropdown
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchTopics = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/topic");
            setTopics(res.data);
        } catch {
            setError("Lỗi khi tải chủ đề.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newDesc) return;
        setAdding(true);
        try {
            await api.post("/topic", { title: newTitle, description: newDesc });
            setNewTitle("");
            setNewDesc("");
            fetchTopics();
        } catch {
            setError("Lỗi khi thêm chủ đề.");
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingId(topic.topicId);
        setEditedTitle(topic.title);
        setEditedDesc(topic.description);
    };

    const handleUpdate = async () => {
        if (!editingId || !editedTitle || !editedDesc) return;
        setUpdating(true);
        try {
            await api.put(`/topic/${editingId}`, { title: editedTitle, description: editedDesc });
            setEditingId(null);
            fetchTopics();
        } catch {
            setError("Lỗi khi cập nhật chủ đề.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedTitle("");
        setEditedDesc("");
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await api.delete(`/topic/${id}`);
            fetchTopics();
        } catch {
            setError("Lỗi khi xóa chủ đề.");
        } finally {
            setDeletingId(null);
            setIsDeleteModalOpen(false);
        }
    };

    // Hàm toggle dropdown
    const toggleDropdown = (topicId: number) => {
        setOpenDropdown(openDropdown === topicId ? null : topicId);
    };

    const filteredTopics = topics.filter(
        (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-md w-full max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quản lý chủ đề</h1>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    type="text"
                    placeholder="Tìm kiếm chủ đề..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-1/2"
                />
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Input
                        type="text"
                        placeholder="Tên chủ đề mới"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Mô tả"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                    />
                    <Button onClick={handleAdd} disabled={adding || !newTitle || !newDesc}>
                        {adding ? "Đang thêm..." : "Thêm"}
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên chủ đề</th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mô tả</th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <tr><td colSpan={3} className="py-6 text-center text-gray-500">Đang tải...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={3} className="py-6 text-center text-red-500">{error}</td></tr>
                            ) : filteredTopics.length === 0 ? (
                                <tr><td colSpan={3} className="py-6 text-center text-gray-500">Không có chủ đề nào</td></tr>
                            ) : (
                                filteredTopics.map((topic) => (
                                    <tr key={topic.topicId}>
                                        <td className="px-5 py-4 sm:px-6 text-start">
                                            {editingId === topic.topicId ? (
                                                <Input
                                                    type="text"
                                                    value={editedTitle}
                                                    onChange={e => setEditedTitle(e.target.value)}
                                                />
                                            ) : (
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{topic.title}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                                            {editingId === topic.topicId ? (
                                                <Input
                                                    type="text"
                                                    value={editedDesc}
                                                    onChange={e => setEditedDesc(e.target.value)}
                                                />
                                            ) : (
                                                <span className="block text-gray-500 text-theme-sm dark:text-gray-400">{topic.description}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {editingId === topic.topicId ? (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={handleUpdate} disabled={updating}>
                                                        {updating ? "Đang lưu..." : "Lưu"}
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                                        Hủy
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="relative inline-block text-left" ref={dropdownRef}>
                                                    <button
                                                        onClick={() => toggleDropdown(topic.topicId)}
                                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {openDropdown === topic.topicId && (
                                                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        handleEdit(topic);
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setDeletingId(topic.topicId);
                                                                        setIsDeleteModalOpen(true);
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal xác nhận xóa */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-[400px] m-4">
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
                        Bạn có chắc chắn muốn xóa chủ đề này không? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(deletingId!)}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageTopics;