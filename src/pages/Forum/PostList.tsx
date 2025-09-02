import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import { ChevronUpIcon, ChevronDownIcon, MoreDotIcon } from '../../icons';
import { Modal } from '../../components/ui/modal';
import { ForumPost, deleteForumPost } from '../../services/forum';

interface PostListProps {
    posts: ForumPost[];
    filteredPosts: ForumPost[];
    search: string;
    isPostsExpanded: boolean;
    loading: boolean;
    error: string;
    setSearch: (value: string) => void;
    togglePosts: () => void;
    onPostDeleted?: () => void; // Optional callback to refresh posts in parent component
}

const PostList: React.FC<PostListProps> = ({
    filteredPosts,
    search,
    isPostsExpanded,
    loading,
    error,
    setSearch,
    togglePosts,
    onPostDeleted,
}) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPost, setDeletingPost] = useState<ForumPost | null>(null);

    const toggleDropdown = (postId: number) => {
        setDropdownOpen(dropdownOpen === postId ? null : postId);
    };

    const handleViewDetail = (postId: number) => {
        navigate(`/single-post/${postId}`);
        setDropdownOpen(null);
    };

    const handleDelete = (post: ForumPost) => {
        setDeletingPost(post);
        setIsDeleteModalOpen(true);
        setDropdownOpen(null);
    };

    const confirmDelete = async () => {
        if (!deletingPost) return;

        try {
            await deleteForumPost(deletingPost.postId);
            onPostDeleted?.(); // Notify parent to refresh posts
            setIsDeleteModalOpen(false);
            setDeletingPost(null);
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            onClick={togglePosts}
                            className="cursor-pointer flex items-center justify-center"
                        >
                            {isPostsExpanded ? (
                                <ChevronUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            )}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Manage Forum Post
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <Button>Add New Post</Button>
                    </div>
                </div>

                {isPostsExpanded && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search post by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="py-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading post list...</p>
                    </div>
                )}

                {error && (
                    <div className="py-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    </div>
                )}

                {!loading && !error && isPostsExpanded && (
                    <div className="space-y-4">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <div
                                    key={post.postId}
                                    className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={post.thumbnail}
                                                alt={`${post.title} thumbnail`}
                                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => handleViewDetail(post.postId)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-gray-100">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Created: {new Date(post.createAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    • Topic: {post.forumTopicType.title}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    • Posted by: {post.userName}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    • Reactions: {post.reactionCount}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(post.postId)}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                            >
                                                <MoreDotIcon className="h-5 w-5" />
                                            </button>
                                            {dropdownOpen === post.postId && (
                                                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleViewDetail(post.postId)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(post)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                No posts found matching your search criteria.
                            </div>
                        )}
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
                                {deletingPost?.title}
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
            </div>
        </div>
    );
};

export default PostList;