import { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import AllQuestions from "./AllQuestions";
import ConfirmationDialog from "../../../components/questions/ConfirmationDialog";
import MyQuestions from "./MyQuestions";
import Button from "../../../components/ui/button/Button";
import * as questionService from "../../../services/question";
import TextArea from "../../../components/form/input/TextArea";

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
    const [searchTerm, setSearchTerm] = useState(""); // New state for search term
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [topics, setTopics] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [errorTags, setErrorTags] = useState("");
    const [newTopic, setNewTopic] = useState("");
    const [newTopicDesc, setNewTopicDesc] = useState("");
    const [newTag, setNewTag] = useState("");
    const [newTagDesc, setNewTagDesc] = useState("");
    const [newQuestion, setNewQuestion] = useState("");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvImporting, setCsvImporting] = useState(false);
    const [csvImportError, setCsvImportError] = useState("");
    const [csvImportSuccess, setCsvImportSuccess] = useState("");
    const [createTab, setCreateTab] = useState<'manual' | 'csv'>('manual');
    const [questionContent, setQuestionContent] = useState("");
    const [questionDifficulty, setQuestionDifficulty] = useState("");
    const [suitableAnswer1, setSuitableAnswer1] = useState("");
    const [suitableAnswer2, setSuitableAnswer2] = useState("");
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [selectedAddTag, setSelectedAddTag] = useState<string | null>(null);
    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = useState(false);
    const [deleteTagInfo, setDeleteTagInfo] = useState<{ questionId: number; tagId: number } | null>(null);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
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

    useEffect(() => {
        fetchQuestions();
        fetchMyQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoadingQuestions(true);
        setErrorQuestions("");
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
        setLoadingQuestions(false);
    };

    const fetchMyQuestions = async () => {
        setLoadingMyQuestions(true);
        setErrorMyQuestions("");
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
        setLoadingMyQuestions(false);
    };

    const fetchQuestionDetail = async (questionId: number) => {
        setLoadingDetail(true);
        setErrorDetail("");
        const response = await questionService.getQuestionDetail(questionId);
        setQuestionDetail(response.data);
        setIsDetailModalOpen(true);
        setLoadingDetail(false);
    };

    const handleViewDetails = (questionId: number) => {
        fetchQuestionDetail(questionId);
    };

    const handleOpenUpdateModal = async (questionId: number) => {
        setLoadingUpdate(true);
        setErrorUpdate("");
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
        setLoadingUpdate(false);
    };

    const handleUpdateQuestion = async () => {
        if (!updateQuestionId || !updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1) return;

        setLoadingUpdate(true);
        setErrorUpdate("");
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
        setLoadingUpdate(false);
    };

    const handleDeleteQuestion = (questionId: number) => {
        setDeleteQuestionId(questionId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteQuestion = async () => {
        if (!deleteQuestionId) return;
        await questionService.deleteQuestion(deleteQuestionId);
        await fetchQuestions();
        await fetchMyQuestions();
        setIsDeleteModalOpen(false);
        setDeleteQuestionId(null);
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
        if (isCreateModalOpen || isAddTagModalOpen || isDeleteTagModalOpen || isUpdateModalOpen) {
            fetchTopics();
            fetchTags();
        }
    }, [isCreateModalOpen, isAddTagModalOpen, isDeleteTagModalOpen, isUpdateModalOpen]);

    const fetchTopics = async () => {
        setLoadingTags(true);
        setErrorTags("");
        try {
            const response = await questionService.getTopics();
            setTopics(response.data);
        } catch (error) {
            setErrorTags("Failed to load topics");
            console.error("Error fetching topics:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const fetchTags = async () => {
        setLoadingTags(true);
        setErrorTags("");
        const response = await questionService.getTags();
        setTags(response.data.data || []);
        setLoadingTags(false);
    };

    const connectTagToTopic = async (topicId: number, tagId: number) => {
        try {
            await questionService.connectTagToTopic(topicId, tagId);
        } catch (error) {
            console.error("Error connecting tag to topic:", error);
        }
    };

    const handleAddTopic = async () => {
        if (!newTopic || !newTopicDesc) return;
        try {
            const response = await questionService.createTopic({
                title: newTopic,
                description: newTopicDesc,
            });
            const newTopicId = response.data.topicId;
            setSelectedTopic(newTopic);
            setSelectedTopicId(newTopicId);
            setNewTopic("");
            setNewTopicDesc("");
            setCreateStep(2);
            await fetchTopics();
        } catch (error) {
            console.error("Error adding topic:", error);
        }
    };

    const handleAddTag = async () => {
        if (!newTag || !newTagDesc) return;
        try {
            await questionService.createTagForQuestion({
                title: newTag,
                description: newTagDesc,
            });
            await fetchTags();
            setSelectedTag(newTag);
            setNewTag("");
            setNewTagDesc("");
            setCreateStep(3);
        } catch (error) {
            console.error("Error adding tag:", error);
        }
    };

    const handleAddQuestion = async () => {
        if (!questionContent || !questionDifficulty || !suitableAnswer1) return;
        try {
            const selectedTagObj = tags.find((tag) => tag.title === selectedTag);

            if (!selectedTagObj || !selectedTopicId) {
                console.error("Tag or topic not found");
                return;
            }

            await questionService.createQuestion({
                title: newQuestion,
                content: questionContent,
                difficulty: questionDifficulty,
                suitableAnswer1,
                suitableAnswer2,
                tagIds: selectedTagObj ? [selectedTagObj.id] : [],
            });

            await connectTagToTopic(selectedTopicId, selectedTagObj.id);

            await fetchQuestions();
            await fetchMyQuestions();
            setIsCreateModalOpen(false);
            resetCreateFlow();
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const handleAddTagToQuestion = async () => {
        if (!selectedQuestionId || !selectedAddTag) return;
        try {
            const selectedTagObj = tags.find((tag) => tag.title === selectedAddTag);
            if (selectedTagObj) {
                await questionService.addTagToQuestion(selectedQuestionId, selectedTagObj.id);
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

    const requestDeleteTag = (questionId: number, tagId: number) => {
        setDeleteTagInfo({ questionId, tagId });
        setIsDeleteTagModalOpen(true);
    };

    const resetCreateFlow = () => {
        setCreateStep(1);
        setSelectedTopic(null);
        setSelectedTopicId(null);
        setSelectedTag(null);
        setNewTopic("");
        setNewTopicDesc("");
        setNewTag("");
        setNewTagDesc("");
        setNewQuestion("");
        setQuestionContent("");
        setQuestionDifficulty("");
        setSuitableAnswer1("");
        setSuitableAnswer2("");
    };

    useEffect(() => {
        if (!isCreateModalOpen) resetCreateFlow();
    }, [isCreateModalOpen]);

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

        // Apply search filter
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
                <Input
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
                onDeleteTag={requestDeleteTag}
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
                onDeleteTag={requestDeleteTag}
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

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
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
                                    <Label>Title</Label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90">
                                        {questionDetail.title}
                                    </p>
                                </div>
                                <div>
                                    <Label>Content</Label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90">
                                        {questionDetail.content}
                                    </p>
                                </div>
                                <div>
                                    <Label>Difficulty</Label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90 capitalize">
                                        {questionDetail.difficulty.toLowerCase()}
                                    </p>
                                </div>
                                <div>
                                    <Label>Tags</Label>
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
                                    <Label>Suitable Answer 1</Label>
                                    <p className="mt-1 text-gray-800 dark:text-white/90">
                                        {questionDetail.suitableAnswer1}
                                    </p>
                                </div>
                                {questionDetail.suitableAnswer2 && (
                                    <div>
                                        <Label>Suitable Answer 2</Label>
                                        <p className="mt-1 text-gray-800 dark:text-white/90">
                                            {questionDetail.suitableAnswer2}
                                        </p>
                                    </div>
                                )}
                                {questionDetail.source && (
                                    <div>
                                        <Label>Source</Label>
                                        <p className="mt-1 text-gray-800 dark:text-white/90">
                                            {questionDetail.source}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setIsDetailModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
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
                                <Label>Question title</Label>
                                <Input
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    placeholder="Enter question title"
                                />
                            </div>
                            <div>
                                <Label>Question content</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={4}
                                    value={updateContent}
                                    onChange={setUpdateContent}
                                    placeholder="Enter detailed question content"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Difficulty</Label>
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
                                    <Label>Source (optional)</Label>
                                    <Input
                                        value={updateSource}
                                        onChange={(e) => setUpdateSource(e.target.value)}
                                        placeholder="Enter source"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Suitable answer 1</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={2}
                                    value={updateSuitableAnswer1}
                                    onChange={setUpdateSuitableAnswer1}
                                    placeholder="Enter sample answer"
                                />
                            </div>
                            <div>
                                <Label>Suitable answer 2</Label>
                                <TextArea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    rows={2}
                                    value={updateSuitableAnswer2}
                                    onChange={setUpdateSuitableAnswer2}
                                    placeholder="Enter second sample answer"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateQuestion}
                                    disabled={!updateTitle || !updateContent || !updateDifficulty || !updateSuitableAnswer1}
                                >
                                    Update Question
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isAddTagModalOpen}
                onClose={() => setIsAddTagModalOpen(false)}
                className="max-w-md"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Add Tag to Question
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Select tag</Label>
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
                                        <option key={tag.id} value={tag.title}>
                                            {tag.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errorTags && <p className="text-red-500">{errorTags}</p>}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddTagModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddTagToQuestion}
                                disabled={!selectedAddTag}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteTagModalOpen}
                onClose={() => setIsDeleteTagModalOpen(false)}
                className="max-w-md"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Remove Tag from Question
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to remove this tag from the question? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteTagModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteTagFromQuestion}>
                            Remove
                        </Button>
                    </div>
                </div>
            </Modal>

            {isCreateModalOpen && (
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    className="max-w-2xl"
                >
                    <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                            Create New Question
                        </h3>
                        <div className="space-y-4">
                            {createStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>1. Select topic</Label>
                                        {loadingTags ? (
                                            <div className="py-2 text-gray-500">Loading topics...</div>
                                        ) : (
                                            <>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    value={selectedTopic || ""}
                                                    onChange={(e) => {
                                                        const selected = topics.find(t => t.title === e.target.value);
                                                        setSelectedTopic(e.target.value);
                                                        setSelectedTopicId(selected?.topicId || null);
                                                        if (e.target.value) setCreateStep(2);
                                                    }}
                                                >
                                                    <option value="" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">-- Select available topic --</option>
                                                    {topics.map((topic) => (
                                                        <option key={topic.topicId} value={topic.title}>
                                                            {topic.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="mt-4">
                                                    <Label>Or create new topic</Label>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Input
                                                                placeholder="Topic name"
                                                                value={newTopic}
                                                                onChange={(e) => setNewTopic(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <TextArea
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                                placeholder="Topic description"
                                                                rows={3}
                                                                value={newTopicDesc}
                                                                onChange={setNewTopicDesc}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            onClick={handleAddTopic}
                                                            disabled={!newTopic || !newTopicDesc}
                                                        >
                                                            Create topic
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {errorTags && <p className="text-red-500">{errorTags}</p>}
                                    </div>
                                </div>
                            )}
                            {createStep === 2 && selectedTopic && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>2. Select tag (category)</Label>
                                        {loadingTags ? (
                                            <div className="py-2 text-gray-500">Loading tags...</div>
                                        ) : (
                                            <>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    value={selectedTag || ""}
                                                    onChange={(e) => {
                                                        setSelectedTag(e.target.value);
                                                        if (e.target.value) setCreateStep(3);
                                                    }}
                                                >
                                                    <option value="">-- Select available tag --</option>
                                                    {tags.map((tag) => (
                                                        <option key={tag.id} value={tag.title}>
                                                            {tag.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="mt-4">
                                                    <Label>Or create new tag</Label>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Input
                                                                placeholder="Tag name"
                                                                value={newTag}
                                                                onChange={(e) => setNewTag(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <TextArea
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                                placeholder="Tag description"
                                                                rows={3}
                                                                value={newTagDesc}
                                                                onChange={setNewTagDesc}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            onClick={handleAddTag}
                                                            disabled={!newTag || !newTagDesc}
                                                        >
                                                            Create tag
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {errorTags && <p className="text-red-500">{errorTags}</p>}
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCreateStep(1)}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => setCreateStep(3)}
                                            disabled={!selectedTag && !newTag}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {createStep === 3 && selectedTag && (
                                <div className="space-y-4">
                                    <div className="flex gap-2 border-b mb-4">
                                        <button
                                            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${createTab === 'manual' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
                                            onClick={() => setCreateTab('manual')}
                                            type="button"
                                        >
                                            Input Question
                                        </button>
                                        <button
                                            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${createTab === 'csv' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
                                            onClick={() => setCreateTab('csv')}
                                            type="button"
                                        >
                                            Import CSV
                                        </button>
                                    </div>
                                    {createTab === 'manual' && (
                                        <>
                                            <div>
                                                <Label>Question title</Label>
                                                <Input
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                    placeholder="Enter question title"
                                                />
                                            </div>
                                            <div>
                                                <Label>Question content</Label>
                                                <TextArea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={4}
                                                    value={questionContent}
                                                    onChange={setQuestionContent}
                                                    placeholder="Enter detailed question content"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label>Difficulty</Label>
                                                    <select
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                        value={questionDifficulty}
                                                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                                                    >
                                                        <option value="">-- Select difficulty --</option>
                                                        <option value="EASY">Easy</option>
                                                        <option value="MEDIUM">Medium</option>
                                                        <option value="HARD">Hard</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Suitable answer 1</Label>
                                                <TextArea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={2}
                                                    value={suitableAnswer1}
                                                    onChange={setSuitableAnswer1}
                                                    placeholder="Enter sample answer"
                                                />
                                            </div>
                                            <div>
                                                <Label>Suitable answer 2</Label>
                                                <TextArea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={2}
                                                    value={suitableAnswer2}
                                                    onChange={setSuitableAnswer2}
                                                    placeholder="Enter second sample answer"
                                                />
                                            </div>
                                            <div className="flex justify-between pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCreateStep(2)}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={handleAddQuestion}
                                                    disabled={!questionContent || !questionDifficulty || !suitableAnswer1}
                                                >
                                                    Create question
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    {createTab === 'csv' && (
                                        <>
                                            <div>
                                                <Label>Import CSV file</Label>
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={e => {
                                                        setCsvImportError("");
                                                        setCsvImportSuccess("");
                                                        if (e.target.files && e.target.files[0]) {
                                                            setCsvFile(e.target.files[0]);
                                                        } else {
                                                            setCsvFile(null);
                                                        }
                                                    }}
                                                    className="block w-full text-sm text-gray-500"
                                                />
                                            </div>
                                            {csvImportError && (
                                                <div className="text-red-500 text-sm">{csvImportError}</div>
                                            )}
                                            {csvImportSuccess && (
                                                <div className="text-green-600 text-sm">{csvImportSuccess}</div>
                                            )}
                                            <div className="flex justify-between pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCreateStep(2)}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={async () => {
                                                        setCsvImportError("");
                                                        setCsvImportSuccess("");
                                                        if (!csvFile) {
                                                            setCsvImportError("Please select a CSV file.");
                                                            return;
                                                        }
                                                        const selectedTagObj = tags.find((tag) => tag.title === selectedTag);
                                                        if (!selectedTagObj) {
                                                            setCsvImportError("Please select a tag before importing.");
                                                            return;
                                                        }
                                                        setCsvImporting(true);
                                                        try {
                                                            await questionService.importCsvQuestions(selectedTagObj.id, csvFile);
                                                            setCsvImportSuccess("CSV imported successfully.");
                                                            await fetchQuestions();
                                                            await fetchMyQuestions();
                                                            setIsCreateModalOpen(false);
                                                            resetCreateFlow();
                                                        } catch (error) {
                                                            setCsvImportError((error as any).message || "Failed to import CSV.");
                                                        } finally {
                                                            setCsvImporting(false);
                                                        }
                                                    }}
                                                    disabled={csvImporting || !csvFile}
                                                >
                                                    {csvImporting ? "Importing..." : "Import CSV"}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}