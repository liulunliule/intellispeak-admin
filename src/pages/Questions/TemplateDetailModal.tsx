import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as questionService from '../../services/question';
import * as topicService from '../../services/topic';
import * as templateService from '../../services/template';

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
    tags: Tag[];
    questions: Question[];
}

interface TemplateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    onSave: (updatedSession: Session) => void;
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

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({ isOpen, onClose, session, onSave }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        totalQuestion: '',
        difficulty: '',
        topicId: '',
        tagIds: [] as number[],
        thumbnail: '',
    });
    const [topics, setTopics] = useState<{ topicId: number; title: string }[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
    const [isImportCsvModalOpen, setIsImportCsvModalOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);

    useEffect(() => {
        if (session && isOpen) {
            setLoading(true);
            setError('');
            const fetchSession = async () => {
                try {
                    const response = await questionService.getInterviewSession(session.interviewSessionId);
                    console.log('getInterviewSession response:', response.data);
                    const fetchedSession = response.data.data;
                    if (!fetchedSession) {
                        throw new Error('Template not found');
                    }
                    setCurrentSession(fetchedSession);
                    setForm({
                        title: fetchedSession.title,
                        description: fetchedSession.description,
                        totalQuestion: fetchedSession.totalQuestion.toString(),
                        difficulty: fetchedSession.difficulty,
                        topicId: fetchedSession.topic.topicId.toString(),
                        tagIds: fetchedSession.tags.map((tag: Tag) => tag.tagId),
                        thumbnail: fetchedSession.interviewSessionThumbnail || '',
                    });
                    setThumbnailPreview(fetchedSession.interviewSessionThumbnail || null);
                } catch (err: any) {
                    const errorMessage = err.message || 'Failed to load template';
                    console.error('Error fetching template:', err);
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            };
            fetchSession();
        }
    }, [session, isOpen]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const topicRes = await questionService.getTopics();
                console.log('API response for getTopics:', topicRes.data);
                setTopics(topicRes.data.data || topicRes.data);
                const questionRes = await questionService.getQuestions();
                console.log('API response for getQuestions:', questionRes.data);
                setQuestions(questionRes.data.data || questionRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching topics or questions');
            }
        };
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            console.log('Selected thumbnail file:', file.name);
        }
    };

    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCsvFile(file);
            console.log('Selected CSV file:', file.name);
            setIsImportCsvModalOpen(true); // Open tag selection modal
        }
    };

    const handleImageUpload = async (file: File | null): Promise<string | null> => {
        if (!file) {
            console.log('No file selected for upload');
            return null;
        }
        try {
            const url = await topicService.uploadImage(file);
            console.log('Image uploaded successfully:', url);
            return url;
        } catch (error: any) {
            const errorMessage = error.message || 'Error uploading image';
            console.error('Image upload failed:', errorMessage);
            setError(errorMessage);
            return null;
        }
    };

    const handleSaveThumbnail = async () => {
        if (!thumbnailFile) {
            setError('No thumbnail selected');
            return;
        }
        if (!currentSession) {
            setError('No session loaded');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const thumbnailUrl = await handleImageUpload(thumbnailFile);
            if (!thumbnailUrl) {
                throw new Error('Failed to upload thumbnail');
            }
            const response = await questionService.updateInterviewSessionThumbnail(currentSession.interviewSessionId, thumbnailUrl);
            console.log('updateInterviewSessionThumbnail response:', response.data);
            console.log('Thumbnail updated successfully for session:', currentSession.interviewSessionId);

            const updatedSession = {
                ...currentSession,
                interviewSessionThumbnail: thumbnailUrl,
            };
            setCurrentSession(updatedSession);
            setForm({ ...form, thumbnail: thumbnailUrl });
            setThumbnailFile(null);
            setThumbnailPreview(thumbnailUrl);
            onSave(updatedSession);
        } catch (err: any) {
            const errorMessage = err.message || 'Error saving thumbnail';
            console.error('Thumbnail save failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleImportCsv = async () => {
        if (!csvFile) {
            setError('No CSV file selected');
            return;
        }
        if (!currentSession) {
            setError('No session loaded');
            return;
        }
        if (!selectedTagId) {
            setError('No tag selected for CSV import');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await templateService.importCsvQuestionsToSession(selectedTagId, currentSession.interviewSessionId, csvFile);
            console.log('Imported questions from CSV for session:', currentSession.interviewSessionId, 'with tag:', selectedTagId);

            // Fetch updated session data to ensure consistency
            const response = await questionService.getInterviewSession(currentSession.interviewSessionId);
            const updatedSession = response.data.data;
            if (!updatedSession) {
                throw new Error('Failed to fetch updated session');
            }

            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedSession.totalQuestion.toString() });
            setCsvFile(null);
            setSelectedTagId(null);
            setIsImportCsvModalOpen(false);
            onSave(updatedSession);
        } catch (err: any) {
            const errorMessage = err.message || 'Error importing questions from CSV';
            console.error('CSV import failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentSession) return;
        setLoading(true);
        setError('');
        try {
            const updatedSession = {
                ...currentSession,
                questions: currentSession.questions,
                totalQuestion: currentSession.questions.length,
            };
            console.log('Updated session before saving:', updatedSession);
            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedSession.totalQuestion.toString() });
            onSave(updatedSession);
            onClose();
        } catch (err: any) {
            const errorMessage = err.message || 'Error saving template';
            console.error('Submit failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestions = async (selectedIds: number[]) => {
        if (!currentSession) return;
        setLoading(true);
        setError('');
        try {
            // Filter out question IDs that are already in the session
            const newQuestionIds = selectedIds.filter((id) => !currentSession.questions.some((q) => q.questionId === id));

            // Call API to add each new question to the session
            for (const questionId of newQuestionIds) {
                await templateService.addQuestionToSession(currentSession.interviewSessionId, questionId);
                console.log('Added question:', questionId, 'to session:', currentSession.interviewSessionId);
            }

            // Fetch updated session data to ensure consistency
            const response = await questionService.getInterviewSession(currentSession.interviewSessionId);
            const updatedSession = response.data.data;
            if (!updatedSession) {
                throw new Error('Failed to fetch updated session');
            }

            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedSession.totalQuestion.toString() });
            setSelectedQuestionIds([]);
            setIsAddQuestionModalOpen(false);
            onSave(updatedSession);
        } catch (err: any) {
            const errorMessage = err.message || 'Error adding questions';
            console.error('Add questions failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveQuestion = async (questionId: number) => {
        if (!currentSession) return;
        setLoading(true);
        setError('');
        try {
            await questionService.removeQuestionFromSession(currentSession.interviewSessionId, questionId);
            console.log('Removed question:', questionId, 'from session:', currentSession.interviewSessionId);
            const updatedQuestions = currentSession.questions.filter((q) => q.questionId !== questionId);
            const updatedSession = { ...currentSession, questions: updatedQuestions, totalQuestion: updatedQuestions.length };
            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedQuestions.length.toString() });
            onSave(updatedSession);
        } catch (err) {
            console.error('Failed to remove question from session:', err);
            setError('Error removing question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    onClose();
                    setForm({
                        title: '',
                        description: '',
                        totalQuestion: '',
                        difficulty: '',
                        topicId: '',
                        tagIds: [],
                        thumbnail: '',
                    });
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                    setSelectedQuestionIds([]);
                    setCsvFile(null);
                    setSelectedTagId(null);
                    setError('');
                    setCurrentSession(null);
                }}
                className="max-w-3xl w-full"
            >
                <div className="relative w-full overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
                    {loading && !currentSession && (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">Loading template details...</div>
                    )}
                    {error && !currentSession && (
                        <div className="py-8 text-center text-red-500 dark:text-red-400">{error}</div>
                    )}
                    {currentSession && (
                        <>
                            <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Template Details</h3>
                            {error && <div className="text-red-500 text-sm mb-6 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg">{error}</div>}
                            <div className="space-y-8">
                                {/* Thumbnail */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Thumbnail</Label>
                                    <div className="mt-2">
                                        {thumbnailPreview && (
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail Preview"
                                                className="w-1/2 h-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-3"
                                            />
                                        )}
                                        <Button
                                            variant="outline"
                                            className="relative"
                                            onClick={() => document.getElementById('thumbnail-input')?.click()}
                                        >
                                            Choose Thumbnail
                                            <input
                                                id="thumbnail-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </Button>
                                        {thumbnailFile && (
                                            <Button
                                                onClick={handleSaveThumbnail}
                                                disabled={loading}
                                                variant="primary"
                                                className="ml-3"
                                            >
                                                Save Thumbnail
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Title</Label>
                                    <p className="mt-1 text-gray-800 dark:text-gray-100 text-sm">{form.title || 'N/A'}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Description</Label>
                                    <p className="mt-1 text-gray-800 dark:text-gray-100 text-sm whitespace-pre-wrap">{form.description || 'N/A'}</p>
                                </div>

                                {/* Total Questions */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Total Questions</Label>
                                    <p className="mt-1 text-gray-800 dark:text-gray-100 text-sm">{form.totalQuestion || '0'}</p>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Difficulty</Label>
                                    <Badge variant="light" color={getDifficultyColor(form.difficulty)} >
                                        {form.difficulty || 'N/A'}
                                    </Badge>
                                </div>

                                {/* Topic */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Topic</Label>
                                    <p className="mt-1 text-gray-800 dark:text-gray-100 text-sm">
                                        {topics.find((t) => t.topicId.toString() === form.topicId)?.title || 'N/A'}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Tags</Label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {currentSession && currentSession.tags.length > 0 ? (
                                            currentSession.tags.map((tag) => (
                                                <Badge key={tag.tagId} variant="light" color="primary">
                                                    {tag.title}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No tags</p>
                                        )}
                                    </div>
                                </div>

                                {/* Questions */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Questions</Label>
                                        <div className="flex gap-3">
                                            <Button onClick={() => setIsAddQuestionModalOpen(true)} variant="outline">
                                                Add Questions
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="relative"
                                                onClick={() => document.getElementById('csv-input')?.click()}
                                            >
                                                Import Questions from CSV
                                                <input
                                                    id="csv-input"
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleCsvFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                    {currentSession.questions.length > 0 ? (
                                        <div className="space-y-3 mt-4">
                                            {currentSession.questions.map((question) => (
                                                <div key={question.questionId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{question.title}</h6>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{question.content}</p>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                    Difficulty: <Badge variant="light" color={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                                                title="Remove question"
                                                                onClick={() => handleRemoveQuestion(question.questionId)}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">No questions in this template.</div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            onClose();
                                            setForm({
                                                title: '',
                                                description: '',
                                                totalQuestion: '',
                                                difficulty: '',
                                                topicId: '',
                                                tagIds: [],
                                                thumbnail: '',
                                            });
                                            setThumbnailFile(null);
                                            setThumbnailPreview(null);
                                            setSelectedQuestionIds([]);
                                            setCsvFile(null);
                                            setSelectedTagId(null);
                                            setError('');
                                            setCurrentSession(null);
                                        }}
                                        disabled={loading}
                                    >
                                        Close
                                    </Button>
                                    <Button onClick={handleSave} disabled={loading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Add Questions Modal */}
            <Modal isOpen={isAddQuestionModalOpen} onClose={() => {
                setIsAddQuestionModalOpen(false);
                setSelectedQuestionIds([]);
            }} className="max-w-2xl">
                <div className="relative w-full overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
                    <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Add Questions</h3>
                    <div className="space-y-6">
                        {questions.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                {questions.map((question) => (
                                    <div key={question.questionId} className="flex items-center gap-3 py-2">
                                        <input
                                            type="checkbox"
                                            id={`question-${question.questionId}`}
                                            value={question.questionId}
                                            checked={selectedQuestionIds.includes(question.questionId)}
                                            onChange={(e) => {
                                                const id = Number(e.target.value);
                                                setSelectedQuestionIds((prev) =>
                                                    e.target.checked
                                                        ? [...prev, id].filter((id, index, self) => self.indexOf(id) === index)
                                                        : prev.filter((qId) => qId !== id)
                                                );
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
                                        />
                                        <label
                                            htmlFor={`question-${question.questionId}`}
                                            className="text-gray-800 dark:text-gray-100 text-sm"
                                        >
                                            {question.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No questions available</p>
                        )}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => {
                                setIsAddQuestionModalOpen(false);
                                setSelectedQuestionIds([]);
                            }} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleAddQuestions(selectedQuestionIds)}
                                disabled={loading || selectedQuestionIds.length === 0}
                                variant="primary"
                            >
                                Add Selected
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Import CSV Modal */}
            <Modal isOpen={isImportCsvModalOpen} onClose={() => {
                setIsImportCsvModalOpen(false);
                setCsvFile(null);
                setSelectedTagId(null);
            }} className="max-w-2xl">
                <div className="relative w-full overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
                    <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Import Questions from CSV</h3>
                    <div className="space-y-6">
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100 text-base font-medium">Select Tag</Label>
                            {currentSession && currentSession.tags.length > 0 ? (
                                <select
                                    value={selectedTagId || ''}
                                    onChange={(e) => setSelectedTagId(Number(e.target.value) || null)}
                                    className="mt-2 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                                >
                                    <option value="">Select a tag</option>
                                    {currentSession.tags.map((tag) => (
                                        <option key={tag.tagId} value={tag.tagId}>
                                            {tag.title}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No tags available</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsImportCsvModalOpen(false);
                                    setCsvFile(null);
                                    setSelectedTagId(null);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImportCsv}
                                disabled={loading || !csvFile || !selectedTagId}
                                variant="primary"
                            >
                                Import CSV
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default TemplateDetailModal;
