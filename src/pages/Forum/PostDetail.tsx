import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ForumPost, getForumPostById, ForumReply, getForumPostReplies, deleteForumPost } from '../../services/forum';
import Button from '../../components/ui/button/Button';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { Modal } from '../../components/ui/modal';

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<ForumPost | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [error, setError] = useState('');
    const [errorReplies, setErrorReplies] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setLoading(true);
            setError('');
            try {
                const data = await getForumPostById(Number(id));
                setPost(data);
            } catch (err) {
                setError('Error fetching post details');
                console.error('Error fetching post details:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchReplies = async () => {
            if (!id) return;
            setLoadingReplies(true);
            setErrorReplies('');
            try {
                const data = await getForumPostReplies(Number(id));
                setReplies(data);
            } catch (err) {
                setErrorReplies('Error fetching post replies');
                console.error('Error fetching post replies:', err);
            } finally {
                setLoadingReplies(false);
            }
        };

        fetchPost();
        fetchReplies();
    }, [id]);

    const handleDeletePost = () => {
        setIsDeleteModalOpen(true);
        setDeleteError('');
    };

    const confirmDeletePost = async () => {
        if (!id) return;
        try {
            await deleteForumPost(Number(id));
            setIsDeleteModalOpen(false);
            navigate('/manage-forum');
        } catch (err) {
            console.error('Error deleting post:', err);
            setDeleteError('Error deleting post');
        }
    };

    return (
        <>
            <PageMeta
                title={post?.title || 'Post Detail'}
                description="Details of a specific forum post"
            />
            <PageBreadcrumb pageTitle="Post Detail" />

            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg max-w-4xl mx-auto">
                {loading && (
                    <div className="py-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading post details...</p>
                    </div>
                )}
                {error && (
                    <div className="py-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    </div>
                )}
                {!loading && !error && post && (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                                {post.title}
                            </h3>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post.avatar}
                                    alt={`${post.userName}'s avatar`}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                        {post.userName}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Posted on {new Date(post.createAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-4 sm:mt-0 sm:ml-auto">
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {post.forumTopicType.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {post.readTimeEstimate} min
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {post.reactionCount} reactions
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        {/* {post.image && post.image.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  />
                ))}
              </div>
            )} */}

                        {/* Content */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-sm prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-100">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>

                        {/* Replies */}
                        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
                            <h4 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Comments</h4>
                            {loadingReplies && (
                                <div className="py-8 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
                                </div>
                            )}
                            {errorReplies && (
                                <div className="py-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <p className="text-red-500 dark:text-red-400">{errorReplies}</p>
                                </div>
                            )}
                            {!loadingReplies && !errorReplies && replies.length > 0 ? (
                                replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0"
                                    >
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={reply.user.avatar}
                                                alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                                                        {reply.user.firstName} {reply.user.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(reply.createAt).toLocaleDateString()}
                                                    </span>
                                                    {reply.yours && (
                                                        <span className="text-xs text-blue-500 dark:text-blue-400">
                                                            (You)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-gray-700 dark:text-gray-200 leading-relaxed">{reply.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !loadingReplies && !errorReplies && (
                                    <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                                        No comments yet.
                                    </div>
                                )
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="danger"
                                onClick={handleDeletePost}
                                className="px-6 py-2"
                            >
                                Delete Post
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/manage-forum')}
                                className="px-6 py-2"
                            >
                                Back to Forum
                            </Button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
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
                            Are you sure you want to delete the post{' '}
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {post?.title}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        {deleteError && (
                            <p className="mb-4 text-red-500 dark:text-red-400">{deleteError}</p>
                        )}
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-6 py-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDeletePost}
                                className="px-6 py-2"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default PostDetail;