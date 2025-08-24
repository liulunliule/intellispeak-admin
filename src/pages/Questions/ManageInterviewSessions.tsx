import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as questionService from '../../services/question';

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
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
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

const ManageInterviewSessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [sessionData, setSessionData] = useState({
        title: '',
        description: '',
        topicId: '',
        difficulty: '',
        durationEstimate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await questionService.getInterviewSessions();
                setSessions(response.data.data);
                setFilteredSessions(response.data.data);
            } catch (err) {
                setError('Error fetching sessions');
                console.error('Error fetching sessions:', err);
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
        setEditingSession(null);
        setSessionData({
            title: '',
            description: '',
            topicId: '',
            difficulty: '',
            durationEstimate: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session);
        setSessionData({
            title: session.title,
            description: session.description,
            topicId: session.topic.topicId.toString(),
            difficulty: session.difficulty,
            durationEstimate: session.durationEstimate,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!sessionData.title || !sessionData.topicId) return;

        try {
            const currentDate = new Date().toISOString();
            const payload = {
                title: sessionData.title,
                description: sessionData.description,
                topicId: Number(sessionData.topicId),
                difficulty: sessionData.difficulty,
                durationEstimate: sessionData.durationEstimate,
                createAt: editingSession ? editingSession.createAt : currentDate,
                updateAt: editingSession ? currentDate : null,
                isDeleted: false,
            };

            if (editingSession) {
                const response = await questionService.updateInterviewSession(editingSession.interviewSessionId, payload);
                const updatedSession = response.data.data;
                setSessions(
                    sessions.map((session) =>
                        session.interviewSessionId === editingSession.interviewSessionId
                            ? { ...updatedSession, topic: session.topic, tags: session.tags, questions: session.questions }
                            : session
                    )
                );
            } else {
                const response = await questionService.createInterviewSession(payload);
                const newSession = response.data.data;
                setSessions([...sessions, { ...newSession, topic: { topicId: Number(sessionData.topicId), title: '', description: '', createAt: currentDate, updateAt: null, isDeleted: false }, tags: [], questions: [] }]);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError('Error saving session');
            console.error('Error saving session:', err);
        }
    };

    const toggleSessionQuestions = (sessionId: number) => {
        setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
    };

    return (
        <>
            <PageMeta title="Interview Session Management" description="Manage interview sessions in the system" />
            <PageBreadcrumb pageTitle="Interview Sessions" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Interview Session Management</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleAdd}>Add New Session</Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search sessions by name, description, or topic..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {loading && <div className="py-8 text-center text-gray-600 dark:text-gray-400">Loading session list...</div>}

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
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Topic: {session.topic.title}</span>
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
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                        {expandedSessionId === session.interviewSessionId && (
                                            <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                                                <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Question List</h5>
                                                {session.questions && session.questions.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {session.questions.map((question) => (
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
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {question.questionId}</div>
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
                                <div className="py-8 text-center text-gray-600 dark:text-gray-400">No sessions found matching the search criteria.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Session Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">Session Name*</Label>
                            <Input
                                value={sessionData.title}
                                onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                                placeholder="Enter session name"

                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">Description</Label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                rows={4}
                                value={sessionData.description}
                                onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                                placeholder="Enter session description"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">Topic (Topic ID)*</Label>
                            <Input
                                type="number"
                                value={sessionData.topicId}
                                onChange={(e) => setSessionData({ ...sessionData, topicId: e.target.value })}
                                placeholder="Enter topic ID"
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">Difficulty</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                                value={sessionData.difficulty}
                                onChange={(e) => setSessionData({ ...sessionData, difficulty: e.target.value })}
                            >
                                <option value="" className="text-gray-800 dark:text-gray-100">Select difficulty</option>
                                <option value="EASY" className="text-gray-800 dark:text-gray-100">Easy</option>
                                <option value="MEDIUM" className="text-gray-800 dark:text-gray-100">Medium</option>
                                <option value="HARD" className="text-gray-800 dark:text-gray-100">Hard</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">Estimated Duration</Label>
                            <Input
                                value={sessionData.durationEstimate}
                                onChange={(e) => setSessionData({ ...sessionData, durationEstimate: e.target.value })}
                                placeholder="Enter duration (e.g., PT0.00000009S)"
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>{editingSession ? 'Update' : 'Add'}</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManageInterviewSessions;