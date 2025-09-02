import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import * as questionService from '../../services/question';
import Badge from '../../components/ui/badge/Badge';
import { CloseIcon } from '../../icons';
import TextArea from '../../components/form/input/TextArea';

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

interface Topic {
    topicId: number;
    title: string;
    description: string;
    longDescription: string | null;
    createAt: string;
    thumbnail: string | null;
    updateAt: string | null;
    isDeleted: boolean;
}

interface Tag {
    id: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    questions?: Question[];
    topics?: Topic[];
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
    const [showTopicDeleteConfirm, setShowTopicDeleteConfirm] = useState(false);
    const [deleteTopicData, setDeleteTopicData] = useState<{ tagId: number; topicId: number } | null>(null);
    const [showQuestionDeleteConfirm, setShowQuestionDeleteConfirm] = useState(false);
    const [deleteQuestionData, setDeleteQuestionData] = useState<{ tagId: number; questionId: number } | null>(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [expandedTagId, setExpandedTagId] = useState<number | null>(null);
    const [isSelectingQuestions, setIsSelectingQuestions] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [selectedTagIdForAssignment, setSelectedTagIdForAssignment] = useState<number | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');
    const [updateDifficulty, setUpdateDifficulty] = useState('');
    const [updateSuitableAnswer1, setUpdateSuitableAnswer1] = useState('');
    const [updateSuitableAnswer2, setUpdateSuitableAnswer2] = useState('');
    const [updateSource, setUpdateSource] = useState('');
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [errorUpdate, setErrorUpdate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const tagsResponse = await questionService.getAllTags();
                const tagsData = tagsResponse.data.data;
                const questionsResponse = await questionService.getTagsWithQuestions();
                const tagsWithQuestions = questionsResponse.data.data;
                const tagsWithTopics = await Promise.all(
                    tagsData.map(async (tag: Tag) => {
                        try {
                            const topicsResponse = await questionService.getTagTopics(tag.id);
                            return {
                                ...tag,
                                questions: tagsWithQuestions.find((t: Tag) => t.id === tag.id)?.questions || [],
                                topics: topicsResponse.status === 200 ? topicsResponse.data : [],
                            };
                        } catch (err) {
                            console.error(`Error fetching topics for tag ${tag.id}:`, err);
                            return {
                                ...tag,
                                questions: tagsWithQuestions.find((t: Tag) => t.id === tag.id)?.questions || [],
                                topics: [],
                            };
                        }
                    })
                );
                setTags(tagsWithTopics);
                setFilteredTags(tagsWithTopics);
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

    const fetchTopics = async (tagId: number) => {
        try {
            const response = await questionService.getTopics();
            const allTopics = response.data;
            const currentTag = tags.find(tag => tag.id === tagId);
            const existingTopicIds = currentTag?.topics?.map(topic => topic.topicId) || [];
            const availableTopics = allTopics.filter((topic: Topic) => !existingTopicIds.includes(topic.topicId));
            setTopics(availableTopics);
        } catch (err) {
            setError('Failed to fetch topics');
            console.error('Error fetching topics:', err);
        }
    };

    const handleAddTopicToTag = async () => {
        if (selectedTagId && selectedTopicId) {
            try {
                await questionService.connectTopicToTag(selectedTagId, selectedTopicId);
                const topicToAdd = topics.find(topic => topic.topicId === selectedTopicId);
                if (topicToAdd) {
                    setTags(tags.map(tag =>
                        tag.id === selectedTagId
                            ? { ...tag, topics: [...(tag.topics || []), topicToAdd] }
                            : tag
                    ));
                    setFilteredTags(filteredTags.map(tag =>
                        tag.id === selectedTagId
                            ? { ...tag, topics: [...(tag.topics || []), topicToAdd] }
                            : tag
                    ));
                }
                setShowAddTopicModal(false);
                setSelectedTopicId(null);
                setSelectedTagId(null);
                setTopics([]);
            } catch (err) {
                setError('Failed to add topic to tag');
                console.error('Error adding topic to tag:', err);
            }
        }
    };

    const openAddTopicModal = (tagId: number) => {
        setSelectedTagId(tagId);
        setShowAddTopicModal(true);
        fetchTopics(tagId);
    };

    const handleRemoveTopic = async (tagId: number, topicId: number) => {
        try {
            await questionService.removeTopicFromTag(tagId, topicId);
            setTags(tags.map(tag => {
                if (tag.id === tagId) {
                    return {
                        ...tag,
                        topics: tag.topics?.filter(t => t.topicId !== topicId) || []
                    };
                }
                return tag;
            }));
            setFilteredTags(filteredTags.map(tag => {
                if (tag.id === tagId) {
                    return {
                        ...tag,
                        topics: tag.topics?.filter(t => t.topicId !== topicId) || []
                    };
                }
                return tag;
            }));
        } catch (err) {
            setError('Error removing topic from tag');
            console.error('Error removing topic from tag:', err);
        }
    };

    const handleRemoveQuestion = async (tagId: number, questionId: number) => {
        try {
            await questionService.deleteTagFromQuestion(questionId, tagId);
            setTags(tags.map(tag => {
                if (tag.id === tagId) {
                    return {
                        ...tag,
                        questions: tag.questions?.filter(q => q.questionId !== questionId) || []
                    };
                }
                return tag;
            }));
            setFilteredTags(filteredTags.map(tag => {
                if (tag.id === tagId) {
                    return {
                        ...tag,
                        questions: tag.questions?.filter(q => q.questionId !== questionId) || []
                    };
                }
                return tag;
            }));
        } catch (err) {
            setError('Error removing question from tag');
            console.error('Error removing question from tag:', err);
        }
    };

    const requestTopicDelete = (tagId: number, topicId: number) => {
        setDeleteTopicData({ tagId, topicId });
        setShowTopicDeleteConfirm(true);
    };

    const confirmTopicDelete = async () => {
        if (deleteTopicData) {
            try {
                await handleRemoveTopic(deleteTopicData.tagId, deleteTopicData.topicId);
            } finally {
                setShowTopicDeleteConfirm(false);
                setDeleteTopicData(null);
            }
        }
    };

    const requestQuestionDelete = (tagId: number, questionId: number) => {
        setDeleteQuestionData({ tagId, questionId });
        setShowQuestionDeleteConfirm(true);
    };

    const confirmQuestionDelete = async () => {
        if (deleteQuestionData) {
            try {
                await handleRemoveQuestion(deleteQuestionData.tagId, deleteQuestionData.questionId);
            } finally {
                setShowQuestionDeleteConfirm(false);
                setDeleteQuestionData(null);
            }
        }
    };

    const handleOpenUpdateModal = async (questionId: number) => {
        setLoadingUpdate(true);
        setErrorUpdate('');
        try {
            const response = await questionService.getQuestionDetail(questionId);
            const question = response.data;
            setUpdateQuestionId(questionId);
            setUpdateTitle(question.title);
            setUpdateContent(question.content);
            setUpdateDifficulty(question.difficulty);
            setUpdateSuitableAnswer1(question.suitableAnswer1);
            setUpdateSuitableAnswer2(question.suitableAnswer2 || '');
            setUpdateSource(question.source || '');
            setIsUpdateModalOpen(true);
        } catch (err) {
            setErrorUpdate('Failed to load question details');
            console.error('Error fetching question details:', err);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleUpdateQuestion = async () => {
        if (!updateQuestionId || !updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1) return;

        setLoadingUpdate(true);
        setErrorUpdate('');
        try {
            await questionService.updateQuestion(updateQuestionId, {
                title: updateTitle,
                content: updateContent,
                suitableAnswer1: updateSuitableAnswer1,
                suitableAnswer2: updateSuitableAnswer2,
                difficulty: updateDifficulty,
                source: updateSource,
            });

            setTags((prev) =>
                prev.map((tag) => ({
                    ...tag,
                    questions: tag.questions?.map((q) =>
                        q.questionId === updateQuestionId
                            ? {
                                ...q,
                                title: updateTitle,
                                content: updateContent,
                                difficulty: updateDifficulty,
                                suitableAnswer1: updateSuitableAnswer1,
                                suitableAnswer2: updateSuitableAnswer2,
                                source: updateSource,
                            }
                            : q
                    ) || [],
                }))
            );
            setFilteredTags((prev) =>
                prev.map((tag) => ({
                    ...tag,
                    questions: tag.questions?.map((q) =>
                        q.questionId === updateQuestionId
                            ? {
                                ...q,
                                title: updateTitle,
                                content: updateContent,
                                difficulty: updateDifficulty,
                                suitableAnswer1: updateSuitableAnswer1,
                                suitableAnswer2: updateSuitableAnswer2,
                                source: updateSource,
                            }
                            : q
                    ) || [],
                }))
            );
            setIsUpdateModalOpen(false);
            setUpdateQuestionId(null);
        } catch (err) {
            setErrorUpdate('Failed to update question');
            console.error('Error updating question:', err);
        } finally {
            setLoadingUpdate(false);
        }
    };

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
                await questionService.deleteTag(deleteId);
                setTags(tags.filter(tag => tag.id !== deleteId));
                setFilteredTags(filteredTags.filter(tag => tag.id !== deleteId));
            } catch (err) {
                setError('Failed to delete tag');
                console.error('Error deleting tag:', err);
            } finally {
                setShowDeleteConfirm(false);
                setDeleteId(null);
            }
        }
    };

    const requestRestore = (id: number) => {
        setRestoreId(id);
        setShowRestoreConfirm(true);
    };

    const confirmRestore = async () => {
        if (restoreId) {
            try {
                await questionService.restoreTag(restoreId);
                setTags(tags.map(tag => tag.id === restoreId ? { ...tag, isDeleted: false, updateAt: new Date().toISOString() } : tag));
                setFilteredTags(filteredTags.map(tag => tag.id === restoreId ? { ...tag, isDeleted: false, updateAt: new Date().toISOString() } : tag));
            } catch (err) {
                setError('Failed to restore tag');
                console.error('Error restoring tag:', err);
            } finally {
                setShowRestoreConfirm(false);
                setRestoreId(null);
            }
        }
    };

    const handleSave = async () => {
        if (!tagTitle) {
            setError('Tag title is required');
            return;
        }

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
                const response = await questionService.updateTag(editingTag.id, updateData);
                const updatedTag = response.data.data;
                setTags(tags.map(tag => tag.id === editingTag.id ? { ...updatedTag, questions: tag.questions, topics: tag.topics } : tag));
                setFilteredTags(filteredTags.map(tag => tag.id === editingTag.id ? { ...updatedTag, questions: tag.questions, topics: tag.topics } : tag));
            } else {
                const newTagData = {
                    id: 0,
                    title: tagTitle,
                    description: tagDescription,
                    createAt: currentDate,
                    updateAt: currentDate,
                    isDeleted: false
                };
                const response = await questionService.createTag(newTagData);
                const newTag = response.data.data;
                setTags([...tags, { ...newTag, questions: [], topics: [] }]);
                setFilteredTags([...filteredTags, { ...newTag, questions: [], topics: [] }]);
            }
            setIsModalOpen(false);
            setError('');
        } catch (err) {
            setError('Error saving tag');
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
            await questionService.assignTagToQuestions(selectedTagIdForAssignment, selectedQuestionIds);
            setSelectedQuestionIds([]);
            setSelectedTagIdForAssignment(null);
            setIsSelectingQuestions(false);
        } catch (err) {
            setError('Error assigning tag to questions');
            console.error('Error assigning tag to questions:', err);
        }
    };

    return (
        <>
            <PageMeta
                title="Manage Tags"
                description="Tag management page in the system"
            />
            <PageBreadcrumb pageTitle="Tags" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Manage Tags
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setIsSelectingQuestions(!isSelectingQuestions);
                                    setSelectedQuestionIds([]);
                                }}
                            >
                                {isSelectingQuestions ? 'Cancel Question Selection' : 'Select Questions'}
                            </Button>
                            <Button onClick={openAddModal}>
                                Add New Tag
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search tags by name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Loading tags...
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
                                                        Created: {new Date(tag.createAt).toLocaleDateString()}
                                                    </span>
                                                    {tag.updateAt && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • Updated: {new Date(tag.updateAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <Badge
                                                        variant="light"
                                                        color={tag.isDeleted ? "error" : "success"}
                                                    >
                                                        {tag.isDeleted ? "Deleted" : "Active"}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        <span>Topics:</span>
                                                        <button
                                                            className="text-blue-500 hover:text-blue-700"
                                                            onClick={() => openAddTopicModal(tag.id)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {tag.topics && tag.topics.length > 0 ? (
                                                            tag.topics.map(topic => (
                                                                <Badge
                                                                    key={topic.topicId}
                                                                    variant="light"
                                                                    color="info"
                                                                    endIcon={
                                                                        <CloseIcon
                                                                            className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                requestTopicDelete(tag.id, topic.topicId);
                                                                            }}
                                                                        />
                                                                    }
                                                                >
                                                                    {topic.title}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                No topics
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {!tag.isDeleted && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditModal(tag)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {tag.isDeleted ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => requestRestore(tag.id)}
                                                    >
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => requestDelete(tag.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {expandedTagId === tag.id && (
                                            <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                                                <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-3">
                                                    Questions
                                                </h5>
                                                {tag.questions && tag.questions.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {tag.questions.map((question) => (
                                                            <div
                                                                key={question.questionId}
                                                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3 relative"
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
                                                                                Difficulty: {question.difficulty}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                Tags: {question.tags.map(t => t.title).join(', ')}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">ID: {question.questionId}</span>
                                                                            <button
                                                                                className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150"
                                                                                title="Edit question"
                                                                                onClick={() => handleOpenUpdateModal(question.questionId)}
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                                                                title="Remove question from tag"
                                                                                onClick={() => requestQuestionDelete(tag.id, question.questionId)}
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        No questions related to this tag.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No tags found matching your search criteria.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isSelectingQuestions && selectedQuestionIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                    <span className="pl-80 text-gray-800 dark:text-white/90">
                        Selected {selectedQuestionIds.length} questions
                    </span>
                    <div className="flex items-center gap-3">
                        <select
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-white/90"
                            value={selectedTagIdForAssignment || ''}
                            onChange={(e) => setSelectedTagIdForAssignment(Number(e.target.value) || null)}
                        >
                            <option value="">Select tag to assign</option>
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
                            Assign Tag
                        </Button>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        {editingTag ? 'Edit Tag' : 'Add New Tag'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Tag Name*</Label>
                            <Input
                                value={tagTitle}
                                onChange={(e) => setTagTitle(e.target.value)}
                                placeholder="Enter tag name"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                                rows={4}
                                value={tagDescription}
                                onChange={(e) => setTagDescription(e.target.value)}
                                placeholder="Enter tag description"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTag ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete Tag
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this tag? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete}>
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showTopicDeleteConfirm} onClose={() => setShowTopicDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete Topic
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to remove this topic from the tag? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowTopicDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmTopicDelete}>
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showQuestionDeleteConfirm} onClose={() => setShowQuestionDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Remove Question
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to remove this question from the tag? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowQuestionDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmQuestionDelete}>
                            Confirm Remove
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showRestoreConfirm} onClose={() => setShowRestoreConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Restore Tag
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to restore this tag? This will make the tag active again.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmRestore}>
                            Confirm Restore
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showAddTopicModal} onClose={() => setShowAddTopicModal(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Add Topic to Tag
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        Select a topic to add to the tag.
                    </p>
                    <div className="mb-4">
                        <Label>Select Topic</Label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                            value={selectedTopicId || ''}
                            onChange={(e) => setSelectedTopicId(Number(e.target.value) || null)}
                        >
                            <option value="">Select a topic</option>
                            {topics.map(topic => (
                                <option key={topic.topicId} value={topic.topicId}>
                                    {topic.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && (
                        <div className="text-red-500 dark:text-red-400 text-sm mb-4">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowAddTopicModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTopicToTag}
                            disabled={!selectedTopicId}
                        >
                            Add Topic
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Update Question
                    </h3>
                    {loadingUpdate && (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading question data...
                        </div>
                    )}
                    {errorUpdate && (
                        <div className="py-4 text-center text-red-500 dark:text-red-400">
                            {errorUpdate}
                        </div>
                    )}
                    {!loadingUpdate && (
                        <div className="space-y-4">
                            <div>
                                <Label>Question title</Label>
                                <Input
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    placeholder="Enter question title"
                                />
                            </div>
                            <div>
                                <Label>Question content</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={4}
                                    value={updateContent}
                                    onChange={setUpdateContent}
                                    placeholder="Enter detailed question content"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Difficulty</Label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        value={updateDifficulty}
                                        onChange={(e) => setUpdateDifficulty(e.target.value)}
                                    >
                                        <option value="">-- Select difficulty --</option>
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Source (optional)</Label>
                                    <Input
                                        value={updateSource}
                                        onChange={(e) => setUpdateSource(e.target.value)}
                                        placeholder="Enter source"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Suitable answer 1</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={2}
                                    value={updateSuitableAnswer1}
                                    onChange={setUpdateSuitableAnswer1}
                                    placeholder="Enter sample answer"
                                />
                            </div>
                            <div>
                                <Label>Suitable answer 2</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={2}
                                    value={updateSuitableAnswer2}
                                    onChange={setUpdateSuitableAnswer2}
                                    placeholder="Enter second sample answer"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateQuestion}
                                    disabled={!updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1}
                                >
                                    Update Question
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default ManageTags;