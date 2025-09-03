import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Input from '../../components/form/input/InputField';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as templateService from '../../services/template';
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

const AllTemplateManagement: React.FC = () => {
    const navigate = useNavigate();
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [filteredAllSessions, setFilteredAllSessions] = useState<Session[]>([]);
    const [allSearch, setAllSearch] = useState('');
    const [allLoading, setAllLoading] = useState(false);
    const [allError, setAllError] = useState('');
    const [allExpandedSessionId, setAllExpandedSessionId] = useState<number | null>(null);
    const [isAllTemplateListCollapsed, setIsAllTemplateListCollapsed] = useState(false);

    useEffect(() => {
        const fetchAllSessions = async () => {
            setAllLoading(true);
            setAllError('');
            try {
                const response = await templateService.getAllAdminInterviews();
                console.log('getAllAdminInterviews response:', response.data);
                const normalizedSessions = response.data.data.map((session: Session) => ({
                    ...session,
                    questions: session.questions || [],
                }));
                setAllSessions(normalizedSessions);
                setFilteredAllSessions(normalizedSessions);
            } catch (err) {
                setAllError('Error fetching all templates');
                console.error('Error fetching all templates:', err);
            } finally {
                setAllLoading(false);
            }
        };
        fetchAllSessions();
    }, []);

    useEffect(() => {
        const filtered = allSessions.filter(
            (session) =>
                session.title.toLowerCase().includes(allSearch.toLowerCase()) ||
                session.description.toLowerCase().includes(allSearch.toLowerCase()) ||
                session.topic.title.toLowerCase().includes(allSearch.toLowerCase())
        );
        setFilteredAllSessions(filtered);
    }, [allSearch, allSessions]);

    const handleViewAllSession = (sessionId: number) => {
        console.log('Navigating to all template details with sessionId:', sessionId);
        navigate(`/detail-all-template/${sessionId}`);
    };

    const toggleAllSessionQuestions = (sessionId: number) => {
        setAllExpandedSessionId(allExpandedSessionId === sessionId ? null : sessionId);
    };

    const toggleAllTemplateList = () => {
        setIsAllTemplateListCollapsed(!isAllTemplateListCollapsed);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleAllTemplateList}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-150"
                            title={isAllTemplateListCollapsed ? 'Expand all template list' : 'Collapse all template list'}
                        >
                            {isAllTemplateListCollapsed ? (
                                <ChevronDownIcon className="w-5 h-5" />
                            ) : (
                                <ChevronUpIcon className="w-5 h-5" />
                            )}
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            All Template Management
                        </h3>
                    </div>
                </div>

                {!isAllTemplateListCollapsed && (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search all templates by name, description, or topic..."
                                    value={allSearch}
                                    onChange={(e) => setAllSearch(e.target.value)}
                                    className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {allLoading && !allSessions.length && (
                            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                Loading all template list...
                            </div>
                        )}

                        {allError && (
                            <div className="py-8 text-center text-red-500 dark:text-red-400">{allError}</div>
                        )}

                        {!allLoading && !allError && (
                            <div className="space-y-4">
                                {filteredAllSessions.length > 0 ? (
                                    filteredAllSessions.map((session) => (
                                        <div
                                            key={session.interviewSessionId}
                                            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => handleViewAllSession(session.interviewSessionId)}
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAllSessionQuestions(session.interviewSessionId);
                                                                }}
                                                            >
                                                                {session.title}
                                                            </h4>
                                                            <span
                                                                className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAllSessionQuestions(session.interviewSessionId);
                                                                }}
                                                            >
                                                                {allExpandedSessionId === session.interviewSessionId ? '▲' : '▼'}
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
                                                </div>
                                            </div>
                                            {allExpandedSessionId === session.interviewSessionId && (
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
                                        No templates found matching the search criteria.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllTemplateManagement;