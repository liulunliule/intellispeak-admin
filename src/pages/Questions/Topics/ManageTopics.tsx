import React, { useEffect, useState, useRef } from "react";
import api from '../../../services/api';
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { squarelogo } from '../../../assets';
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Label from "../../../components/form/Label";
import TopicRow from "./TopicRow";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";
import type { Topic, Tag } from "./types";

const ManageTopics: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // State for Add functionality
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newLongDesc, setNewLongDesc] = useState("");
    const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State for Edit functionality
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDesc, setEditedDesc] = useState("");
    const [editedLongDesc, setEditedLongDesc] = useState("");
    const [updating, setUpdating] = useState(false);

    // State for Delete functionality
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State for Detail functionality
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailThumbnailFile, setDetailThumbnailFile] = useState<File | null>(null);
    const [detailThumbnailPreview, setDetailThumbnailPreview] = useState<string | null>(null);
    const [updatingDetailThumbnail, setUpdatingDetailThumbnail] = useState(false);

    // State for Tag management
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [selectedTagToAdd, setSelectedTagToAdd] = useState<number | null>(null);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [isRemoveTagModalOpen, setIsRemoveTagModalOpen] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<number | null>(null);

    const detailThumbnailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTopics();
        fetchAllTags();
    }, []);

    useEffect(() => {
        console.log("selectedTopic:", selectedTopic);
    }, [selectedTopic]);

    const fetchTopics = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/topic");
            const topicsWithTags = await Promise.all(
                res.data.map(async (topic: Topic) => {
                    try {
                        const tagsRes = await api.get(`/topic/${topic.topicId}/tags`);
                        return { ...topic, tags: tagsRes.data ?? [] };
                    } catch (error) {
                        console.error(`Error fetching tags for topic ${topic.topicId}:`, error);
                        return { ...topic, tags: [] };
                    }
                })
            );
            setTopics(topicsWithTags);
        } catch (err) {
            setError("Lỗi khi tải chủ đề.");
            console.error("Error fetching topics:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTags = async () => {
        setLoadingTags(true);
        try {
            const res = await api.get("/tag");
            const tags = (res.data.data ?? []).map((tag: any) => ({
                tagId: tag.tagId || tag.id,
                title: tag.title,
                description: tag.description,
                createdAt: tag.createdAt || tag.createAt,
                updatedAt: tag.updatedAt || tag.updateAt,
                isDeleted: tag.isDeleted,
            }));
            setAllTags(tags);
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError("Lỗi khi tải danh sách tag");
        } finally {
            setLoadingTags(false);
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

            return res.data[0] ?? null;
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

                setSelectedTopic(prev => ({
                    ...prev!,
                    thumbnail: thumbnailUrl,
                }));

                fetchTopics();
            }
        } catch {
            setError("Lỗi khi cập nhật thumbnail.");
        } finally {
            setUpdatingDetailThumbnail(false);
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
        } catch (err) {
            setError("Lỗi khi thêm chủ đề.");
            console.error("Error adding topic:", err);
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingId(topic.topicId);
        setEditedTitle(topic.title);
        setEditedDesc(topic.description);
        setEditedLongDesc(topic.longDescription ?? "");
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
        } catch (err) {
            setError("Lỗi khi cập nhật chủ đề.");
            console.error("Error updating topic:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedTitle("");
        setEditedDesc("");
        setEditedLongDesc("");
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await api.delete(`/topic/${id}`);
            fetchTopics();
        } catch (err) {
            setError("Lỗi khi xóa chủ đề.");
            console.error("Error deleting topic:", err);
        } finally {
            setDeletingId(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleDeleteClick = (topicId: number) => {
        setDeletingId(topicId);
        setIsDeleteModalOpen(true);
    };

    const handleDetailClick = async (topic: Topic) => {
        try {
            const tagsRes = await api.get(`/topic/${topic.topicId}/tags`);
            setSelectedTopic({
                ...topic,
                tags: tagsRes.data ?? [],
            });
            setDetailThumbnailFile(null);
            setDetailThumbnailPreview(null);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error(`Error fetching tags for topic ${topic.topicId}:`, error);
            setSelectedTopic({ ...topic, tags: [] });
            setIsDetailModalOpen(true);
        }
    };

    const handleAddTagToTopic = async () => {
        if (!selectedTopic || selectedTagToAdd === null) {
            setError("Vui lòng chọn chủ đề và tag hợp lệ.");
            console.warn("Invalid selectedTopic or selectedTagToAdd:", { selectedTopic, selectedTagToAdd });
            return;
        }

        try {
            console.log("Adding tag to topic:", selectedTopic.topicId, "Tag ID:", selectedTagToAdd);
            await api.put(`/topic/${selectedTopic.topicId}/tags/${selectedTagToAdd}`);

            const addedTag = allTags.find(tag => tag.tagId === selectedTagToAdd);
            if (!addedTag) {
                console.warn(`Tag with tagId ${selectedTagToAdd} not found in allTags`);
                setError("Tag không tồn tại trong danh sách.");
                return;
            }

            setSelectedTopic(prev => ({
                ...prev!,
                tags: [...(prev?.tags ?? []), addedTag],
            }));

            await fetchTopics();
            setIsAddTagModalOpen(false);
            setSelectedTagToAdd(null);
        } catch (error: any) {
            console.error("Error adding tag to topic:", error);
            setError(error.response?.data?.message ?? "Lỗi khi thêm tag vào chủ đề");
        }
    };

    const handleRemoveTagFromTopic = async () => {
        console.log("Removing tag from topic:", selectedTopic?.topicId, "Tag ID:", tagToRemove);

        if (!selectedTopic || !tagToRemove) {
            console.error("Missing topic or tag ID");
            setError("Thiếu thông tin chủ đề hoặc tag");
            return;
        }

        try {
            setSelectedTopic(prev => {
                const newTags = prev?.tags?.filter(tag => tag.tagId !== tagToRemove) ?? [];
                return {
                    ...prev!,
                    tags: newTags,
                };
            });

            await api.delete(`/topic/${selectedTopic.topicId}/tags/${tagToRemove}`);
            await fetchTopics();

            setIsRemoveTagModalOpen(false);
            setTagToRemove(null);
        } catch (error: any) {
            console.error("Error details:", error);

            if (selectedTopic) {
                try {
                    const refreshedTopic = await api.get(`/topic/${selectedTopic.topicId}`);
                    const tagsRes = await api.get(`/topic/${selectedTopic.topicId}/tags`);
                    setSelectedTopic({
                        ...refreshedTopic.data,
                        tags: tagsRes.data ?? [],
                    });
                } catch (refreshError) {
                    console.error("Error refreshing topic:", refreshError);
                }
            }

            setError(error.response?.data?.message ?? "Lỗi khi xóa tag khỏi chủ đề");
        }
    };

    const openAddTagModal = () => {
        setSelectedTagToAdd(null);
        setIsAddTagModalOpen(true);
    };

    const openRemoveTagModal = (tagId: number) => {
        console.log("Opening remove tag modal for tag ID:", tagId);
        setTagToRemove(tagId);
        setIsRemoveTagModalOpen(true);
    };

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags?.some(tag =>
            tag.title.toLowerCase().includes(search.toLowerCase()) ||
            tag.description.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-md w-full max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quản lý chủ đề</h1>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm chủ đề theo tên, mô tả hoặc tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus className="mr-1" /> Thêm chủ đề mới
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-3 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400 w-20">
                                    Ảnh
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                    Tên chủ đề
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                    Mô tả
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTopics.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                        {search ? "Không tìm thấy chủ đề phù hợp" : "Không có chủ đề nào"}
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

            {/* Add Topic Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-[500px] m-4">
                <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <ModalHeader title="Thêm chủ đề mới" onClose={() => setIsAddModalOpen(false)} />

                    <div className="space-y-4">
                        <div>
                            <Label>Ảnh thumbnail</Label>
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
                                <div className="mt-2 flex flex-col items-center">
                                    <img
                                        src={newThumbnailPreview}
                                        alt="Preview"
                                        className="h-32 object-contain rounded border border-gray-200 dark:border-gray-700"
                                    />
                                    <button
                                        onClick={() => {
                                            setNewThumbnailFile(null);
                                            setNewThumbnailPreview(null);
                                        }}
                                        className="mt-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Xóa ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Tên chủ đề*</Label>
                            <Input
                                type="text"
                                placeholder="Nhập tên chủ đề"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Mô tả*</Label>
                            <Input
                                type="text"
                                placeholder="Nhập mô tả ngắn"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Mô tả chi tiết</Label>
                            <textarea
                                placeholder="Nhập mô tả chi tiết (nếu có)"
                                value={newLongDesc}
                                onChange={(e) => setNewLongDesc(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <ModalFooter
                        onCancel={() => setIsAddModalOpen(false)}
                        onConfirm={handleAdd}
                        confirmText={adding ? "Đang thêm..." : "Thêm chủ đề"}
                        cancelText="Hủy"
                        confirmDisabled={adding || !newTitle || !newDesc}
                    />
                </div>
            </Modal>

            {/* Topic Detail Modal with Tag Management */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="max-w-2xl m-4">
                <div className="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <ModalHeader title="Chi tiết chủ đề" onClose={() => setIsDetailModalOpen(false)} />

                    {selectedTopic && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                <img
                                    src={detailThumbnailPreview ?? selectedTopic.thumbnail ?? squarelogo}
                                    alt={selectedTopic.title}
                                    className="h-48 w-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                                <div className="mt-4 flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={detailThumbnailInputRef}
                                        onChange={handleDetailThumbnailChange}
                                        className="hidden"
                                    />
                                    <Button size="sm" onClick={() => detailThumbnailInputRef.current?.click()}>
                                        Thay đổi ảnh
                                    </Button>
                                    {detailThumbnailPreview && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={handleDetailThumbnailUpdate}
                                                disabled={updatingDetailThumbnail}
                                            >
                                                {updatingDetailThumbnail ? "Đang lưu..." : "Lưu ảnh"}
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
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>ID chủ đề</Label>
                                    <p className="text-gray-800 dark:text-white/90">{selectedTopic.topicId}</p>
                                </div>
                                <div>
                                    <Label>Tên chủ đề</Label>
                                    <p className="text-gray-800 dark:text-white/90">{selectedTopic.title}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Mô tả</Label>
                                    <p className="text-gray-800 dark:text-white/90">{selectedTopic.description}</p>
                                </div>
                                {selectedTopic.longDescription && (
                                    <div className="md:col-span-2">
                                        <Label>Mô tả chi tiết</Label>
                                        <p className="text-gray-800 dark:text-white/90 whitespace-pre-line">
                                            {selectedTopic.longDescription}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <Label>Ngày tạo</Label>
                                    <p className="text-gray-800 dark:text-white/90">
                                        {selectedTopic.createdAt ? new Date(selectedTopic.createdAt).toLocaleString() : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <Label>Ngày cập nhật</Label>
                                    <p className="text-gray-800 dark:text-white/90">
                                        {selectedTopic.updatedAt ? new Date(selectedTopic.updatedAt).toLocaleString() : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                        Quản lý Tags
                                    </h5>
                                    <Button size="sm" onClick={openAddTagModal}>
                                        <FiPlus className="mr-1" /> Thêm Tag
                                    </Button>
                                </div>

                                {selectedTopic.tags && selectedTopic.tags.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTopic.tags.map((tag) => (
                                            <div
                                                key={tag.tagId}
                                                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            >
                                                <div>
                                                    <span className="font-medium text-gray-800 dark:text-white/90">{tag.title}</span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{tag.description}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {tag.tagId}</p>
                                                </div>
                                                <button
                                                    onClick={() => openRemoveTagModal(tag.tagId)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                        Chưa có tag nào được gán cho chủ đề này
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <ModalFooter onCancel={() => setIsDetailModalOpen(false)} cancelText="Đóng" />
                </div>
            </Modal>

            {/* Add Tag Modal */}
            <Modal isOpen={isAddTagModalOpen} onClose={() => setIsAddTagModalOpen(false)} className="max-w-md m-4">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <ModalHeader title="Thêm Tag vào chủ đề" onClose={() => setIsAddTagModalOpen(false)} />

                    <div className="space-y-4">
                        <div>
                            <Label>Chọn Tag</Label>
                            {loadingTags ? (
                                <div className="py-4 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                </div>
                            ) : allTags.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    Không có tag nào khả dụng
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedTagToAdd ?? ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setSelectedTagToAdd(id || null);
                                    }}
                                >
                                    <option value="">-- Chọn tag --</option>
                                    {allTags
                                        .filter(tag => !selectedTopic?.tags?.some(t => t.tagId === tag.tagId))
                                        .map(tag => (
                                            <option key={tag.tagId} value={tag.tagId}>
                                                {tag.title} - {tag.description}
                                            </option>
                                        ))}
                                </select>
                            )}
                        </div>

                        <ModalFooter
                            onCancel={() => setIsAddTagModalOpen(false)}
                            onConfirm={handleAddTagToTopic}
                            confirmText="Thêm Tag"
                            cancelText="Hủy"
                            confirmDisabled={selectedTagToAdd === null || loadingTags}
                        />
                    </div>
                </div>
            </Modal>

            {/* Remove Tag Confirmation Modal */}
            <Modal isOpen={isRemoveTagModalOpen} onClose={() => setIsRemoveTagModalOpen(false)} className="max-w-md m-4">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                            <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
                            Xóa Tag khỏi chủ đề
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Bạn có chắc chắn muốn xóa tag này khỏi chủ đề không? Hành động này không thể hoàn tác.
                        </div>
                    </div>
                    <ModalFooter
                        onCancel={() => setIsRemoveTagModalOpen(false)}
                        onConfirm={handleRemoveTagFromTopic}
                        confirmText="Xác nhận xóa"
                        cancelText="Hủy"
                        variant="danger"
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md m-4">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                            <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
                            Xác nhận xóa chủ đề
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Bạn có chắc chắn muốn xóa chủ đề này không? Tất cả dữ liệu liên quan sẽ bị mất và hành động này không thể hoàn tác.
                        </div>
                    </div>
                    <ModalFooter
                        onCancel={() => setIsDeleteModalOpen(false)}
                        onConfirm={() => deletingId && handleDelete(deletingId)}
                        confirmText="Xác nhận xóa"
                        cancelText="Hủy"
                        variant="danger"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ManageTopics;