import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Badge, { BadgeColor } from '../../components/ui/badge/Badge';
import * as questionService from '../../services/question';
import * as topicService from '../../services/topic';

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
    const [tags, setTags] = useState<Tag[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
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
                        tagIds: fetchedSession.tags.map((tag: Tag) => tag.id),
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
                const tagRes = await questionService.getTags();
                console.log('Tags list:', tagRes.data.data || tagRes.data);
                const fetchedTags = tagRes.data.data || tagRes.data;
                const validTags = fetchedTags
                    .filter((tag: any) => tag.id !== undefined && tag.id !== null)
                    .map((tag: any) => ({
                        id: tag.id,
                        title: tag.title,
                        description: tag.description,
                        createAt: tag.createAt,
                        updateAt: tag.updateAt,
                        isDeleted: tag.isDeleted,
                    }));
                if (validTags.length < fetchedTags.length) {
                    setError('Warning: Some tags have invalid IDs and were skipped');
                }
                setTags(validTags);
                const questionRes = await questionService.getQuestions();
                console.log('API response for getQuestions:', questionRes.data);
                setQuestions(questionRes.data.data || questionRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching topics, tags, or questions');
            }
        };
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTagChange = (id: number, checked: boolean) => {
        setForm((prev) => {
            const newTagIds = checked
                ? [...prev.tagIds, id].filter((id, index, self) => self.indexOf(id) === index)
                : prev.tagIds.filter((tagId) => tagId !== id);
            console.log('Selected tagIds:', newTagIds);
            return { ...prev, tagIds: newTagIds };
        });
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
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
            await questionService.updateInterviewSessionThumbnail(currentSession.interviewSessionId, thumbnailUrl);
            console.log('Thumbnail updated successfully for session:', currentSession.interviewSessionId);

            const updatedSession = {
                ...currentSession,
                interviewSessionThumbnail: thumbnailUrl,
            };
            setCurrentSession(updatedSession);
            setForm({ ...form, thumbnail: thumbnailUrl });
            setThumbnailFile(null);
            onSave(updatedSession);
        } catch (err: any) {
            const errorMessage = err.message || 'Error saving thumbnail';
            console.error('Thumbnail save failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.topicId) {
            setError('Title and Topic are required');
            return;
        }
        if (!currentSession) return;
        setLoading(true);
        setError('');
        try {
            const now = new Date().toISOString();
            const updatedSession = {
                ...currentSession,
                title: form.title,
                description: form.description,
                totalQuestion: Number(form.totalQuestion) || 0,
                difficulty: form.difficulty,
                topic: { ...currentSession.topic, topicId: Number(form.topicId) },
                tags: tags.filter((tag) => form.tagIds.includes(tag.id)),
                updateAt: now,
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
            const updatedQuestionIds = [
                ...new Set([...(currentSession.questions.map((q) => q.questionId) || []), ...selectedIds]),
            ];
            const payload = {
                ...currentSession,
                questionIds: updatedQuestionIds,
                totalQuestion: updatedQuestionIds.length,
            };
            console.log('Payload before adding questions:', payload);
            const response = await questionService.updateInterviewSession(currentSession.interviewSessionId, payload);
            console.log('API response:', response.data);
            const updatedSession = {
                ...currentSession,
                questions: [
                    ...currentSession.questions,
                    ...questions.filter((q) => selectedIds.includes(q.questionId)),
                ],
                totalQuestion: updatedQuestionIds.length,
            };
            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedQuestionIds.length.toString() });
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
            const updatedQuestions = currentSession.questions.filter((q) => q.questionId !== questionId);
            const updatedSession = { ...currentSession, questions: updatedQuestions, totalQuestion: updatedQuestions.length };
            setCurrentSession(updatedSession);
            setForm({ ...form, totalQuestion: updatedQuestions.length.toString() });
            onSave(updatedSession);
        } catch (err) {
            console.error('Failed to remove question from session', err);
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
                    setError('');
                    setCurrentSession(null);
                }}
                className="max-w-2xl"
            >
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    {loading && !currentSession && (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">Loading template details...</div>
                    )}
                    {error && !currentSession && (
                        <div className="py-8 text-center text-red-500 dark:text-red-400">{error}</div>
                    )}
                    {currentSession && (
                        <>
                            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Template Details</h3>
                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                            <div className="space-y-6">
                                {/* Thumbnail */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Thumbnail</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="text-gray-800 dark:text-gray-100"
                                        />
                                        <Button
                                            onClick={handleSaveThumbnail}
                                            disabled={loading || !thumbnailFile}
                                            variant="outline"
                                        >
                                            Save Thumbnail
                                        </Button>
                                    </div>
                                    {thumbnailPreview && (
                                        <div className="mt-2">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail Preview"
                                                className="w-1/2 h-auto rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Title*</Label>
                                    <Input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter template title"
                                        className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Description</Label>
                                    <textarea
                                        name="description"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        rows={4}
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Enter template description"
                                    />
                                </div>

                                {/* Total Questions */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Total Questions</Label>
                                    <Input
                                        type="number"
                                        name="totalQuestion"
                                        value={form.totalQuestion}
                                        readOnly
                                        className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Difficulty</Label>
                                    <select
                                        name="difficulty"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                                        value={form.difficulty}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select difficulty</option>
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>

                                {/* Topic */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Topic*</Label>
                                    <select
                                        name="topicId"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                                        value={form.topicId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select topic</option>
                                        {topics.map((t) => (
                                            <option key={t.topicId} value={t.topicId}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div>
                                    <Label className="text-gray-800 dark:text-gray-100">Tags</Label>
                                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg dark:border-gray-700 p-2">
                                        {tags.length > 0 ? (
                                            tags.map((tag) => (
                                                <div key={tag.id} className="flex items-center gap-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`tag-${tag.id}`}
                                                        value={tag.id}
                                                        checked={form.tagIds.includes(tag.id)}
                                                        onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
                                                    />
                                                    <label
                                                        htmlFor={`tag-${tag.id}`}
                                                        className="text-gray-800 dark:text-gray-100"
                                                    >
                                                        {tag.title}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Questions */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label className="text-gray-800 dark:text-gray-100">Questions</Label>
                                        <Button onClick={() => setIsAddQuestionModalOpen(true)}>Add Questions</Button>
                                    </div>
                                    {currentSession.questions.length > 0 ? (
                                        <div className="space-y-3 mt-4">
                                            {currentSession.questions.map((question) => (
                                                <div key={question.questionId} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3">
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
                                <div className="flex justify-end gap-3 pt-4">
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
                                            setCurrentSession(null);
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
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
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Add Questions</h3>
                    <div className="space-y-4">
                        {questions.length > 0 ? (
                            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg dark:border-gray-700 p-2">
                                {questions.map((question) => (
                                    <div key={question.questionId} className="flex items-center gap-2 py-1">
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
                                            className="text-gray-800 dark:text-gray-100"
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
                                onClick={() => handleAddQuestions(selectedQuestionIds.filter((id) => !currentSession?.questions.some((q) => q.questionId === id)))}
                                disabled={loading || selectedQuestionIds.length === 0}
                            >
                                Add Selected
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default TemplateDetailModal;