import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import * as topicService from '../../services/topic';

interface Topic {
    topicId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface EditTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedTopic: Topic) => void;
    topic: Topic | null;
}

const EditTopicModal: React.FC<EditTopicModalProps> = ({ isOpen, onClose, onSuccess, topic }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (topic && isOpen) {
            setForm({
                title: topic.title,
                description: topic.description,
            });
            setError('');
        }
    }, [topic, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.title) {
            setError('Title is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const now = new Date().toISOString();
            const payload = {
                topicId: topic?.topicId || 0,
                title: form.title,
                description: form.description,
                createAt: topic?.createAt || now,
                updateAt: now,
                isDeleted: false,
            };

            console.log('Payload before sending to API:', payload);

            const response = await topicService.updateTopic(payload.topicId, payload);
            console.log('API response:', response.data);
            onSuccess(response.data.data);
            onClose();
            setForm({ title: '', description: '' });
        } catch (err: any) {
            const errorMessage = err.message || 'Error updating topic';
            console.error('Submit failed:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Edit Topic</h3>
                <div className="space-y-4">
                    <div>
                        <Label className="text-gray-800 dark:text-gray-100">Title*</Label>
                        <Input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter topic title"
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
                            placeholder="Enter topic description"
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditTopicModal;