import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as questionService from '../../services/question';
import * as templateService from '../../services/template';
import AddTemplateModal from './AddTemplateModal';
import TextArea from '../../components/form/input/TextArea';
import Label from '../../components/form/Label';
import { ChevronUpIcon, ChevronDownIcon } from '../../icons';

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

const AdminTemplateManagement: React.FC<{ onAddTemplate: (newSession: Session) => void }> = ({ onAddTemplate }) => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ sessionId: number; questionId: number } | null>(null);
    const [confirmDeleteSession, setConfirmDeleteSession] = useState<number | null>(null);
    const [confirmRestoreSession, setConfirmRestoreSession] = useState<number | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
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
    const [isTemplateListCollapsed, setIsTemplateListCollapsed] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await templateService.getAllAdminInterviews();
                console.log('getAdminInterviews response:', response.data);
                const normalizedSessions = response.data.data.map((session: Session) => ({
                    ...session,
                    questions: session.questions || [],
                }));
                setSessions(normalizedSessions);
                setFilteredSessions(normalizedSessions);
            } catch (err) {
                setError('Error fetching admin templates');
                console.error('Error fetching admin templates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    useEffect(() => {
        const filtered = sessions.filter(
            (session) =>
                session.title.toLowerCase().includes(search.toLowerCase()) ||
                session.description.toLowerCase().includes(search.toLowerCase()) ||
                session.topic.title.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredSessions(filtered);
    }, [search, sessions]);

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleViewAdminTemplate = (sessionId: number) => {
        console.log('Navigating to admin template details with sessionId:', sessionId);
        navigate(`/detail-admin-template/${sessionId}`);
    };

    const handleSave = (newSession: Session) => {
        console.log('Saving new session:', newSession);
        const normalizedSession = { ...newSession, questions: newSession.questions || [] };
        setSessions([...sessions, normalizedSession]);
        setFilteredSessions([...filteredSessions, normalizedSession]);
        onAddTemplate(normalizedSession);
        setIsAddModalOpen(false);
    };

    const handleRemoveQuestion = async () => {
        if (!confirmDelete) return;
        const { sessionId, questionId } = confirmDelete;
        try {
            await questionService.removeQuestionFromSession(sessionId, questionId);
            console.log('Removed question:', questionId, 'from session:', sessionId);
            setSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === sessionId
                        ? { ...session, questions: session.questions.filter((q) => q.questionId !== questionId), totalQuestion: session.totalQuestion - 1 }
                        : session
                )
            );
            setFilteredSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === sessionId
                        ? { ...session, questions: session.questions.filter((q) => q.questionId !== questionId), totalQuestion: session.totalQuestion - 1 }
                        : session
                )
            );
        } catch (err) {
            console.error('Failed to remove question from session:', err);
            setError('Error removing question');
        }
        setConfirmDelete(null);
    };

    const handleRemoveSession = async () => {
        if (!confirmDeleteSession) return;
        try {
            await templateService.deleteSession(confirmDeleteSession);
            console.log('Removed session:', confirmDeleteSession);
            setSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === confirmDeleteSession
                        ? { ...session, isDeleted: true }
                        : session
                )
            );
            setFilteredSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === confirmDeleteSession
                        ? { ...session, isDeleted: true }
                        : session
                )
            );
        } catch (err) {
            console.error('Failed to remove session:', err);
            setError('Error removing session');
        }
        setConfirmDeleteSession(null);
    };

    const handleRestoreSession = async () => {
        if (!confirmRestoreSession) return;
        try {
            await templateService.restoreSession(confirmRestoreSession);
            console.log('Restored session:', confirmRestoreSession);
            setSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === confirmRestoreSession
                        ? { ...session, isDeleted: false }
                        : session
                )
            );
            setFilteredSessions((prev) =>
                prev.map((session) =>
                    session.interviewSessionId === confirmRestoreSession
                        ? { ...session, isDeleted: false }
                        : session
                )
            );
        } catch (err) {
            console.error('Failed to restore session:', err);
            setError('Error restoring session');
        }
        setConfirmRestoreSession(null);
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

            setSessions((prev) =>
                prev.map((session) => ({
                    ...session,
                    questions: session.questions.map((q) =>
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
                }))
            );
            setFilteredSessions((prev) =>
                prev.map((session) => ({
                    ...session,
                    questions: session.questions.map((q) =>
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

    const toggleSessionQuestions = (sessionId: number) => {
        setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
    };

    const toggleTemplateList = () => {
        setIsTemplateListCollapsed(!isTemplateListCollapsed);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTemplateList}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-150"
                            title={isTemplateListCollapsed ? 'Expand admin template list' : 'Collapse admin template list'}
                        >
                            {isTemplateListCollapsed ? (
                                <ChevronDownIcon className="w-5 h-5" />
                            ) : (
                                <ChevronUpIcon className="w-5 h-5" />
                            )}
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Interview Admin Template Management
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd}>Add New Template</Button>
                    </div>
                </div>

                {!isTemplateListCollapsed && (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search admin templates by name, description, or topic..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {loading && !sessions.length && (
                            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                Loading admin template list...
                            </div>
                        )}

                        {error && (
                            <div className="py-8 text-center text-red-500 dark:text-red-400">{error}</div>
                        )}

                        {!loading && !error && (
                            <div className="space-y-4">
                                {filteredSessions.length > 0 ? (
                                    filteredSessions.map((session) => (
                                        <div
                                            key={session.interviewSessionId}
                                            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 relative group"
                                            onClick={() => handleViewAdminTemplate(session.interviewSessionId)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    {session.interviewSessionThumbnail && (
                                                        <img
                                                            src={session.interviewSessionThumbnail}
                                                            alt={`${session.title} thumbnail`}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4
                                                                className="mb-1 text-lg font-medium text-gray-800 dark:text-gray-100"
                                                            >
                                                                {session.title}
                                                            </h4>
                                                            <span
                                                                className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleSessionQuestions(session.interviewSessionId);
                                                                }}
                                                            >
                                                                {expandedSessionId === session.interviewSessionId ? '▲' : '▼'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">{session.description}</div>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                Topic: {session.topic.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                • Difficulty: <Badge variant="light" color={getDifficultyColor(session.difficulty)}>{session.difficulty}</Badge>
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">• Total Questions: {session.totalQuestion}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">• Created: {new Date(session.createAt).toLocaleDateString()}</span>
                                                            {session.updateAt && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">• Updated: {new Date(session.updateAt).toLocaleDateString()}</span>
                                                            )}
                                                            {session.isDeleted && (
                                                                <span className="text-xs text-red-500 dark:text-red-400">• Deleted</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-5 right-5 flex items-center gap-2">
                                                    {!session.isDeleted ? (
                                                        <button
                                                            className="opacity-50 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity duration-150"
                                                            title="Delete template"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfirmDeleteSession(session.interviewSessionId);
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="opacity-50 group-hover:opacity-100 text-gray-400 hover:text-green-500 transition-opacity duration-150"
                                                            title="Restore template"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfirmRestoreSession(session.interviewSessionId);
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-7-7l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {expandedSessionId === session.interviewSessionId && (
                                                <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                                                    <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Question List</h5>
                                                    {(session.questions?.length > 0) ? (
                                                        <div className="space-y-3">
                                                            {(session.questions || []).map((question) => (
                                                                <div key={question.questionId} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{question.title}</h6>
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{question.content}</p>
                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                                    Difficulty: <Badge variant="light" color={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                    Tags: {session.tags.map((t) => t.title).join(', ')}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400">ID: {question.questionId}</span>
                                                                                <button
                                                                                    className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150"
                                                                                    title="Edit question"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleOpenUpdateModal(question.questionId);
                                                                                    }}
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                                                                    title="Remove question from template"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setConfirmDelete({ sessionId: session.interviewSessionId, questionId: question.questionId });
                                                                                    }}
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
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">There are no questions in this session.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                        No admin templates found matching the search criteria.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <AddTemplateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleSave}
                editingSession={null}
            />

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

            <Modal
                isOpen={!!confirmDeleteSession}
                onClose={() => setConfirmDeleteSession(null)}
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
                        Confirm Delete Template
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this template? This action can be undone by restoring the template.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setConfirmDeleteSession(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleRemoveSession}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!confirmRestoreSession}
                onClose={() => setConfirmRestoreSession(null)}
                className="max-w-md"
            >
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-green-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Confirm Restore Template
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to restore this template?
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setConfirmRestoreSession(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleRestoreSession}>
                            Restore
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
        </div>
    );
};

export default AdminTemplateManagement;