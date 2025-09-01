import React from 'react';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Badge from '../../components/ui/badge/Badge';
import { ChevronUpIcon, ChevronDownIcon } from '../../icons';
import { ForumTopic } from '../../services/forum';

interface TopicListProps {
    topics: ForumTopic[];
    filteredTopics: ForumTopic[];
    search: string;
    isTopicsExpanded: boolean;
    loading: boolean;
    error: string;
    setSearch: (value: string) => void;
    toggleTopics: () => void;
    handleAdd: () => void;
    handleEdit: (topic: ForumTopic) => void;
    handleDelete: (topic: ForumTopic) => void;
}

const TopicList: React.FC<TopicListProps> = ({
    topics,
    filteredTopics,
    search,
    isTopicsExpanded,
    loading,
    error,
    setSearch,
    toggleTopics,
    handleAdd,
    handleEdit,
    handleDelete,
}) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            onClick={toggleTopics}
                            className="cursor-pointer flex items-center justify-center"
                        >
                            {isTopicsExpanded ? (
                                <ChevronUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            )}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Manage Topic Forum
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd}>Add New Topic</Button>
                    </div>
                </div>

                {isTopicsExpanded && (
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
                )}

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

                {!loading && !error && isTopicsExpanded && (
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
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(topic)}
                                            >
                                                Edit
                                            </Button>
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
    );
};

export default TopicList;