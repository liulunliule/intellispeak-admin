import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import TopicList from './TopicList';
import PostList from './PostList';
import { getForumTopics, addForumTopic, updateForumTopic, deleteForumTopic, ForumTopic, ForumPost, getForumPosts } from '../../services/forum';

const ManageForum: React.FC = () => {
    // State for Manage Topic Forum
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
    const [deletingTopic, setDeletingTopic] = useState<ForumTopic | null>(null);
    const [topicData, setTopicData] = useState({ title: '' });
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [errorTopics, setErrorTopics] = useState('');
    const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);

    // State for Manage Forum Post
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
    const [postSearch, setPostSearch] = useState('');
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [errorPosts, setErrorPosts] = useState('');
    const [isPostsExpanded, setIsPostsExpanded] = useState(true);

    // Fetch topics
    const fetchTopics = async () => {
        setLoadingTopics(true);
        setErrorTopics('');
        try {
            const data = await getForumTopics();
            setTopics(data);
            setFilteredTopics(data);
        } catch (err) {
            setErrorTopics('Error fetching forum topics');
            console.error('Error fetching topics:', err);
        } finally {
            setLoadingTopics(false);
        }
    };

    // Fetch posts
    const fetchPosts = async () => {
        setLoadingPosts(true);
        setErrorPosts('');
        try {
            const data = await getForumPosts();
            setPosts(data);
            setFilteredPosts(data);
        } catch (err) {
            setErrorPosts('Error fetching forum posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchTopics();
        fetchPosts();
    }, []);

    // Filter topics
    useEffect(() => {
        const filtered = topics.filter((topic) =>
            topic.title.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTopics(filtered);
    }, [search, topics]);

    // Filter posts
    useEffect(() => {
        const filtered = posts.filter((post) =>
            post.title.toLowerCase().includes(postSearch.toLowerCase())
        );
        setFilteredPosts(filtered);
    }, [postSearch, posts]);

    const handleAddTopic = () => {
        setEditingTopic(null);
        setTopicData({ title: '' });
        setIsModalOpen(true);
    };

    const handleEditTopic = (topic: ForumTopic) => {
        setEditingTopic(topic);
        setTopicData({ title: topic.title });
        setIsModalOpen(true);
    };

    const handleDeleteTopic = (topic: ForumTopic) => {
        setDeletingTopic(topic);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTopic = async () => {
        if (!deletingTopic) return;

        try {
            await deleteForumTopic(deletingTopic.id);
            fetchTopics();
            setIsDeleteModalOpen(false);
            setDeletingTopic(null);
        } catch (err) {
            console.error('Error deleting topic:', err);
            setErrorTopics('Error deleting topic');
        }
    };

    const handleSaveTopic = async () => {
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
                await updateForumTopic(editingTopic.id, payload);
            } else {
                await addForumTopic(payload);
            }
            fetchTopics();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving topic:', err);
            setErrorTopics('Error saving topic');
        }
    };

    const toggleTopics = () => {
        setIsTopicsExpanded(!isTopicsExpanded);
    };

    const togglePosts = () => {
        setIsPostsExpanded(!isPostsExpanded);
    };

    return (
        <>
            <PageMeta
                title="Manage Forum"
                description="Forum topic and post management page in the system"
            />
            <PageBreadcrumb pageTitle="Forum" />

            {/* Topic List Component */}
            <TopicList
                topics={topics}
                filteredTopics={filteredTopics}
                search={search}
                isTopicsExpanded={isTopicsExpanded}
                loading={loadingTopics}
                error={errorTopics}
                setSearch={setSearch}
                toggleTopics={toggleTopics}
                handleAdd={handleAddTopic}
                handleEdit={handleEditTopic}
                handleDelete={handleDeleteTopic}
            />

            {/* Post List Component */}
            <PostList
                posts={posts}
                filteredPosts={filteredPosts}
                search={postSearch}
                isPostsExpanded={isPostsExpanded}
                loading={loadingPosts}
                error={errorPosts}
                setSearch={setPostSearch}
                togglePosts={togglePosts}
            />

            {/* Modal for adding/editing topic */}
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
                            <Button onClick={handleSaveTopic}>
                                {editingTopic ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal for confirming topic deletion */}
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
                            onClick={confirmDeleteTopic}
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