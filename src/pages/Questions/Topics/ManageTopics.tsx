import React, { useEffect, useState, useRef } from "react";
import api from '../../../services/api';
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { squarelogo } from '../../../assets';

interface Topic {
    topicId: number;
    title: string;
    description: string;
    longDescription?: string;
    createAt?: string;
    thumbnail?: string | null;
    updateAt?: string | null;
    isDeleted?: boolean;
}

const TopicRow: React.FC<{
    topic: Topic;
    editingId: number | null;
    editedTitle: string;
    editedDesc: string;
    editedThumbnailPreview: string | null;
    setEditedTitle: (value: string) => void;
    setEditedDesc: (value: string) => void;
    handleEdit: (topic: Topic) => void;
    handleUpdate: () => void;
    handleCancelEdit: () => void;
    handleDeleteClick: (topicId: number) => void;
    handleDetailClick: (topic: Topic) => void;
    updating: boolean;
}> = ({
    topic,
    editingId,
    editedTitle,
    editedDesc,
    editedThumbnailPreview,
    setEditedTitle,
    setEditedDesc,
    handleEdit,
    handleUpdate,
    handleCancelEdit,
    handleDeleteClick,
    handleDetailClick,
    updating,
}) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const dropdownButtonRef = useRef<HTMLButtonElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node) &&
                    dropdownButtonRef.current &&
                    !dropdownButtonRef.current.contains(event.target as Node)
                ) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        return (
            <tr key={topic.topicId}>
                <td className="px-3 py-4 text-center">
                    <img
                        src={topic.thumbnail ? topic.thumbnail : squarelogo}
                        alt={topic.title}
                        className="rounded w-16 h-16 object-cover border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer"
                    />
                </td>
                <td className="px-5 py-4 sm:px-6 text-start">
                    {editingId === topic.topicId ? (
                        <Input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                    ) : (
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {topic.title}
                        </span>
                    )}
                </td>
                <td className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                    {editingId === topic.topicId ? (
                        <Input
                            type="text"
                            value={editedDesc}
                            onChange={(e) => setEditedDesc(e.target.value)}
                        />
                    ) : (
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                            {topic.description}
                        </span>
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
                                ref={dropdownButtonRef}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                handleDetailClick(topic);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Chi tiết
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleEdit(topic);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteClick(topic.topicId);
                                                setIsDropdownOpen(false);
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
        );
    };

const ManageTopics: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // State cho chức năng Thêm
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newLongDesc, setNewLongDesc] = useState("");
    const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State cho chức năng Sửa
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDesc, setEditedDesc] = useState("");
    const [editedLongDesc, setEditedLongDesc] = useState("");
    const [editedThumbnailFile, setEditedThumbnailFile] = useState<File | null>(null);
    const [editedThumbnailPreview, setEditedThumbnailPreview] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updatingThumbnail, setUpdatingThumbnail] = useState(false);

    // State cho chức năng Xóa
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State cho chức năng Chi tiết
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailThumbnailFile, setDetailThumbnailFile] = useState<File | null>(null);
    const [detailThumbnailPreview, setDetailThumbnailPreview] = useState<string | null>(null);
    const [updatingDetailThumbnail, setUpdatingDetailThumbnail] = useState(false);

    const detailThumbnailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTopics();
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

    const handleImageUpload = async (file: File | null): Promise<string | null> => {
        if (!file) return null;

        try {
            const formData = new FormData();
            formData.append("images", file);

            const res = await api.post("/image/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return res.data[0] || null;
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            setError("Lỗi khi upload ảnh");
            return null;
        }
    };

    const handleNewThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewThumbnailFile(file);
            setNewThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditedThumbnailFile(file);
            setEditedThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleDetailThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDetailThumbnailFile(file);
            setDetailThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleDetailThumbnailUpdate = async () => {
        if (!selectedTopic || !detailThumbnailFile) return;

        setUpdatingDetailThumbnail(true);
        try {
            const thumbnailUrl = await handleImageUpload(detailThumbnailFile);
            if (thumbnailUrl) {
                await api.put(`/topic/thumbnail/${selectedTopic.topicId}`, thumbnailUrl, {
                    headers: {
                        "Content-Type": "text/plain",
                    },
                });
                setDetailThumbnailFile(null);
                setDetailThumbnailPreview(null);
                fetchTopics();
            }
        } catch {
            setError("Lỗi khi cập nhật thumbnail.");
        } finally {
            setUpdatingDetailThumbnail(false);
        }
    };

    const handleEditThumbnailUpdate = async () => {
        if (!editingId || !editedThumbnailFile) return;

        setUpdatingThumbnail(true);
        try {
            const thumbnailUrl = await handleImageUpload(editedThumbnailFile);
            if (thumbnailUrl) {
                await api.put(`/topic/thumbnail/${editingId}`, thumbnailUrl, {
                    headers: {
                        "Content-Type": "text/plain",
                    },
                });
                setEditedThumbnailFile(null);
                setEditedThumbnailPreview(null);
                fetchTopics();
            }
        } catch {
            setError("Lỗi khi cập nhật thumbnail.");
        } finally {
            setUpdatingThumbnail(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newDesc) return;

        setAdding(true);
        try {
            const response = await api.post("/topic", {
                title: newTitle,
                description: newDesc,
                longDescription: newLongDesc,
            });

            const newTopicId = response.data.topicId;

            if (newThumbnailFile) {
                const thumbnailUrl = await handleImageUpload(newThumbnailFile);
                if (thumbnailUrl && newTopicId) {
                    await api.put(`/topic/thumbnail/${newTopicId}`, thumbnailUrl, {
                        headers: {
                            "Content-Type": "text/plain",
                        },
                    });
                }
            }

            setNewTitle("");
            setNewDesc("");
            setNewLongDesc("");
            setNewThumbnailFile(null);
            setNewThumbnailPreview(null);

            fetchTopics();
            setIsAddModalOpen(false);
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
        setEditedLongDesc(topic.longDescription || "");
        setEditedThumbnailPreview(topic.thumbnail || null);
        setEditedThumbnailFile(null);
    };

    const handleUpdate = async () => {
        if (!editingId || !editedTitle || !editedDesc) return;

        setUpdating(true);
        try {
            await api.put(`/topic/${editingId}`, {
                title: editedTitle,
                description: editedDesc,
                longDescription: editedLongDesc,
            });

            setEditingId(null);
            setEditedTitle("");
            setEditedDesc("");
            setEditedLongDesc("");
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
        setEditedLongDesc("");
        setEditedThumbnailFile(null);
        setEditedThumbnailPreview(null);
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

    const handleDeleteClick = (topicId: number) => {
        setDeletingId(topicId);
        setIsDeleteModalOpen(true);
    };

    const handleDetailClick = (topic: Topic) => {
        setSelectedTopic(topic);
        setDetailThumbnailFile(null);
        setDetailThumbnailPreview(null);
        setIsDetailModalOpen(true);
    };

    const handleUpdateFromDetail = (topic: Topic) => {
        setEditingId(topic.topicId);
        setEditedTitle(topic.title);
        setEditedDesc(topic.description);
        setEditedLongDesc(topic.longDescription || "");
        setEditedThumbnailPreview(topic.thumbnail || null);
        setEditedThumbnailFile(null);
        setIsDetailModalOpen(false); // Close detail modal
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
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-1/2"
                />
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        Thêm chủ đề mới
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-20">
                                    Ảnh
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Tên chủ đề
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Mô tả
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredTopics.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500">
                                        Không có chủ đề nào
                                    </td>
                                </tr>
                            ) : (
                                filteredTopics.map((topic) => (
                                    <TopicRow
                                        key={topic.topicId}
                                        topic={topic}
                                        editingId={editingId}
                                        editedTitle={editedTitle}
                                        editedDesc={editedDesc}
                                        editedThumbnailPreview={editedThumbnailPreview}
                                        setEditedTitle={setEditedTitle}
                                        setEditedDesc={setEditedDesc}
                                        handleEdit={handleEdit}
                                        handleUpdate={handleUpdate}
                                        handleCancelEdit={handleCancelEdit}
                                        handleDeleteClick={handleDeleteClick}
                                        handleDetailClick={handleDetailClick}
                                        updating={updating}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal thêm chủ đề mới */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-[500px] m-4">
                <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8 text-center">
                    <h4 className="mb-2 mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Thêm chủ đề mới
                    </h4>
                    <div className="flex flex-col gap-4 mt-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ảnh thumbnail
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewThumbnailChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    dark:file:bg-blue-900/50 dark:file:text-blue-300
                                    dark:hover:file:bg-blue-900/70
                                    cursor-pointer"
                            />
                            {newThumbnailPreview && (
                                <div className="mt-2">
                                    <img
                                        src={newThumbnailPreview}
                                        alt="Preview"
                                        className="h-32 object-contain rounded border border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            )}
                        </div>

                        <Input
                            type="text"
                            placeholder="Tên chủ đề mới"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <Input
                            type="text"
                            placeholder="Mô tả"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <textarea
                            placeholder="Mô tả chi tiết (longDescription)"
                            value={newLongDesc}
                            onChange={(e) => setNewLongDesc(e.target.value)}
                            rows={5}
                            className="resize-y min-h-[100px] rounded border border-gray-300 dark:border-gray-700 p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white w-full"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAdd}
                            disabled={adding || !newTitle || !newDesc}
                        >
                            {adding ? "Đang thêm..." : "Thêm"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal chỉnh sửa chủ đề */}
            {editingId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            Chỉnh sửa chủ đề
                        </h2>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ảnh thumbnail
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditThumbnailChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    dark:file:bg-blue-900/50 dark:file:text-blue-300
                                    dark:hover:file:bg-blue-900/70
                                    cursor-pointer"
                            />
                            {editedThumbnailPreview && (
                                <div className="mt-2">
                                    <img
                                        src={editedThumbnailPreview}
                                        alt="Preview"
                                        className="h-32 object-contain rounded border border-gray-200 dark:border-gray-700"
                                    />
                                    <div className="mt-4 flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleEditThumbnailUpdate}
                                            disabled={updatingThumbnail}
                                        >
                                            {updatingThumbnail ? "Đang lưu..." : "Lưu thumbnail"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditedThumbnailFile(null);
                                                setEditedThumbnailPreview(null);
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input
                            type="text"
                            placeholder="Tên chủ đề"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            type="text"
                            placeholder="Mô tả"
                            value={editedDesc}
                            onChange={(e) => setEditedDesc(e.target.value)}
                            className="mb-4"
                        />
                        <textarea
                            placeholder="Mô tả chi tiết (longDescription)"
                            value={editedLongDesc}
                            onChange={(e) => setEditedLongDesc(e.target.value)}
                            rows={5}
                            className="resize-y min-h-[100px] rounded border border-gray-300 dark:border-gray-700 p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white w-full mb-4"
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={handleCancelEdit}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={updating || !editedTitle || !editedDesc}
                            >
                                {updating ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chi tiết chủ đề */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="max-w-[600px] m-4">
                <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 text-center">
                        Chi tiết chủ đề
                    </h4>
                    {selectedTopic && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex flex-col items-center relative">
                                <img
                                    src={detailThumbnailPreview || (selectedTopic.thumbnail ? selectedTopic.thumbnail : squarelogo)}
                                    alt={selectedTopic.title}
                                    className="h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                                <button
                                    onClick={() => detailThumbnailInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    title="Cập nhật thumbnail"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                    </svg>
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={detailThumbnailInputRef}
                                    onChange={handleDetailThumbnailChange}
                                    className="hidden"
                                />
                                {detailThumbnailPreview && (
                                    <div className="mt-4 flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleDetailThumbnailUpdate}
                                            disabled={updatingDetailThumbnail}
                                        >
                                            {updatingDetailThumbnail ? "Đang lưu..." : "Lưu thumbnail"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setDetailThumbnailFile(null);
                                                setDetailThumbnailPreview(null);
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        ID chủ đề
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">{selectedTopic.topicId}</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Tên chủ đề
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">{selectedTopic.title}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Mô tả
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">{selectedTopic.description}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Mô tả chi tiết
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">
                                        {selectedTopic.longDescription || "Không có mô tả chi tiết"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Ngày tạo
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">
                                        {selectedTopic.createAt ? new Date(selectedTopic.createAt).toLocaleString() : "Chưa có"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Ngày cập nhật
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">
                                        {selectedTopic.updateAt ? new Date(selectedTopic.updateAt).toLocaleString() : "Chưa có"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Trạng thái xóa
                                    </label>
                                    <p className="text-base text-gray-800 dark:text-white/90">
                                        {selectedTopic.isDeleted ? "Đã xóa" : "Chưa xóa"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <Button size="sm" variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                            Đóng
                        </Button>
                        {selectedTopic && (
                            <Button
                                size="sm"
                                onClick={() => handleUpdateFromDetail(selectedTopic)}
                            >
                                Cập nhật
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

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
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(deletingId!)}
                            disabled={deletingId === null}
                        >
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageTopics;
