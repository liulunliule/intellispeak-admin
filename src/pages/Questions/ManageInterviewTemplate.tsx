import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as questionService from '../../services/question';
import AddTemplateModal from './AddTemplateModal';
import TemplateDetailModal from './TemplateDetailModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';

interface Topic {
    topicId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface Tag {
    id: number;
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
    _deleted: boolean;
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

const ManageInterviewTemplate: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ sessionId: number; questionId: number } | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await questionService.getInterviewSessions();
                console.log('getInterviewSessions response:', response.data);
                const normalizedSessions = response.data.data.map((session: Session) => ({
                    ...session,
                    questions: session.questions || [],
                }));
                setSessions(normalizedSessions);
                setFilteredSessions(normalizedSessions);
            } catch (err) {
                setError('Error fetching templates');
                console.error('Error fetching templates:', err);
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

    const handleEdit = (session: Session) => {
        console.log('Opening template with sessionId:', session.interviewSessionId);
        setSelectedSession(session);
        setIsDetailModalOpen(true);
    };

    const handleSave = (newSession: Session) => {
        console.log('Saving new session:', newSession);
        setSessions([...sessions, { ...newSession, questions: newSession.questions || [] }]);
        setFilteredSessions([...filteredSessions, { ...newSession, questions: newSession.questions || [] }]);
        setIsAddModalOpen(false);
    };

    const handleDetailSave = (updatedSession: Session) => {
        console.log('Saving updated session:', updatedSession);
        setSessions(
            sessions.map((session) =>
                session.interviewSessionId === updatedSession.interviewSessionId ? updatedSession : session
            )
        );
        setFilteredSessions(
            filteredSessions.map((session) =>
                session.interviewSessionId === updatedSession.interviewSessionId ? updatedSession : session
            )
        );
        setIsDetailModalOpen(false);
        setSelectedSession(null);
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

    const toggleSessionQuestions = (sessionId: number) => {
        setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
    };

    return (
        <>
            <PageMeta title="Interview Session Management" description="Manage interview templates in the system" />
            <PageBreadcrumb pageTitle="Interview Template" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Interview Template Management</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleAdd}>Add New Template</Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search templates by name, description, or topic..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {loading && !sessions.length && <div className="py-8 text-center text-gray-600 dark:text-gray-400">Loading template list...</div>}

                    {error && <div className="py-8 text-center text-red-500 dark:text-red-400">{error}</div>}

                    {!loading && !error && (
                        <div className="space-y-4">
                            {filteredSessions.length > 0 ? (
                                filteredSessions.map((session) => (
                                    <div key={session.interviewSessionId} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4
                                                        className="mb-1 text-lg font-medium text-gray-800 dark:text-gray-100 cursor-pointer"
                                                        onClick={() => toggleSessionQuestions(session.interviewSessionId)}
                                                    >
                                                        {session.title}
                                                    </h4>
                                                    <span
                                                        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                                                        onClick={() => toggleSessionQuestions(session.interviewSessionId)}
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
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(session)}>
                                                    View & Edit
                                                </Button>
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
                                                                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                                                                title="Remove question from template"
                                                                                onClick={() => setConfirmDelete({ sessionId: session.interviewSessionId, questionId: question.questionId })}
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
                                <div className="py-8 text-center text-gray-600 dark:text-gray-400">No templates found matching the search criteria.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Template Modal */}
            <AddTemplateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleSave}
                editingSession={null}
            />

            {/* Template Detail Modal */}
            <TemplateDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedSession(null);
                }}
                session={selectedSession}
                onSave={handleDetailSave}
            />

            {/* Confirm Delete Question Modal */}
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
        </>
    );
};

export default ManageInterviewTemplate;