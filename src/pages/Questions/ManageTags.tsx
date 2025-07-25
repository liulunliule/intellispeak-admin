import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import api from '../../services/api';

interface Question {
    questionId: number;
    title: string;
    content: string;
    difficulty: string;
    suitableAnswer1: string;
    suitableAnswer2: string;
    tags: Array<{ tagId: number; title: string; description: string; createAt: string; updateAt: string | null; isDeleted: boolean }>;
    deleted: boolean;
}

interface Tag {
    id: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    questions?: Question[];
}

const ManageTags: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [tagTitle, setTagTitle] = useState('');
    const [tagDescription, setTagDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [expandedTagId, setExpandedTagId] = useState<number | null>(null);
    const [isSelectingQuestions, setIsSelectingQuestions] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [selectedTagIdForAssignment, setSelectedTagIdForAssignment] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const tagsResponse = await api.get('/tag');
                if (tagsResponse.data.code === 200) {
                    const tagsData = tagsResponse.data.data;
                    const questionsResponse = await api.get('/tag/with-questions');
                    if (questionsResponse.data.code === 200) {
                        const tagsWithQuestions = questionsResponse.data.data;
                        const mergedTags = tagsData.map((tag: Tag) => {
                            const tagWithQuestions = tagsWithQuestions.find((t: Tag) => t.id === tag.id);
                            return {
                                ...tag,
                                questions: tagWithQuestions ? tagWithQuestions.questions || [] : []
                            };
                        });
                        setTags(mergedTags);
                        setFilteredTags(mergedTags);
                    } else {
                        setError(questionsResponse.data.message || 'Failed to fetch questions');
                    }
                } else {
                    setError(tagsResponse.data.message || 'Failed to fetch tags');
                }
            } catch (err) {
                setError('Error fetching data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = tags.filter(tag =>
            tag.title.toLowerCase().includes(search.toLowerCase()) ||
            tag.description.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTags(filtered);
    }, [search, tags]);

    const openAddModal = () => {
        setEditingTag(null);
        setTagTitle('');
        setTagDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (tag: Tag) => {
        setEditingTag(tag);
        setTagTitle(tag.title);
        setTagDescription(tag.description || '');
        setIsModalOpen(true);
    };

    const requestDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await api.delete(`/tag/${deleteId}`);
                setTags(tags.filter(tag => tag.id !== deleteId));
            } catch (err) {
                console.error('Error deleting tag:', err);
            } finally {
                setShowDeleteConfirm(false);
            }
        }
    };

    const handleSave = async () => {
        if (!tagTitle) return;

        try {
            const currentDate = new Date().toISOString();

            if (editingTag) {
                const updateData = {
                    id: editingTag.id,
                    title: tagTitle,
                    description: tagDescription,
                    createAt: editingTag.createAt,
                    updateAt: currentDate,
                    isDeleted: false
                };

                const response = await api.put(`/tag/${editingTag.id}`, updateData);
                const updatedTag = response.data.data;
                setTags(tags.map(tag => tag.id === editingTag.id ? { ...updatedTag, questions: tag.questions } : tag));
            } else {
                const newTagData = {
                    id: 0,
                    title: tagTitle,
                    description: tagDescription,
                    createAt: currentDate,
                    updateAt: currentDate,
                    isDeleted: false
                };

                const response = await api.post('/tag', newTagData);
                const newTag = response.data.data;
                setTags([...tags, { ...newTag, questions: [] }]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving tag:', err);
        }
    };

    const toggleTagQuestions = (tagId: number) => {
        setExpandedTagId(expandedTagId === tagId ? null : tagId);
    };

    const toggleQuestionSelection = (questionId: number) => {
        setSelectedQuestionIds(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const assignTagToQuestions = async () => {
        if (!selectedTagIdForAssignment || selectedQuestionIds.length === 0) return;

        try {
            await api.put(`/tag/${selectedTagIdForAssignment}/questions`, selectedQuestionIds);
            // Update local state to reflect the new tag assignments
            const updatedTags = tags.map(tag => {
                if (tag.id === selectedTagIdForAssignment) {
                    const updatedQuestions = tag.questions ? [...tag.questions] : [];
                    selectedQuestionIds.forEach(qId => {
                        const question = tags
                            .flatMap(t => t.questions || [])
                            .find(q => q.questionId === qId);
                        if (question && !updatedQuestions.some(q => q.questionId === qId)) {
                            updatedQuestions.push({
                                ...question,
                                tags: [...question.tags, {
                                    tagId: tag.id,
                                    title: tag.title,
                                    description: tag.description,
                                    createAt: tag.createAt,
                                    updateAt: tag.updateAt,
                                    isDeleted: tag.isDeleted
                                }]
                            });
                        }
                    });
                    return { ...tag, questions: updatedQuestions };
                }
                return tag;
            });
            setTags(updatedTags);
            setSelectedQuestionIds([]);
            setSelectedTagIdForAssignment(null);
            setIsSelectingQuestions(false);
        } catch (err) {
            console.error('Error assigning tag to questions:', err);
        }
    };

    return (
        <>
            <PageMeta
                title="Quản lý Tags"
                description="Trang quản lý các tags trong hệ thống"
            />
            <PageBreadcrumb pageTitle="Tags" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Quản lý Tags
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setIsSelectingQuestions(!isSelectingQuestions);
                                    setSelectedQuestionIds([]);
                                }}
                            >
                                {isSelectingQuestions ? 'Hủy chọn câu hỏi' : 'Chọn câu hỏi'}
                            </Button>
                            <Button onClick={openAddModal}>
                                Thêm Tag mới
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm tag theo tên hoặc mô tả..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Đang tải danh sách tags...
                        </div>
                    )}

                    {error && (
                        <div className="py-8 text-center text-red-500 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-4">
                            {filteredTags.length > 0 ? (
                                filteredTags.map((tag) => (
                                    <div key={tag.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4
                                                        className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90 cursor-pointer"
                                                        onClick={() => toggleTagQuestions(tag.id)}
                                                    >
                                                        {tag.title}
                                                    </h4>
                                                    <span
                                                        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                                                        onClick={() => toggleTagQuestions(tag.id)}
                                                    >
                                                        {expandedTagId === tag.id ? '▲' : '▼'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {tag.description}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Tạo: {new Date(tag.createAt).toLocaleDateString()}
                                                    </span>
                                                    {tag.updateAt && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • Cập nhật: {new Date(tag.updateAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(tag)}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => requestDelete(tag.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        </div>
                                        {expandedTagId === tag.id && (
                                            <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                                                <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-3">
                                                    Danh sách câu hỏi
                                                </h5>
                                                {tag.questions && tag.questions.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {tag.questions.map((question) => (
                                                            <div
                                                                key={question.questionId}
                                                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3"
                                                            >
                                                                {isSelectingQuestions && (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedQuestionIds.includes(question.questionId)}
                                                                        onChange={() => toggleQuestionSelection(question.questionId)}
                                                                        className="mt-1"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h6 className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                                                {question.title}
                                                                            </h6>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                                {question.content}
                                                                            </p>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                                Độ khó: {question.difficulty}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                Tags: {question.tags.map(t => t.title).join(', ')}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                            ID: {question.questionId}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Không có câu hỏi nào liên quan đến tag này.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    Không tìm thấy tag nào phù hợp với tiêu chí tìm kiếm.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isSelectingQuestions && selectedQuestionIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                    <span className="pl-80 text-gray-800 dark:text-white/90">
                        Đã chọn {selectedQuestionIds.length} câu hỏi
                    </span>
                    <div className="flex items-center gap-3">
                        <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-white/90"
                            value={selectedTagIdForAssignment || ''}
                            onChange={(e) => setSelectedTagIdForAssignment(Number(e.target.value) || null)}
                        >
                            <option value="">Chọn tag để gán</option>
                            {tags.map(tag => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.title}
                                </option>
                            ))}
                        </select>
                        <Button
                            onClick={assignTagToQuestions}
                            disabled={!selectedTagIdForAssignment}
                        >
                            Gán Tag
                        </Button>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        {editingTag ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Tên Tag*</Label>
                            <Input
                                value={tagTitle}
                                onChange={(e) => setTagTitle(e.target.value)}
                                placeholder="Nhập tên tag"
                            />
                        </div>

                        <div>
                            <Label>Mô tả</Label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                                rows={4}
                                value={tagDescription}
                                onChange={(e) => setTagDescription(e.target.value)}
                                placeholder="Nhập mô tả tag"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTag ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Xóa Tag
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Bạn có chắc chắn muốn xóa tag này không? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Hủy
                        </Button>
                        <Button onClick={confirmDelete}>
                            Xác nhận xóa
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManageTags;