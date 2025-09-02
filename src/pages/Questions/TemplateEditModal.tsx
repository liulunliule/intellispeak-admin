import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import MultiSelect from '../../components/form/MultiSelect';
import * as questionService from '../../services/question';
import * as templateService from '../../services/template';
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
    tagId: number;
    title: string;
    description?: string;
    createAt?: string;
    updateAt?: string | null;
    isDeleted?: boolean;
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
    questions: any[];
}

interface TemplateEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    onSave: (updatedSession: Session) => void;
    title: string;
}

interface SelectOption {
    value: string;
    label: string;
}

interface MultiSelectOption {
    value: string;
    text: string;
    selected: boolean;
}

const TemplateEditModal: React.FC<TemplateEditModalProps> = ({
    isOpen,
    onClose,
    session,
    onSave,
    title,
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topicId: '',
        difficulty: 'MEDIUM',
        selectedTags: [] as string[],
        durationEstimate: '',
        source: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    // Prepare options for Select components
    const topicOptions: SelectOption[] = topics.map((topic) => ({
        value: topic.topicId.toString(),
        label: topic.title,
    }));

    const difficultyOptions: SelectOption[] = [
        { value: 'EASY', label: 'Easy' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HARD', label: 'Hard' },
    ];

    const tagOptions: MultiSelectOption[] = tags.map((tag) => ({
        value: tag.tagId.toString(),
        text: tag.title,
        selected: formData.selectedTags.includes(tag.tagId.toString()),
    }));

    // Fetch topics when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchTopics = async () => {
                try {
                    const response = await questionService.getTopics();
                    setTopics(response.data);
                } catch (err) {
                    setError('Failed to fetch topics');
                    console.error('Error fetching topics:', err);
                }
            };
            fetchTopics();
        }
    }, [isOpen]);

    // Fetch tags when topic changes
    useEffect(() => {
        if (formData.topicId) {
            const fetchTags = async () => {
                try {
                    const response = await topicService.getTopicTags(Number(formData.topicId));
                    setTags(response);
                } catch (err) {
                    setError('Failed to fetch tags');
                    console.error('Error fetching tags:', err);
                }
            };
            fetchTags();
        } else {
            setTags([]);
        }
    }, [formData.topicId]);

    // Initialize form data when session changes
    useEffect(() => {
        if (session) {
            const selectedTagIds = session.tags.map((tag) => tag.tagId.toString());
            setFormData({
                title: session.title || '',
                description: session.description || '',
                topicId: session.topic?.topicId?.toString() || '',
                difficulty: session.difficulty || 'MEDIUM',
                selectedTags: selectedTagIds,
                durationEstimate: session.durationEstimate || '',
                source: session.source || '',
            });
        }
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTopicChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            topicId: value,
            selectedTags: [], // Reset tags when topic changes
        }));
    };

    const handleDifficultyChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            difficulty: value,
        }));
    };

    const handleTagsChange = (values: string[]) => {
        setFormData((prev) => ({
            ...prev,
            selectedTags: values,
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert selected tag IDs to numbers
            const selectedTagIds = formData.selectedTags.map((id) => parseInt(id));

            // Call updateInterviewSession API
            const response = await templateService.updateInterviewSession(session!.interviewSessionId, {
                topicId: parseInt(formData.topicId),
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                tagIds: selectedTagIds,
            });

            console.log('updateInterviewSession', response);


            // Create updated session object
            const updatedSession: Session = {
                ...session!,
                title: formData.title,
                description: formData.description,
                topic: topics.find((t) => t.topicId === parseInt(formData.topicId)) || session!.topic,
                difficulty: formData.difficulty,
                tags: tags.filter((tag) => selectedTagIds.includes(tag.tagId)),
                durationEstimate: formData.durationEstimate,
                source: formData.source,
            };

            onSave(updatedSession);
            onClose();
        } catch (err) {
            setError('Failed to update template');
            console.error('Error updating template:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl"
            showCloseButton={true}
        >
            <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title">Template Title</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter template title"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <TextArea
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            rows={4}
                            placeholder="Enter template description"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Topic</Label>
                            <Select
                                options={topicOptions}
                                placeholder="Select a topic"
                                onChange={handleTopicChange}
                                className="dark:bg-gray-900"
                                defaultValue={formData.topicId}
                            />
                        </div>

                        <div>
                            <Label>Difficulty</Label>
                            <Select
                                options={difficultyOptions}
                                placeholder="Select difficulty"
                                onChange={handleDifficultyChange}
                                className="dark:bg-gray-900"
                                defaultValue={formData.difficulty}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Tags</Label>
                        <MultiSelect
                            label="Select tags"
                            options={tagOptions}
                            defaultSelected={formData.selectedTags}
                            onChange={handleTagsChange}
                        />
                        {formData.selectedTags.length === 0 && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No tags selected</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="durationEstimate">Duration Estimate</Label>
                            <Input
                                type="text"
                                id="durationEstimate"
                                name="durationEstimate"
                                value={formData.durationEstimate}
                                onChange={handleInputChange}
                                placeholder="e.g., 30 minutes"
                            />
                        </div>

                        <div>
                            <Label htmlFor="source">Source</Label>
                            <Input
                                type="text"
                                id="source"
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                                placeholder="Enter source"
                            />
                        </div>
                    </div>



                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={loading || !formData.title || !formData.topicId}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default TemplateEditModal;