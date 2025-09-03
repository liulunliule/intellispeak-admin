import { useState } from "react";
import Badge from "../../components/ui/badge/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { MoreDotIcon } from "../../icons";

interface Tag {
    tagId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface QuestionSet {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
}

interface QuestionTableProps {
    questionSets: QuestionSet[];
    onAddTag: (questionId: number) => void;
    onDeleteTag: (questionId: number, tagId: number) => void;
    onViewDetails: (questionId: number) => void;
    onUpdateQuestion: (questionId: number) => void;
    onDeleteQuestion: (questionId: number) => void;
}

export default function QuestionTable({
    questionSets,
    onAddTag,
    onDeleteTag,
    onViewDetails,
    onUpdateQuestion,
    onDeleteQuestion,
}: QuestionTableProps) {
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleDropdown = (id: number) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    // Calculate total pages and slice the questionSets for the current page
    const totalPages = Math.ceil(questionSets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSets = questionSets.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setDropdownOpen(null); // Close any open dropdown when changing pages
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Title
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tags
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Difficulty
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {paginatedSets.length > 0 ? (
                            paginatedSets.map((set) => (
                                <TableRow key={set.id}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-white/90">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-semibold">{set.title}</span>
                                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{set.content}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {set.tags.map((tag) => (
                                                <div key={tag.tagId} className="relative group">
                                                    <Badge color="primary">
                                                        {tag.title}
                                                    </Badge>
                                                    <span
                                                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/50 text-gray-600 text-[10px] font-medium cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600"
                                                        onClick={() => onDeleteTag(set.id, tag.tagId)}
                                                    >
                                                        ✕
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <Badge
                                            size="sm"
                                            color={
                                                set.difficulty === "Easy"
                                                    ? "success"
                                                    : set.difficulty === "Medium"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        >
                                            {set.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <div className="relative">
                                            <button
                                                onClick={() => handleDropdown(set.id)}
                                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <MoreDotIcon className="w-5 h-5 text-gray-500" />
                                            </button>
                                            {dropdownOpen === set.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                onViewDetails(set.id);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onUpdateQuestion(set.id);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onAddTag(set.id);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            Add Tag
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onDeleteQuestion(set.id);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No question sets found matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white ${currentPage === index + 1 ? "bg-gray-200 dark:bg-gray-700" : ""
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}