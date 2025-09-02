import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import * as templateService from '../../services/template';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
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

const CompanyTemplateDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);

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
            <PageMeta title={`Template: ${session.title}`} description="View details of a company interview template" />
            <PageBreadcrumb pageTitle="Company Template Details" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
                        onClick={() => navigate('/manage-interview-template')}
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        Back to Templates
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Template Details
                    </h1>
                </div>

                {/* Thumbnail Section */}
                {session.interviewSessionThumbnail ? (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={session.interviewSessionThumbnail}
                            alt={`${session.title} thumbnail`}
                            className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 h-64 flex items-center justify-center">
                        <div className="text-center p-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white/30 dark:bg-gray-600/30 mb-4">
                                <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No thumbnail available</p>
                        </div>
                    </div>
                )}

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
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Duration Estimate</span>
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{session.durationEstimate}</span>
                                </div>
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
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={toggleQuestions}
                        >
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Question List</h4>
                                <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {session.questions?.length || 0}
                                </span>
                            </div>
                            <button
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                                title={expanded ? 'Collapse questions' : 'Expand questions'}
                            >
                                {expanded ? (
                                    <ChevronUpIcon className="w-5 h-5" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5" />
                                )}
                            </button>
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
        </>
    );
};

export default CompanyTemplateDetail;