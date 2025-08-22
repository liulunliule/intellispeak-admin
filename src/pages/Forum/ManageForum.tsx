import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import api from '../../services/api';

interface ForumTopic {
    id: number;
    title: string;
    createAt: string;
    updateAt: string | null;
    deleted: boolean;
}

const ManageForum: React.FC = () => {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
    const [deletingTopic, setDeletingTopic] = useState<ForumTopic | null>(null);
    const [topicData, setTopicData] = useState({
        title: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTopics = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/topic-type');
            setTopics(response.data);
            setFilteredTopics(response.data);
        } catch (err) {
            setError('Error fetching forum topics');
            console.error('Error fetching topics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        const filtered = topics.filter((topic) =>
            topic.title.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTopics(filtered);
    }, [search, topics]);

    const handleAdd = () => {
        setEditingTopic(null);
        setTopicData({ title: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (topic: ForumTopic) => {
        setEditingTopic(topic);
        setTopicData({ title: topic.title });
        setIsModalOpen(true);
    };

    const handleDelete = (topic: ForumTopic) => {
        setDeletingTopic(topic);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTopic) return;

        try {
            await api.delete(`/topic-type/${deletingTopic.id}`);
            fetchTopics(); // Refresh topics after deletion
            setIsDeleteModalOpen(false);
            setDeletingTopic(null);
        } catch (err) {
            console.error('Error deleting topic:', err);
            setError('Error deleting topic');
        }
    };

    const handleSave = async () => {
        if (!topicData.title) return;

        try {
            const currentDate = new Date().toISOString();
            const payload = {
                title: topicData.title,
                createAt: editingTopic ? editingTopic.createAt : currentDate,
                updateAt: editingTopic ? currentDate : null,
                deleted: false,
            };

            if (editingTopic) {
                await api.put(`/topic-type/${editingTopic.id}`, payload);
                fetchTopics(); // Refresh topics after update
            } else {
                await api.post('/topic-type', payload);
                fetchTopics(); // Refresh topics after addition
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving topic:', err);
            setError('Error saving topic');
        }
    };

    return (
        <>
            <PageMeta
                title="Manage Forum"
                description="Forum topic management page in the system"
            />
            <PageBreadcrumb pageTitle="Forum" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Manage Forum
                        </h3>
                        <div className="flex gap-2">
                            <Button onClick={handleAdd}>Add New Topic</Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search topic by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                            Loading topic list...
                        </div>
                    )}

                    {error && (
                        <div className="py-8 text-center text-red-500 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-4">
                            {filteredTopics.length > 0 ? (
                                filteredTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-gray-100">
                                                    {topic.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Created: {new Date(topic.createAt).toLocaleDateString()}
                                                    </span>
                                                    {topic.updateAt && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • Updated: {new Date(topic.updateAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        • Status: {' '}
                                                        <Badge
                                                            variant="light"
                                                            color={topic.deleted ? 'error' : 'success'}
                                                        >
                                                            {topic.deleted ? 'Deleted' : 'Active'}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(topic)}
                                                >
                                                    Edit
                                                </Button> */}
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(topic)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                    No topics found matching your search criteria.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal thêm/chỉnh sửa chủ đề */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                        {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">
                                Topic Name*
                            </Label>
                            <Input
                                value={topicData.title}
                                onChange={(e) =>
                                    setTopicData({ ...topicData, title: e.target.value })
                                }
                                placeholder="Enter topic name"
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTopic ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
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
                        Confirm Deletion
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete the topic{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {deletingTopic?.title}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManageForum;