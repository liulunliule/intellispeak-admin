import { useState } from "react";
import { Button } from "../../../components/ui/button";
import QuestionTable from "../../../components/questions/QuestionTable";
import { QuestionSet } from "./ManageQuestions";
import { ChevronDown, ChevronUp } from "react-feather";

interface MyQuestionsProps {
    loading: boolean;
    error: string;
    questionSets: QuestionSet[];
    filteredSets: QuestionSet[];
    currentTag: string;
    currentDifficulty: string;
    currentSort: string;
    filterTags: string[];
    onTagChange: (tag: string) => void;
    onDifficultyChange: (difficulty: string) => void;
    onSortChange: (sortBy: string) => void;
    onAddTag: (questionId: number) => void;
    onDeleteTag: (questionId: number, tagId: number) => void;
    onCreateQuestion: () => void;
}

export default function MyQuestions({
    loading,
    error,
    filteredSets,
    currentTag,
    currentDifficulty,
    currentSort,
    filterTags,
    onTagChange,
    onDifficultyChange,
    onSortChange,
    onAddTag,
    onDeleteTag,
    onCreateQuestion,
}: MyQuestionsProps) {
    const [isExpanded, setIsExpanded] = useState(true); // State để điều khiển hiển thị

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
            <div className="flex flex-col gap-6">
                {/* Phần tiêu đề với mũi tên toggle */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center">
                            Câu hỏi của tôi
                            <span className="ml-2">
                                {isExpanded ? (
                                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                                )}
                            </span>
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={onCreateQuestion}
                            className="whitespace-nowrap"
                        >
                            Tạo câu hỏi mới
                        </Button>
                    </div>
                </div>

                {/* Phần nội dung sẽ ẩn/hiện theo trạng thái isExpanded */}
                {isExpanded && (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white"
                                    value={currentTag}
                                    onChange={(e) => onTagChange(e.target.value)}
                                >
                                    <option value="">Tất cả tag</option>
                                    {filterTags.map((tag) => (
                                        <option key={tag} value={tag}>
                                            {tag}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white"
                                    value={currentDifficulty}
                                    onChange={(e) => onDifficultyChange(e.target.value)}
                                >
                                    <option value="">Tất cả độ khó</option>
                                    <option value="Easy">Dễ</option>
                                    <option value="Medium">Trung bình</option>
                                    <option value="Hard">Khó</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Sắp xếp theo:
                                </span>
                                <select
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white"
                                    value={currentSort}
                                    onChange={(e) => onSortChange(e.target.value)}
                                >
                                    <option value="title">Tiêu đề (A-Z)</option>
                                    <option value="title-desc">Tiêu đề (Z-A)</option>
                                    <option value="difficulty">Độ khó (Dễ đến Khó)</option>
                                    <option value="difficulty-desc">Độ khó (Khó đến Dễ)</option>
                                </select>
                            </div>
                        </div>

                        {loading && (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Đang tải danh sách câu hỏi của bạn...
                            </div>
                        )}
                        {error && (
                            <div className="py-8 text-center text-red-500 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        {!loading && !error && (
                            <QuestionTable
                                questionSets={filteredSets}
                                onAddTag={onAddTag}
                                onDeleteTag={onDeleteTag}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}