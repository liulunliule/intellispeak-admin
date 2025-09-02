import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import * as questionService from '../../services/question';
import * as templateService from '../../services/template';
import * as topicService from '../../services/topic';

interface Topic {
    topicId: number;
    title: string;
    description: string;
    longDescription?: string | null;
    createAt: string;
    thumbnail?: string | null;
    updateAt?: string | null;
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

interface AddTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newSession: any) => void;
    editingSession: any | null;
}

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({ isOpen, onClose, onSuccess, editingSession }) => {
    const [form, setForm] = useState({
        thumbnail: '',
        title: '',
        description: '',
        difficulty: '' as '' | 'EASY' | 'MEDIUM' | 'HARD', // Allow empty string for form state
        topicId: '',
        tagIds: [] as number[],
    });
    const [topics, setTopics] = useState<Topic[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (editingSession) {
                setForm({
                    thumbnail: editingSession.interviewSessionThumbnail || '',
                    title: editingSession.title || '',
                    description: editingSession.description || '',
                    difficulty: editingSession.difficulty || '',
                    topicId: editingSession.topic?.topicId?.toString() || '',
                    tagIds: editingSession.tags?.map((tag: Tag) => tag.tagId) || [],
                });
                if (editingSession.interviewSessionThumbnail) {
                    setThumbnailPreview(editingSession.interviewSessionThumbnail);
                }
            } else {
                setForm({
                    thumbnail: '',
                    title: '',
                    description: '',
                    difficulty: '',
                    topicId: '',
                    tagIds: [],
                });
                setThumbnailPreview(null);
                setThumbnailFile(null);
            }
            setError('');
            fetchTopics();
        }
    }, [isOpen, editingSession]);

    const fetchTopics = async () => {
        try {
            const topicRes = await questionService.getTopics();
            const fetchedTopics = topicRes.data || [];
            setTopics(fetchedTopics);
        } catch (err) {
            const errorMessage = 'Error fetching topics';
            console.error(errorMessage, err);
            setError(errorMessage);
        }
    };

    useEffect(() => {
        async function fetchTags() {
            if (!form.topicId) {
                setTags([]);
                return;
            }
            try {
                const topicRes = await topicService.getTopicsWithTags();
                const selectedTopic = topicRes.find((topic: Topic) => topic.topicId === Number(form.topicId));
                const fetchedTags = selectedTopic?.tags || [];
                setTags(fetchedTags);
            } catch (err) {
                const errorMessage = 'Error fetching tags for topic';
                console.error(errorMessage, err);
                setError(errorMessage);
            }
        }
        if (isOpen && form.topicId) {
            fetchTags();
        }
    }, [isOpen, form.topicId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTagChange = (tagId: number, checked: boolean) => {
        setForm((prev) => {
            const newTagIds = checked
                ? [...prev.tagIds, tagId].filter((id, index, self) => self.indexOf(id) === index)
                : prev.tagIds.filter((id) => id !== tagId);
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

    const handleSubmit = async () => {
        if (!form.title || !form.topicId) {
            setError('Title and Topic are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            let thumbnailUrl: string | null = null;
            if (thumbnailFile) {
                thumbnailUrl = await handleImageUpload(thumbnailFile);
                if (!thumbnailUrl) {
                    throw new Error('Failed to upload thumbnail');
                }
            }

            const now = new Date().toISOString();
            const payload = {
                title: form.title,
                description: form.description,
                interviewSessionThumbnail: thumbnailUrl || form.thumbnail,
                difficulty: (form.difficulty || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD', // Type assertion for safety
                questionIds: [],
                tagIds: form.tagIds,
                topicId: Number(form.topicId),
                createAt: now,
                updateAt: null,
                isDeleted: false,
            };

            console.log('Payload before sending to API:', payload);

            let response;
            if (editingSession) {
                response = await templateService.updateInterviewSession(editingSession.interviewSessionId, {
                    title: form.title,
                    description: form.description,
                    difficulty: (form.difficulty || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD', // Type assertion
                    topicId: Number(form.topicId),
                    tagIds: form.tagIds,
                });
                if (thumbnailUrl) {
                    await templateService.updateInterviewSessionThumbnail(editingSession.interviewSessionId, {
                        thumbnailURL: thumbnailUrl,
                    });
                }
            } else {
                response = await templateService.createInterviewSessionV2(payload);
            }

            console.log('API response:', response.data);
            onSuccess(response.data.data || response.data);
            onClose();
            setForm({
                thumbnail: '',
                title: '',
                description: '',
                difficulty: '',
                topicId: '',
                tagIds: [],
            });
            setThumbnailFile(null);
            setThumbnailPreview(null);
        } catch (err: any) {
            const errorMessage = err.message || 'Error saving template';
            console.error('Submit failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {editingSession ? 'Edit Template' : 'Add New Template'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <Label className="text-gray-800 dark:text-gray-100">Thumbnail</Label>
                        <Input
                            type="file"
                            onChange={handleThumbnailChange}
                            className="text-gray-800 dark:text-gray-100"
                        />
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
                    <div>
                        <Label className="text-gray-800 dark:text-gray-100">Tags</Label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg dark:border-gray-700 p-2">
                            {tags.length > 0 ? (
                                tags.map((tag) => (
                                    <div key={tag.tagId} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            id={`tag-${tag.tagId}`}
                                            value={tag.tagId}
                                            checked={form.tagIds.includes(tag.tagId)}
                                            onChange={(e) => handleTagChange(tag.tagId, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
                                        />
                                        <label
                                            htmlFor={`tag-${tag.tagId}`}
                                            className="text-gray-800 dark:text-gray-100"
                                        >
                                            {tag.title}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {form.topicId ? 'No tags available for this topic' : 'Select a topic to load tags'}
                                </p>
                            )}
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {editingSession ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddTemplateModal;