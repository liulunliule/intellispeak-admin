import React from "react";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { FiEdit2, FiTrash2, FiMoreVertical, FiTag } from "react-icons/fi";
import { squarelogo } from '../../../assets';
import { Topic } from "./types";

interface TopicRowProps {
    topic: Topic;
    editingId: number | null;
    editedTitle: string;
    editedDesc: string;
    setEditedTitle: (value: string) => void;
    setEditedDesc: (value: string) => void;
    handleEdit: (topic: Topic) => void;
    handleUpdate: () => void;
    handleCancelEdit: () => void;
    handleDeleteClick: (topicId: number) => void;
    handleDetailClick: (topic: Topic) => void;
    updating: boolean;
}

const TopicRow: React.FC<TopicRowProps> = ({
    topic,
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
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const dropdownButtonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                dropdownButtonRef.current &&
                !dropdownButtonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <tr key={topic.topicId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="px-3 py-4 text-center">
                <img
                    src={topic.thumbnail ?? squarelogo}
                    alt={topic.title}
                    className="rounded w-16 h-16 object-cover border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer"
                />
            </td>
            <td className="px-5 py-4 sm:px-6 text-start">
                {editingId === topic.topicId ? (
                    <Input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full"
                    />
                ) : (
                    <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {topic.title}
                        </span>
                        {topic.tags && topic.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {topic.tags.slice(0, 3).map(tag => (
                                    <span
                                        key={tag.tagId}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                                        {tag.title}
                                    </span>
                                ))}
                                {topic.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        +{topic.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </td>
            <td className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                {editingId === topic.topicId ? (
                    <Input
                        type="text"
                        value={editedDesc}
                        onChange={(e) => setEditedDesc(e.target.value)}
                        className="w-full"
                    />
                ) : (
                    <span className="block text-gray-500 text-theme-sm dark:text-gray-400 line-clamp-2">
                        {topic.description}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {editingId === topic.topicId ? (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate} disabled={updating}>
                            {updating ? "Đang lưu..." : "Lưu"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Hủy
                        </Button>
                    </div>
                ) : (
                    <div className="relative inline-block text-left" ref={dropdownRef}>
                        <button
                            ref={dropdownButtonRef}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FiMoreVertical className="h-5 w-5" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            handleDetailClick(topic);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <FiTag className="mr-2" /> Chi tiết & Tags
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleEdit(topic);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <FiEdit2 className="mr-2" /> Sửa
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDeleteClick(topic.topicId);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                    >
                                        <FiTrash2 className="mr-2" /> Xóa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
};

export default TopicRow;
