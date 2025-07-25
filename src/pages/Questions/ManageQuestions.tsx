import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import QuestionTable from "../../components/questions/QuestionTable";
import api from "../../services/api";

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

interface QuestionSet {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
}

export default function ManageQuestions() {
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [errorQuestions, setErrorQuestions] = useState("");
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [filteredSets, setFilteredSets] = useState<QuestionSet[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [currentDifficulty, setCurrentDifficulty] = useState("");
    const [currentSort, setCurrentSort] = useState("title");
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
    const [questionContent, setQuestionContent] = useState("");
    const [questionDifficulty, setQuestionDifficulty] = useState("");
    const [suitableAnswer1, setSuitableAnswer1] = useState("");
    const [suitableAnswer2, setSuitableAnswer2] = useState("");
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [selectedAddTag, setSelectedAddTag] = useState<string | null>(null);
    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = useState(false);
    const [deleteTagInfo, setDeleteTagInfo] = useState<{ questionId: number; tagId: number } | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoadingQuestions(true);
        setErrorQuestions("");
        try {
            const response = await api.get("/question");
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
            setErrorQuestions("Lỗi tải danh sách câu hỏi");
            console.error("Error fetching questions:", error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const convertDifficulty = (difficulty: string): "Easy" | "Medium" | "Hard" => {
        switch (difficulty) {
            case "EASY":
                return "Easy";
            case "MEDIUM":
                return "Medium";
            case "HARD":
                return "Hard";
            default:
                return "Medium";
        }
    };

    useEffect(() => {
        if (isCreateModalOpen || isAddTagModalOpen || isDeleteTagModalOpen) {
            fetchTopics();
            fetchTags();
        }
    }, [isCreateModalOpen, isAddTagModalOpen, isDeleteTagModalOpen]);

    const fetchTopics = async () => {
        setLoadingTags(true);
        setErrorTags("");
        try {
            const response = await api.get("/topic");
            setTopics(response.data);
        } catch (error) {
            setErrorTags("Lỗi tải chủ đề");
            console.error("Error fetching topics:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const fetchTags = async () => {
        setLoadingTags(true);
        setErrorTags("");
        try {
            const response = await api.get("/tag");
            setTags(response.data.data || []);
        } catch (error) {
            setErrorTags("Lỗi tải tag");
            console.error("Error fetching tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleAddTopic = async () => {
        if (!newTopic || !newTopicDesc) return;
        try {
            await api.post("/topic", {
                title: newTopic,
                description: newTopicDesc,
            });
            await fetchTopics();
            setSelectedTopic(newTopic);
            setNewTopic("");
            setNewTopicDesc("");
            setCreateStep(2);
        } catch (error) {
            console.error("Error adding topic:", error);
        }
    };

    const handleAddTag = async () => {
        if (!newTag || !newTagDesc) return;
        try {
            await api.post("/tag", {
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
            await api.post("/question", {
                title: newQuestion,
                content: questionContent,
                difficulty: questionDifficulty,
                suitableAnswer1,
                suitableAnswer2,
                tagIds: selectedTagObj ? [selectedTagObj.id] : [],
            });
            await fetchQuestions();
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
                await api.put(`/tag/${selectedQuestionId}/tags/${selectedTagObj.id}`);
                await fetchQuestions();
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
            await api.delete(`/tag/${deleteTagInfo.questionId}/tags/${deleteTagInfo.tagId}`);
            await fetchQuestions();
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
        if (currentTag) {
            filtered = filtered.filter((set) =>
                set.tags.some((tag) => tag.title === currentTag)
            );
        }
        if (currentDifficulty) {
            filtered = filtered.filter((set) => set.difficulty === currentDifficulty);
        }
        filtered.sort((a, b) => {
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
        });
        setFilteredSets(filtered);
    };

    useEffect(() => {
        applyFiltersAndSort();
    }, [currentTag, currentDifficulty, currentSort, questionSets]);

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
                title="React.js Quản lý Bộ Câu hỏi"
                description="Đây là trang Quản lý Bộ Câu hỏi React.js"
            />
            <PageBreadcrumb pageTitle="Câu hỏi" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Quản lý Bộ Câu hỏi
                        </h3>
                        <div className="flex gap-2">
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Tạo câu hỏi mới
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white"
                                value={currentTag}
                                onChange={(e) => handleTagChange(e.target.value)}
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
                                onChange={(e) => handleDifficultyChange(e.target.value)}
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
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="title">Tiêu đề (A-Z)</option>
                                <option value="title-desc">Tiêu đề (Z-A)</option>
                                <option value="difficulty">Độ khó (Dễ đến Khó)</option>
                                <option value="difficulty-desc">Độ khó (Khó đến Dễ)</option>
                            </select>
                        </div>
                    </div>

                    {loadingQuestions && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Đang tải danh sách câu hỏi...
                        </div>
                    )}
                    {errorQuestions && (
                        <div className="py-8 text-center text-red-500 dark:text-red-400">
                            {errorQuestions}
                        </div>
                    )}
                    {!loadingQuestions && !errorQuestions && (
                        <QuestionTable
                            questionSets={filteredSets}
                            onAddTag={openAddTagModal}
                            onDeleteTag={requestDeleteTag}
                        />
                    )}
                </div>
            </div>

            <Modal
                isOpen={isAddTagModalOpen}
                onClose={() => setIsAddTagModalOpen(false)}
                className="max-w-md"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Thêm Tag cho Câu hỏi
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Chọn tag</Label>
                            {loadingTags ? (
                                <div className="py-2 text-gray-500">Đang tải tag...</div>
                            ) : (
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    value={selectedAddTag || ""}
                                    onChange={(e) => setSelectedAddTag(e.target.value)}
                                >
                                    <option value="">-- Chọn tag --</option>
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
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddTagToQuestion}
                                disabled={!selectedAddTag}
                            >
                                Thêm
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
                        Xóa Tag khỏi Câu hỏi
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Bạn có chắc chắn muốn xóa tag này khỏi câu hỏi không? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteTagModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleDeleteTagFromQuestion}>
                            Xóa
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
                            Tạo Câu hỏi Mới
                        </h3>
                        <div className="space-y-4">
                            {createStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>1. Chọn chủ đề</Label>
                                        {loadingTags ? (
                                            <div className="py-2 text-gray-500">Đang tải chủ đề...</div>
                                        ) : (
                                            <>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    value={selectedTopic || ""}
                                                    onChange={(e) => {
                                                        setSelectedTopic(e.target.value);
                                                        if (e.target.value) setCreateStep(2);
                                                    }}
                                                >
                                                    <option value="">-- Chọn chủ đề có sẵn --</option>
                                                    {topics.map((topic) => (
                                                        <option key={topic.topicId} value={topic.title}>
                                                            {topic.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="mt-4">
                                                    <Label>Hoặc tạo chủ đề mới</Label>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Input
                                                                placeholder="Tên chủ đề"
                                                                value={newTopic}
                                                                onChange={(e) => setNewTopic(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <textarea
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                                placeholder="Mô tả chủ đề"
                                                                rows={3}
                                                                value={newTopicDesc}
                                                                onChange={(e) => setNewTopicDesc(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            onClick={handleAddTopic}
                                                            disabled={!newTopic || !newTopicDesc}
                                                        >
                                                            Tạo chủ đề
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
                                        <Label>2. Chọn tag (danh mục)</Label>
                                        {loadingTags ? (
                                            <div className="py-2 text-gray-500">Đang tải tag...</div>
                                        ) : (
                                            <>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    value={selectedTag || ""}
                                                    onChange={(e) => {
                                                        setSelectedTag(e.target.value);
                                                        if (e.target.value) setCreateStep(3);
                                                    }}
                                                >
                                                    <option value="">-- Chọn tag có sẵn --</option>
                                                    {tags.map((tag) => (
                                                        <option key={tag.id} value={tag.title}>
                                                            {tag.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="mt-4">
                                                    <Label>Hoặc tạo tag mới</Label>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Input
                                                                placeholder="Tên tag"
                                                                value={newTag}
                                                                onChange={(e) => setNewTag(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <textarea
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                                placeholder="Mô tả tag"
                                                                rows={3}
                                                                value={newTagDesc}
                                                                onChange={(e) => setNewTagDesc(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            onClick={handleAddTag}
                                                            disabled={!newTag || !newTagDesc}
                                                        >
                                                            Tạo tag
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
                                            Quay lại
                                        </Button>
                                        <Button
                                            onClick={() => setCreateStep(3)}
                                            disabled={!selectedTag && !newTag}
                                        >
                                            Tiếp tục
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {createStep === 3 && selectedTag && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>3. Thông tin câu hỏi</Label>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Tiêu đề câu hỏi</Label>
                                                <Input
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                    placeholder="Nhập tiêu đề câu hỏi"
                                                />
                                            </div>
                                            <div>
                                                <Label>Nội dung câu hỏi</Label>
                                                <textarea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={4}
                                                    value={questionContent}
                                                    onChange={(e) => setQuestionContent(e.target.value)}
                                                    placeholder="Nhập nội dung chi tiết câu hỏi"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label>Độ khó</Label>
                                                    <select
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                        value={questionDifficulty}
                                                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                                                    >
                                                        <option value="">-- Chọn độ khó --</option>
                                                        <option value="EASY">Dễ</option>
                                                        <option value="MEDIUM">Trung bình</option>
                                                        <option value="HARD">Khó</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Câu trả lời phù hợp 1</Label>
                                                <textarea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={2}
                                                    value={suitableAnswer1}
                                                    onChange={(e) => setSuitableAnswer1(e.target.value)}
                                                    placeholder="Nhập câu trả lời mẫu"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Câu trả lời phù hợp 2 (tuỳ chọn)</Label>
                                                <textarea
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    rows={2}
                                                    value={suitableAnswer2}
                                                    onChange={(e) => setSuitableAnswer2(e.target.value)}
                                                    placeholder="Nhập câu trả lời mẫu thứ 2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCreateStep(2)}
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            onClick={handleAddQuestion}
                                            disabled={!questionContent || !questionDifficulty || !suitableAnswer1}
                                        >
                                            Tạo câu hỏi
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}