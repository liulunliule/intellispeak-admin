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
    const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
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
                title="Quản lý Diễn đàn"
                description="Trang quản lý các chủ đề diễn đàn trong hệ thống"
            />
            <PageBreadcrumb pageTitle="Diễn đàn" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Quản lý Diễn đàn
                        </h3>
                        <div className="flex gap-2">
                            <Button onClick={handleAdd}>Thêm Chủ đề mới</Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm chủ đề theo tên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                            Đang tải danh sách chủ đề...
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
                                                        Tạo: {new Date(topic.createAt).toLocaleDateString()}
                                                    </span>
                                                    {topic.updateAt && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            • Cập nhật:{' '}
                                                            {new Date(topic.updateAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        • Trạng thái:{' '}
                                                        <Badge
                                                            variant="light"
                                                            color={topic.deleted ? 'error' : 'success'}
                                                        >
                                                            {topic.deleted ? 'Đã xóa' : 'Hoạt động'}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(topic)}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                    Không tìm thấy chủ đề nào phù hợp với tiêu chí tìm kiếm.
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
                        {editingTopic ? 'Chỉnh sửa Chủ đề' : 'Thêm Chủ đề mới'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-800 dark:text-gray-100">
                                Tên Chủ đề*
                            </Label>
                            <Input
                                value={topicData.title}
                                onChange={(e) =>
                                    setTopicData({ ...topicData, title: e.target.value })
                                }
                                placeholder="Nhập tên chủ đề"
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTopic ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManageForum;