import React from "react";
import TopicRow from "./TopicRow";
import type { Topic } from "./types";

interface TopicTableProps {
    loading: boolean;
    filteredTopics: Topic[];
    editingId: number | null;
    editedTitle: string;
    editedDesc: string;
    setEditedTitle: (v: string) => void;
    setEditedDesc: (v: string) => void;
    handleEdit: (topic: Topic) => void;
    handleUpdate: () => void;
    handleCancelEdit: () => void;
    handleDeleteClick: (topicId: number) => void;
    handleDetailClick: (topic: Topic) => void;
    updating: boolean;
}

const TopicTable: React.FC<TopicTableProps> = ({
    loading,
    filteredTopics,
    editingId,
    editedTitle,
    editedDesc,
    setEditedTitle,
    setEditedDesc,
    handleEdit,
    handleUpdate,
    handleCancelEdit,
    handleDeleteClick,
    handleDetailClick,
    updating,
}) => (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-3 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400 w-20">
                            Image
                        </th>
                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Topic Name
                        </th>
                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Description
                        </th>
                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="py-8 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            </td>
                        </tr>
                    ) : filteredTopics.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                No topics available
                            </td>
                        </tr>
                    ) : (
                        filteredTopics.map((topic) => (
                            <TopicRow
                                key={topic.topicId}
                                topic={topic}
                                editingId={editingId}
                                editedTitle={editedTitle}
                                editedDesc={editedDesc}
                                setEditedTitle={setEditedTitle}
                                setEditedDesc={setEditedDesc}
                                handleEdit={handleEdit}
                                handleUpdate={handleUpdate}
                                handleCancelEdit={handleCancelEdit}
                                handleDeleteClick={handleDeleteClick}
                                handleDetailClick={handleDetailClick}
                                updating={updating}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default TopicTable;
