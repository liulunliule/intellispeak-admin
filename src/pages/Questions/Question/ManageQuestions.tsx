import { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AllQuestions from "./AllQuestions";
import ConfirmationDialog from "../../../components/questions/ConfirmationDialog";
import MyQuestions from "./MyQuestions";
import CreateQuestionModal from "./CreateQuestionModal";
import * as questionService from "../../../services/question";
import * as topicService from "../../../services/topic";
import * as templateService from "../../../services/template";
import { Modal } from "../../../components/ui/modal";

interface Tag {
    tagId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface Question {
    questionId: number;
    title: string;
    content: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    suitableAnswer1: string;
    suitableAnswer2: string;
    tags: Tag[];
    deleted: boolean;
}

export interface QuestionSet {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
}

interface QuestionDetail {
    questionId: number;
    title: string;
    content: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    suitableAnswer1: string;
    suitableAnswer2: string;
    tags: Tag[];
    deleted: boolean;
    source?: string;
}

export default function ManageQuestions() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [loadingMyQuestions, setLoadingMyQuestions] = useState(false);
    const [errorQuestions, setErrorQuestions] = useState("");
    const [errorMyQuestions, setErrorMyQuestions] = useState("");
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [myQuestionSets, setMyQuestionSets] = useState<QuestionSet[]>([]);
    const [filteredSets, setFilteredSets] = useState<QuestionSet[]>([]);
    const [filteredMySets, setFilteredMySets] = useState<QuestionSet[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [currentDifficulty, setCurrentDifficulty] = useState("");
    const [currentSort, setCurrentSort] = useState("title");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [selectedAddTag, setSelectedAddTag] = useState<string | null>(null);
    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = useState(false);
    const [deleteTagInfo, setDeleteTagInfo] = useState<{ questionId: number; tagId: number } | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorDetail, setErrorDetail] = useState("");
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateContent, setUpdateContent] = useState("");
    const [updateDifficulty, setUpdateDifficulty] = useState("");
    const [updateSuitableAnswer1, setUpdateSuitableAnswer1] = useState("");
    const [updateSuitableAnswer2, setUpdateSuitableAnswer2] = useState("");
    const [updateSource, setUpdateSource] = useState("");
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [errorUpdate, setErrorUpdate] = useState("");
    const [tags, setTags] = useState<any[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [errorTags, setErrorTags] = useState("");

    useEffect(() => {
        fetchQuestions();
        fetchMyQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoadingQuestions(true);
        setErrorQuestions("");
        try {
            const response = await questionService.getQuestions();
            const convertedSets = response.data.map((q: Question) => ({
                id: q.questionId,
                title: q.title,
                content: q.content,
                tags: q.tags,
                difficulty: convertDifficulty(q.difficulty),
                sampleAnswer: q.suitableAnswer1,
            }));
            setQuestionSets(convertedSets);
            setFilteredSets(convertedSets);
        } catch (error) {
            setErrorQuestions("Failed to load questions");
            console.error("Error fetching questions:", error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const fetchMyQuestions = async () => {
        setLoadingMyQuestions(true);
        setErrorMyQuestions("");
        try {
            const response = await questionService.getMyQuestions();
            const convertedSets = response.data.data.map((q: Question) => ({
                id: q.questionId,
                title: q.title,
                content: q.content,
                tags: q.tags,
                difficulty: convertDifficulty(q.difficulty),
                sampleAnswer: q.suitableAnswer1,
            }));
            setMyQuestionSets(convertedSets);
            setFilteredMySets(convertedSets);
        } catch (error) {
            setErrorMyQuestions("Failed to load my questions");
            console.error("Error fetching my questions:", error);
        } finally {
            setLoadingMyQuestions(false);
        }
    };

    const fetchQuestionDetail = async (questionId: number) => {
        setLoadingDetail(true);
        setErrorDetail("");
        try {
            const response = await questionService.getQuestionDetail(questionId);
            setQuestionDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            setErrorDetail("Failed to load question details");
            console.error("Error fetching question details:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleViewDetails = (questionId: number) => {
        fetchQuestionDetail(questionId);
    };

    const handleOpenUpdateModal = async (questionId: number) => {
        setLoadingUpdate(true);
        setErrorUpdate("");
        try {
            const response = await questionService.getQuestionDetail(questionId);
            const question = response.data;
            setUpdateQuestionId(questionId);
            setUpdateTitle(question.title);
            setUpdateContent(question.content);
            setUpdateDifficulty(question.difficulty);
            setUpdateSuitableAnswer1(question.suitableAnswer1);
            setUpdateSuitableAnswer2(question.suitableAnswer2 || "");
            setUpdateSource(question.source || "");
            setIsUpdateModalOpen(true);
        } catch (error) {
            setErrorUpdate("Failed to load question details");
            console.error("Error fetching question details:", error);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleUpdateQuestion = async () => {
        if (!updateQuestionId || !updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1) return;

        setLoadingUpdate(true);
        setErrorUpdate("");
        try {
            await questionService.updateQuestion(updateQuestionId, {
                title: updateTitle,
                content: updateContent,
                suitableAnswer1: updateSuitableAnswer1,
                suitableAnswer2: updateSuitableAnswer2,
                difficulty: updateDifficulty,
                source: updateSource
            });
            await fetchQuestions();
            await fetchMyQuestions();
            setIsUpdateModalOpen(false);
            setUpdateQuestionId(null);
        } catch (error) {
            setErrorUpdate("Failed to update question");
            console.error("Error updating question:", error);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleDeleteQuestion = (questionId: number) => {
        setDeleteQuestionId(questionId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteQuestion = async () => {
        if (!deleteQuestionId) return;
        try {
            await questionService.deleteQuestion(deleteQuestionId);
            await fetchQuestions();
            await fetchMyQuestions();
            setIsDeleteModalOpen(false);
            setDeleteQuestionId(null);
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const fetchTags = async () => {
        setLoadingTags(true);
        setErrorTags("");
        try {
            const response = await topicService.getTopicsWithTags();
            const combinedTags = response.flatMap((topic: any) => topic.tags || []);
            const uniqueTags = Array.from(
                new Map(combinedTags.map((tag: any) => [tag.tagId, tag])).values()
            );
            setTags(uniqueTags);
        } catch (error) {
            setErrorTags("Failed to load tags");
            console.error("Error fetching tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleAddTagToQuestion = async () => {
        if (!selectedQuestionId || !selectedAddTag) return;
        try {
            const selectedTagObj = tags.find((tag) => tag.title === selectedAddTag);
            if (selectedTagObj) {
                await questionService.addTagToQuestion(selectedQuestionId, selectedTagObj.tagId);
                await fetchQuestions();
                await fetchMyQuestions();
                setIsAddTagModalOpen(false);
                setSelectedQuestionId(null);
                setSelectedAddTag(null);
            }
        } catch (error) {
            console.error("Error adding tag to question:", error);
        }
    };

    const handleDeleteTagFromQuestion = async () => {
        if (!deleteTagInfo) return;
        try {
            await questionService.deleteTagFromQuestion(deleteTagInfo.questionId, deleteTagInfo.tagId);
            await fetchQuestions();
            await fetchMyQuestions();
            setIsDeleteTagModalOpen(false);
            setDeleteTagInfo(null);
        } catch (error) {
            console.error("Error deleting tag from question:", error);
        }
    };

    const handleCreateQuestionSuccess = async () => {
        await fetchQuestions();
        await fetchMyQuestions();
        setIsCreateModalOpen(false);
    };

    const convertDifficulty = (difficulty: string): "Easy" | "Medium" | "Hard" => {
        switch (difficulty) {
            case "EASY": return "Easy";
            case "MEDIUM": return "Medium";
            case "HARD": return "Hard";
            default: return "Medium";
        }
    };

    useEffect(() => {
        if (isAddTagModalOpen || isDeleteTagModalOpen || isUpdateModalOpen) {
            fetchTags();
        }
    }, [isAddTagModalOpen, isDeleteTagModalOpen, isUpdateModalOpen]);

    const filterTags = Array.from(
        new Set(
            questionSets
                .flatMap((set) => set.tags.map((tag) => tag.title))
                .filter((tag) => tag)
        )
    );

    const applyFiltersAndSort = () => {
        let filtered = [...questionSets];
        let filteredMy = [...myQuestionSets];

        if (searchTerm) {
            filtered = filtered.filter((set) =>
                set.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            filteredMy = filteredMy.filter((set) =>
                set.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (currentTag) {
            filtered = filtered.filter((set) =>
                set.tags.some((tag) => tag.title === currentTag)
            );
            filteredMy = filteredMy.filter((set) =>
                set.tags.some((tag) => tag.title === currentTag)
            );
        }

        if (currentDifficulty) {
            filtered = filtered.filter((set) => set.difficulty === currentDifficulty);
            filteredMy = filteredMy.filter((set) => set.difficulty === currentDifficulty);
        }

        const sortFunction = (a: QuestionSet, b: QuestionSet) => {
            switch (currentSort) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                case "difficulty":
                    const order = { Easy: 1, Medium: 2, Hard: 3 };
                    return order[a.difficulty] - order[b.difficulty];
                case "difficulty-desc":
                    const descOrder = { Easy: 3, Medium: 2, Hard: 1 };
                    return descOrder[a.difficulty] - descOrder[b.difficulty];
                default:
                    return 0;
            }
        };

        filtered.sort(sortFunction);
        filteredMy.sort(sortFunction);

        setFilteredSets(filtered);
        setFilteredMySets(filteredMy);
    };

    useEffect(() => {
        applyFiltersAndSort();
    }, [searchTerm, currentTag, currentDifficulty, currentSort, questionSets, myQuestionSets]);

    const handleTagChange = (tag: string) => {
        setCurrentTag(tag);
    };

    const handleDifficultyChange = (difficulty: string) => {
        setCurrentDifficulty(difficulty);
    };

    const handleSortChange = (sortBy: string) => {
        setCurrentSort(sortBy);
    };

    const openAddTagModal = (questionId: number) => {
        setSelectedQuestionId(questionId);
        setIsAddTagModalOpen(true);
    };

    return (
        <>
            <PageMeta
                title="Manage Question Sets"
                description="This is the React.js Question Set Management page"
            />
            <PageBreadcrumb pageTitle="Questions" />

            <div className="mb-6">
                <input
                    placeholder="Search questions by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            <MyQuestions
                loading={loadingMyQuestions}
                error={errorMyQuestions}
                questionSets={myQuestionSets}
                filteredSets={filteredMySets}
                currentTag={currentTag}
                currentDifficulty={currentDifficulty}
                currentSort={currentSort}
                filterTags={filterTags}
                onTagChange={handleTagChange}
                onDifficultyChange={handleDifficultyChange}
                onSortChange={handleSortChange}
                onAddTag={openAddTagModal}
                onDeleteTag={(questionId, tagId) => setDeleteTagInfo({ questionId, tagId })}
                onCreateQuestion={() => setIsCreateModalOpen(true)}
                onViewDetails={handleViewDetails}
                onUpdateQuestion={handleOpenUpdateModal}
                onDeleteQuestion={handleDeleteQuestion}
            />

            <AllQuestions
                loading={loadingQuestions}
                error={errorQuestions}
                questionSets={questionSets}
                filteredSets={filteredSets}
                currentTag={currentTag}
                currentDifficulty={currentDifficulty}
                currentSort={currentSort}
                filterTags={filterTags}
                onTagChange={handleTagChange}
                onDifficultyChange={handleDifficultyChange}
                onSortChange={handleSortChange}
                onAddTag={openAddTagModal}
                onDeleteTag={(questionId, tagId) => setDeleteTagInfo({ questionId, tagId })}
                onViewDetails={handleViewDetails}
                onUpdateQuestion={handleOpenUpdateModal}
                onDeleteQuestion={handleDeleteQuestion}
            />

            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteQuestion}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />

            <CreateQuestionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onQuestionCreated={handleCreateQuestionSuccess}
                questionService={questionService}
                topicService={topicService}
                templateService={templateService}
            />

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                className="max-w-2xl p-6"
            >
                {loadingDetail && (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading question details...
                    </div>
                )}
                {errorDetail && (
                    <div className="py-8 text-center text-red-500 dark:text-red-400">
                        {errorDetail}
                    </div>
                )}
                {questionDetail && !loadingDetail && !errorDetail && (
                    <>
                        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                            Question Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <p className="mt-1 text-gray-800 dark:text-white/90">
                                    {questionDetail.title}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                                <p className="mt-1 text-gray-800 dark:text-white/90">
                                    {questionDetail.content}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                                <p className="mt-1 text-gray-800 dark:text-white/90 capitalize">
                                    {questionDetail.difficulty.toLowerCase()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {questionDetail.tags.map((tag) => (
                                        <span
                                            key={tag.tagId}
                                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        >
                                            {tag.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suitable Answer 1</label>
                                <p className="mt-1 text-gray-800 dark:text-white/90">
                                    {questionDetail.suitableAnswer1}
                                </p>
                            </div>
                            {questionDetail.suitableAnswer2 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suitable Answer 2</label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90">
                                        {questionDetail.suitableAnswer2}
                                    </p>
                                </div>
                            )}
                            {questionDetail.source && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90">
                                        {questionDetail.source}
                                    </p>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                    onClick={() => setIsDetailModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                className="max-w-2xl p-6"
            >
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Update Question
                </h3>
                {loadingUpdate && (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                        Loading question data...
                    </div>
                )}
                {errorUpdate && (
                    <div className="py-4 text-center text-red-500 dark:text-red-400">
                        {errorUpdate}
                    </div>
                )}
                {!loadingUpdate && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question title</label>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={updateTitle}
                                onChange={(e) => setUpdateTitle(e.target.value)}
                                placeholder="Enter question title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question content</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                rows={4}
                                value={updateContent}
                                onChange={(e) => setUpdateContent(e.target.value)}
                                placeholder="Enter detailed question content"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={updateDifficulty}
                                    onChange={(e) => setUpdateDifficulty(e.target.value)}
                                >
                                    <option value="">-- Select difficulty --</option>
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source (optional)</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={updateSource}
                                    onChange={(e) => setUpdateSource(e.target.value)}
                                    placeholder="Enter source"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suitable answer 1</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                rows={2}
                                value={updateSuitableAnswer1}
                                onChange={(e) => setUpdateSuitableAnswer1(e.target.value)}
                                placeholder="Enter sample answer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suitable answer 2</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                rows={2}
                                value={updateSuitableAnswer2}
                                onChange={(e) => setUpdateSuitableAnswer2(e.target.value)}
                                placeholder="Enter second sample answer"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                onClick={() => setIsUpdateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                onClick={handleUpdateQuestion}
                                disabled={!updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1}
                            >
                                Update Question
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isAddTagModalOpen}
                onClose={() => setIsAddTagModalOpen(false)}
                className="max-w-md p-6"
            >
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Add Tag to Question
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select tag</label>
                        {loadingTags ? (
                            <div className="py-2 text-gray-500">Loading tags...</div>
                        ) : (
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={selectedAddTag || ""}
                                onChange={(e) => setSelectedAddTag(e.target.value)}
                            >
                                <option value="">-- Select tag --</option>
                                {tags.map((tag) => (
                                    <option key={tag.tagId} value={tag.title}>
                                        {tag.title}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errorTags && <p className="text-red-500">{errorTags}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            onClick={() => setIsAddTagModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            onClick={handleAddTagToQuestion}
                            disabled={!selectedAddTag}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteTagModalOpen}
                onClose={() => setIsDeleteTagModalOpen(false)}
                className="max-w-md p-6"
            >
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Remove Tag from Question
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Are you sure you want to remove this tag from the question? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => setIsDeleteTagModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        onClick={handleDeleteTagFromQuestion}
                    >
                        Remove
                    </button>
                </div>
            </Modal>
        </>
    );
}