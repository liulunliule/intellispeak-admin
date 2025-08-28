import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
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

interface AddTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newSession: any) => void;
    editingSession: Session | null;
}

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        thumbnail: '',
        title: '',
        description: '',
        totalQuestion: '',
        difficulty: '',
        topicId: '',
        tagIds: [] as number[],
    });
    const [topics, setTopics] = useState<{ topicId: number; title: string }[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setForm({
                thumbnail: '',
                title: '',
                description: '',
                totalQuestion: '',
                difficulty: '',
                topicId: '',
                tagIds: [],
            });
            setThumbnailPreview(null);
            setThumbnailFile(null);
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        async function fetchData() {
            try {
                const topicRes = await questionService.getTopics();
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
            } catch (err) {
                const errorMessage = 'Error fetching topics or tags';
                console.error(errorMessage, err);
                setError(errorMessage);
            }
        }
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
                interviewSessionId: 0,
                title: form.title,
                description: form.description,
                interviewSessionThumbnail: thumbnailUrl || form.thumbnail,
                totalQuestion: Number(form.totalQuestion) || 0,
                difficulty: form.difficulty,
                questionIds: [],
                tagIds: form.tagIds,
                topicId: Number(form.topicId),
                tags: [],
                topic: null,
                durationEstimate: '',
                createAt: now,
                updateAt: null,
                isDeleted: false,
            };

            console.log('Payload before sending to API:', payload);

            const response = await templateService.createInterviewSessionV2(payload);
            console.log('API response:', response.data);
            onSuccess(response.data.data);
            onClose();
            setForm({
                thumbnail: '',
                title: '',
                description: '',
                totalQuestion: '',
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
                    Add New Template
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
                        <Label className="text-gray-800 dark:text-gray-100">Total Questions</Label>
                        <Input
                            type="number"
                            name="totalQuestion"
                            value={form.totalQuestion}
                            onChange={handleChange}
                            placeholder="Enter total questions"
                            className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            min="0"
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
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddTemplateModal;
