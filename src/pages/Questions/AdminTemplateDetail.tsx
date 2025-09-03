import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import * as templateService from '../../services/template';
import * as questionService from '../../services/question';
import * as topicService from '../../services/topic';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Label from '../../components/form/Label';
import TemplateEditModal from './TemplateEditModal';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon } from '../../icons';

interface Topic {
    topicId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface Tag {
    tagId: number;
    title: string;
    description?: string;
    createAt?: string;
    updateAt?: string | null;
    isDeleted?: boolean;
}

interface Question {
    questionId: number;
    title: string;
    content: string;
    suitableAnswer1: string;
    suitableAnswer2: string;
    embeddedVector: null;
    difficulty: string;
    questionStatus: string;
    source: string;
    is_deleted: boolean;
}

interface Session {
    interviewSessionId: number;
    topic: Topic;
    title: string;
    description: string;
    interviewSessionThumbnail: string | null;
    totalQuestion: number;
    difficulty: string;
    durationEstimate: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
    source: string;
    tags: Tag[];
    questions: Question[];
}

const getDifficultyColor = (difficulty: string): BadgeColor => {
    switch (difficulty) {
        case 'EASY':
            return 'success';
        case 'MEDIUM':
            return 'warning';
        case 'HARD':
            return 'error';
        default:
            return 'light';
    }
};

const AdminTemplateDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    const [confirmDelete, setConfirmDelete] = useState<{ questionId: number } | null>(null);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailError, setThumbnailError] = useState('');
    const [thumbnailLoading, setThumbnailLoading] = useState(false);
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [loadingAvailableQuestions, setLoadingAvailableQuestions] = useState(false);
    const [errorAvailableQuestions, setErrorAvailableQuestions] = useState('');
    const [addingQuestions, setAddingQuestions] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await templateService.getInterviewSessionById(Number(id));
                console.log('getInterviewSessionById response:', response.data);
                setSession(response.data.data);
            } catch (err) {
                setError('Failed to fetch template details');
                console.error('Error fetching template details:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchSession();
        }
    }, [id]);

    const handleDetailSave = (updatedSession: Session) => {
        setSession(updatedSession);
        setIsEditModalOpen(false);
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

            setSession((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    questions: prev.questions.map((q) =>
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
                    ),
                };
            });
            setIsUpdateModalOpen(false);
            setUpdateQuestionId(null);
        } catch (err) {
            setErrorUpdate('Failed to update question');
            console.error('Error updating question:', err);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleRemoveQuestion = async () => {
        if (!confirmDelete || !session) return;
        const { questionId } = confirmDelete;
        try {
            await questionService.removeQuestionFromSession(session.interviewSessionId, questionId);
            console.log('Removed question:', questionId, 'from session:', session.interviewSessionId);
            setSession((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    questions: prev.questions.filter((q) => q.questionId !== questionId),
                    totalQuestion: prev.totalQuestion - 1,
                };
            });
        } catch (err) {
            console.error('Failed to remove question from session:', err);
            setError('Error removing question');
        }
        setConfirmDelete(null);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnailFile(e.target.files[0]);
            setThumbnailError('');
        }
    };

    const handleThumbnailUpload = async () => {
        if (!thumbnailFile || !session) return;
        setThumbnailLoading(true);
        setThumbnailError('');
        try {
            const response = await topicService.uploadImage(thumbnailFile);
            const thumbnailUrl = response[0];
            console.log('Thumbnail URL before update:', thumbnailUrl);

            await templateService.updateInterviewSessionThumbnail(session.interviewSessionId, {
                thumbnailURL: thumbnailUrl,
            });

            setSession((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    interviewSessionThumbnail: thumbnailUrl,
                };
            });
            setIsThumbnailModalOpen(false);
            setThumbnailFile(null);
        } catch (err) {
            setThumbnailError('Failed to upload thumbnail');
            console.error('Error uploading thumbnail:', err);
        } finally {
            setThumbnailLoading(false);
        }
    };

    const handleOpenAddQuestionsModal = async () => {
        if (!session) return;
        setLoadingAvailableQuestions(true);
        setErrorAvailableQuestions('');
        try {
            const response = await templateService.getAvailableQuestionsForSession(session.interviewSessionId);
            setAvailableQuestions(response.data.data || []); // Assuming response.data.data is an array of questions
            setSelectedQuestionIds([]);
            setIsAddQuestionsModalOpen(true);
        } catch (err) {
            setErrorAvailableQuestions('Failed to fetch available questions');
            console.error('Error fetching available questions:', err);
        } finally {
            setLoadingAvailableQuestions(false);
        }
    };

    const handleSelectQuestion = (questionId: number) => {
        setSelectedQuestionIds((prev) =>
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleAddQuestions = async () => {
        if (!session || selectedQuestionIds.length === 0) return;
        setAddingQuestions(true);
        try {
            await templateService.addQuestionsToSession(session.interviewSessionId, selectedQuestionIds);
            // Fetch updated session to reflect new questions
            const response = await templateService.getInterviewSessionById(session.interviewSessionId);
            setSession(response.data.data);
            setIsAddQuestionsModalOpen(false);
            setSelectedQuestionIds([]);
        } catch (err) {
            setErrorAvailableQuestions('Failed to add questions to session');
            console.error('Error adding questions to session:', err);
        } finally {
            setAddingQuestions(false);
        }
    };

    const toggleQuestions = () => {
        setExpanded(!expanded);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading template details...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{error || 'Template not found'}</h3>
                    <Button
                        variant="primary"
                        className="mt-4"
                        onClick={() => navigate('/manage-interview-template')}
                    >
                        Back to Templates
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta title={`Template: ${session.title}`} description="View details of an admin interview template" />
            <PageBreadcrumb pageTitle="Template Details" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Back Button and Action Buttons */}
                <div className="mb-6">
                    <button
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
                        onClick={() => navigate('/manage-interview-template')}
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        Back to Templates
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Template Details
                        </h1>
                        <div className="flex gap-3">
                            <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>
                                Edit Template
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Section */}
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg relative">
                    {session.interviewSessionThumbnail ? (
                        <>
                            <img
                                src={session.interviewSessionThumbnail}
                                alt={`${session.title} thumbnail`}
                                className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <button
                                className="absolute top-2 right-2 p-2 text-gray-400 opacity-50 hover:opacity-100 hover:text-blue-500 transition-all duration-150 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Edit thumbnail"
                                onClick={() => setIsThumbnailModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 h-64 flex items-center justify-center relative">
                            <div className="text-center p-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white/30 dark:bg-gray-600/30 mb-4">
                                    <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No thumbnail available</p>
                            </div>
                            <button
                                className="absolute top-2 right-2 p-2 text-gray-400 opacity-50 hover:opacity-100 hover:text-blue-500 transition-all duration-150 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Edit thumbnail"
                                onClick={() => setIsThumbnailModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg overflow-hidden">
                    <div className="p-6 lg:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {session.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        ID: {session.interviewSessionId}
                                    </p>
                                </div>
                                <Badge
                                    variant="solid"
                                    color={getDifficultyColor(session.difficulty)}
                                    size="md"
                                >
                                    {session.difficulty}
                                </Badge>
                            </div>

                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {session.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Topic</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{session.topic.title}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Total Questions</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{session.totalQuestion}</span>
                                </div>
                                {/* <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Duration Estimate</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{session.durationEstimate}</span>
                                </div> */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Created At</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{new Date(session.createAt).toLocaleDateString()}</span>
                                </div>
                                {session.updateAt && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Updated At</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">{new Date(session.updateAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Source</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{session.source}</span>
                                </div>
                            </div>

                            <div className="py-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Tags</span>
                                <div className="flex flex-wrap gap-2">
                                    {session.tags.map((tag) => (
                                        <Badge
                                            key={tag.tagId}
                                            variant="light"
                                            color="primary"
                                            size="md"
                                        >
                                            {tag.title}
                                        </Badge>
                                    ))}
                                    {session.tags.length === 0 && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">No tags available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-8">
                        <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3" onClick={toggleQuestions}>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Question List</h4>
                                <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {session.questions?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="primary" onClick={handleOpenAddQuestionsModal}>
                                    Add Questions
                                </Button>
                                <button
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                                    title={expanded ? 'Collapse questions' : 'Expand questions'}
                                    onClick={toggleQuestions}
                                >
                                    {expanded ? (
                                        <ChevronUpIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {expanded && (
                            <div className="mt-6 space-y-4">
                                {(session.questions?.length > 0) ? (
                                    session.questions.map((question, index) => (
                                        <div
                                            key={question.questionId}
                                            className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                                        <h6 className="text-base font-semibold text-gray-900 dark:text-white">{question.title}</h6>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{question.content}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty:</span>
                                                            <Badge variant="light" color={getDifficultyColor(question.difficulty)} size="sm">
                                                                {question.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">Source:</span>
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{question.source}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{question.questionStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-150 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                        title="Edit question"
                                                        onClick={() => handleOpenUpdateModal(question.questionId)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-150 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        title="Remove question from template"
                                                        onClick={() => setConfirmDelete({ questionId: question.questionId })}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No questions</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no questions in this session.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TemplateEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                session={session}
                onSave={handleDetailSave}
                title="Edit Template Details"
            />

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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <Label>Question content</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Suitable answer 1</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    rows={2}
                                    value={updateSuitableAnswer1}
                                    onChange={setUpdateSuitableAnswer1}
                                    placeholder="Enter sample answer"
                                />
                            </div>
                            <div>
                                <Label>Suitable answer 2</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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

            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                className="max-w-md"
            >
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900 text-center">
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
                        Confirm Delete Question
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to remove this question from the template?
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleRemoveQuestion}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Thumbnail Upload Modal */}
            <Modal
                isOpen={isThumbnailModalOpen}
                onClose={() => {
                    setIsThumbnailModalOpen(false);
                    setThumbnailFile(null);
                    setThumbnailError('');
                }}
                className="max-w-md"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Update Thumbnail
                    </h3>
                    {thumbnailError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                            {thumbnailError}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="thumbnail">Select Thumbnail Image</Label>
                            <Input
                                type="file"
                                id="thumbnail"
                                onChange={handleThumbnailChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsThumbnailModalOpen(false);
                                    setThumbnailFile(null);
                                    setThumbnailError('');
                                }}
                                disabled={thumbnailLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleThumbnailUpload}
                                disabled={!thumbnailFile || thumbnailLoading}
                            >
                                {thumbnailLoading ? 'Uploading...' : 'Upload Thumbnail'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Questions Modal */}
            <Modal
                isOpen={isAddQuestionsModalOpen}
                onClose={() => {
                    setIsAddQuestionsModalOpen(false);
                    setAvailableQuestions([]);
                    setSelectedQuestionIds([]);
                    setErrorAvailableQuestions('');
                }}
                className="max-w-2xl"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Add Questions to Template
                    </h3>
                    {loadingAvailableQuestions && (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading available questions...
                        </div>
                    )}
                    {errorAvailableQuestions && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                            {errorAvailableQuestions}
                        </div>
                    )}
                    {!loadingAvailableQuestions && availableQuestions.length > 0 && (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {availableQuestions.map((question) => (
                                <div
                                    key={question.questionId}
                                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedQuestionIds.includes(question.questionId)}
                                        onChange={() => handleSelectQuestion(question.questionId)}
                                        className="h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold text-gray-900 dark:text-white">{question.title}</span>
                                            <Badge variant="light" color={getDifficultyColor(question.difficulty)} size="sm">
                                                {question.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{question.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loadingAvailableQuestions && availableQuestions.length === 0 && (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            No available questions found.
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddQuestionsModalOpen(false);
                                setAvailableQuestions([]);
                                setSelectedQuestionIds([]);
                                setErrorAvailableQuestions('');
                            }}
                            disabled={addingQuestions}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddQuestions}
                            disabled={selectedQuestionIds.length === 0 || addingQuestions}
                        >
                            {addingQuestions ? 'Adding...' : 'Add Selected Questions'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AdminTemplateDetail;