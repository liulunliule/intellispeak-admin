import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";

interface QuestionSet {
    id: number;
    title: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
    questionsCount: number;
}

export default function ManageQuestions() {
    // State cho các bộ câu hỏi
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([
        {
            id: 1,
            title: "Kiến thức cơ bản về React",
            topic: "React",
            difficulty: "Easy",
            sampleAnswer: "React là một thư viện JavaScript để xây dựng giao diện người dùng.",
            questionsCount: 10
        },
        {
            id: 2,
            title: "Quản lý trạng thái nâng cao",
            topic: "React",
            difficulty: "Hard",
            sampleAnswer: "Redux cung cấp một kho lưu trữ tập trung để quản lý trạng thái trong các ứng dụng phức tạp.",
            questionsCount: 8
        },
        {
            id: 3,
            title: "Kỹ thuật tạo kiểu CSS",
            topic: "CSS",
            difficulty: "Medium",
            sampleAnswer: "CSS Grid và Flexbox là các kỹ thuật bố cục hiện đại cho thiết kế đáp ứng.",
            questionsCount: 12
        }
    ]);

    // Trạng thái lọc và sắp xếp
    const [filteredSets, setFilteredSets] = useState(questionSets);
    const [currentTopic, setCurrentTopic] = useState("");
    const [currentDifficulty, setCurrentDifficulty] = useState("");
    const [currentSort, setCurrentSort] = useState("title");

    // Trạng thái biểu mẫu
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<QuestionSet, 'id' | 'questionsCount'>>({
        title: "",
        topic: "",
        difficulty: "Medium",
        sampleAnswer: ""
    });

    // Trạng thái hộp thoại xác nhận
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Multi-step creation state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    // Add API-based state
    const [topics, setTopics] = useState([]);
    const [tags, setTags] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [errorTopics, setErrorTopics] = useState("");
    const [errorTags, setErrorTags] = useState("");
    const [errorQuestions, setErrorQuestions] = useState("");
    const [newTopicDesc, setNewTopicDesc] = useState("");
    const [newTagDesc, setNewTagDesc] = useState("");
    const [questionContent, setQuestionContent] = useState("");
    const [questionDifficulty, setQuestionDifficulty] = useState("");
    const [suitableAnswer1, setSuitableAnswer1] = useState("");
    const [suitableAnswer2, setSuitableAnswer2] = useState("");

    // Fetch topics when modal opens
    useEffect(() => {
        if (isCreateModalOpen) {
            setLoadingTopics(true);
            fetch('https://endlessly-enabling-husky.ngrok-free.app/topic')
                .then(res => res.json())
                .then(data => {
                    setTopics(data);
                    setLoadingTopics(false);
                })
                .catch(() => {
                    setErrorTopics('Lỗi tải chủ đề');
                    setLoadingTopics(false);
                });
        }
    }, [isCreateModalOpen]);

    // Fetch tags when topic is selected
    useEffect(() => {
        if (selectedTopic) {
            setLoadingTags(true);
            fetch('https://endlessly-enabling-husky.ngrok-free.app/tag')
                .then(res => res.json())
                .then(data => {
                    setTags(data.data || []);
                    setLoadingTags(false);
                })
                .catch(() => {
                    setErrorTags('Lỗi tải tag');
                    setLoadingTags(false);
                });
        }
    }, [selectedTopic]);

    // Fetch questions when tag is selected
    useEffect(() => {
        if (selectedTag) {
            setLoadingQuestions(true);
            fetch('https://endlessly-enabling-husky.ngrok-free.app/question')
                .then(res => res.json())
                .then(data => {
                    setQuestions(data);
                    setLoadingQuestions(false);
                })
                .catch(() => {
                    setErrorQuestions('Lỗi tải câu hỏi');
                    setLoadingQuestions(false);
                });
        }
    }, [selectedTag]);

    const resetCreateFlow = () => {
        setCreateStep(1);
        setSelectedTopic(null);
        setSelectedTag(null);
        setSelectedQuestion(null);
        setNewTopicDesc("");
        setNewTagDesc("");
        setQuestionContent("");
        setQuestionDifficulty("");
        setSuitableAnswer1("");
        setSuitableAnswer2("");
    };

    useEffect(() => {
        if (!isCreateModalOpen) resetCreateFlow();
    }, [isCreateModalOpen]);

    const handleAddTopic = () => {
        fetch('https://endlessly-enabling-husky.ngrok-free.app/topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTopic, description: newTopicDesc })
        })
            .then(res => res.json())
            .then(() => {
                // Refresh topics
                return fetch('https://endlessly-enabling-husky.ngrok-free.app/topic');
            })
            .then(res => res.json())
            .then(data => {
                setTopics(data);
                setNewTopic('');
                setNewTopicDesc('');
                setCreateStep(2);
            });
    };
    const handleAddTag = () => {
        fetch('https://endlessly-enabling-husky.ngrok-free.app/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 0,
                title: newTag,
                description: newTagDesc,
                createAt: new Date().toISOString(),
                updateAt: new Date().toISOString(),
                isDeleted: false
            })
        })
            .then(res => res.json())
            .then(() => {
                // Refresh tags
                return fetch('https://endlessly-enabling-husky.ngrok-free.app/tag');
            })
            .then(res => res.json())
            .then(data => {
                setTags(data.data || []);
                setNewTag('');
                setNewTagDesc('');
                setCreateStep(3);
            });
    };
    const handleAddQuestion = () => {
        // Find selected tag object
        const tagObj = tags.find(t => t.title === selectedTag);
        fetch('https://endlessly-enabling-husky.ngrok-free.app/question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 0,
                title: newQuestion,
                content: questionContent,
                difficulty: questionDifficulty,
                suitableAnswer1,
                suitableAnswer2,
                tags: tagObj ? [tagObj] : [],
                is_deleted: false
            })
        })
            .then(res => res.json())
            .then(() => {
                setNewQuestion('');
                setQuestionContent('');
                setQuestionDifficulty('');
                setSuitableAnswer1('');
                setSuitableAnswer2('');
                setIsCreateModalOpen(false);
            });
    };

    // Lấy các chủ đề duy nhất cho dropdown bộ lọc
    const filterTopics = Array.from(new Set(questionSets.map(set => set.topic)));

    // Áp dụng bộ lọc và sắp xếp
    const applyFiltersAndSort = () => {
        let filtered = [...questionSets];

        // Áp dụng bộ lọc chủ đề
        if (currentTopic) {
            filtered = filtered.filter(set => set.topic === currentTopic);
        }

        // Áp dụng bộ lọc độ khó
        if (currentDifficulty) {
            filtered = filtered.filter(set => set.difficulty === currentDifficulty);
        }

        // Áp dụng sắp xếp
        filtered.sort((a, b) => {
            switch (currentSort) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                case "difficulty":
                    const order = { "Easy": 1, "Medium": 2, "Hard": 3 };
                    return order[a.difficulty] - order[b.difficulty];
                case "difficulty-desc":
                    const descOrder = { "Easy": 3, "Medium": 2, "Hard": 1 };
                    return descOrder[a.difficulty] - descOrder[b.difficulty];
                default:
                    return 0;
            }
        });

        setFilteredSets(filtered);
    };

    // Xử lý thay đổi bộ lọc
    const handleTopicChange = (topic: string) => {
        setCurrentTopic(topic);
        applyFiltersAndSort();
    };

    const handleDifficultyChange = (difficulty: string) => {
        setCurrentDifficulty(difficulty);
        applyFiltersAndSort();
    };

    const handleSortChange = (sortBy: string) => {
        setCurrentSort(sortBy);
        applyFiltersAndSort();
    };

    // Xử lý biểu mẫu
    const openAddForm = () => {
        setFormData({
            title: "",
            topic: "",
            difficulty: "Medium",
            sampleAnswer: ""
        });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (id: number) => {
        const setToEdit = questionSets.find(set => set.id === id);
        if (setToEdit) {
            const { id, ...rest } = setToEdit;
            setFormData(rest);
            setEditingId(id);
            setIsFormOpen(true);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý gửi biểu mẫu
    const handleSubmitClick = () => {
        setShowSaveConfirm(true);
    };

    const confirmSubmit = () => {
        if (editingId) {
            // Cập nhật bộ câu hỏi hiện có
            setQuestionSets(questionSets.map(set =>
                set.id === editingId ? { ...set, ...formData } : set
            ));
        } else {
            // Thêm bộ câu hỏi mới
            const newSet = {
                ...formData,
                id: Math.max(0, ...questionSets.map(set => set.id)) + 1,
                questionsCount: 0
            };
            setQuestionSets([...questionSets, newSet]);
        }
        setShowSaveConfirm(false);
        setIsFormOpen(false);
        applyFiltersAndSort();
    };

    // Xử lý xóa
    const requestDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            setQuestionSets(questionSets.filter(set => set.id !== deleteId));
            setShowDeleteConfirm(false);
            applyFiltersAndSort();
        }
    };

    return (
        <>
            <PageMeta
                title="React.js Quản lý Câu hỏi"
                description="Đây là trang Quản lý Câu hỏi React.js"
            />
            <PageBreadcrumb pageTitle="Câu hỏi" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Quản lý Câu hỏi
                        </h3>
                        <Button onClick={openAddForm}>
                            Thêm bộ câu hỏi mới
                        </Button>
                    </div>

                    {/* Điều khiển lọc và sắp xếp */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white"
                                value={currentTopic}
                                onChange={(e) => handleTopicChange(e.target.value)}
                            >
                                <option value="">Tất cả chủ đề</option>
                                {filterTopics.map((topic) => (
                                    <option key={topic} value={topic}>
                                        {topic}
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
                            <span className="text-sm text-gray-500 dark:text-gray-400">Sắp xếp theo:</span>
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

                    {/* Modal Form Bộ câu hỏi */}
                    <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-2xl">
                        <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                                {editingId ? "Chỉnh sửa Bộ câu hỏi" : "Tạo Bộ câu hỏi Mới"}
                            </h3>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Tiêu đề</Label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Chủ đề</Label>
                                        <Input
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Độ khó</Label>
                                        <select
                                            name="difficulty"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                            value={formData.difficulty}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="Easy">Dễ</option>
                                            <option value="Medium">Trung bình</option>
                                            <option value="Hard">Khó</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Câu trả lời mẫu</Label>
                                    <textarea
                                        name="sampleAnswer"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                        rows={4}
                                        value={formData.sampleAnswer}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={handleSubmitClick}>
                                        {editingId ? "Cập nhật" : "Tạo"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    {/* Danh sách Bộ câu hỏi */}
                    <div className="space-y-4">
                        {filteredSets.length > 0 ? (
                            filteredSets.map((set) => (
                                <div key={set.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
                                                {set.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color="primary">{set.topic}</Badge>
                                                <Badge
                                                    color={
                                                        set.difficulty === "Easy"
                                                            ? "success"
                                                            : set.difficulty === "Medium"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                >
                                                    {set.difficulty === "Easy" ? "Dễ" : set.difficulty === "Medium" ? "Trung bình" : "Khó"}
                                                </Badge>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {set.questionsCount} câu hỏi
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditForm(set.id)}>
                                                Chỉnh sửa
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => requestDelete(set.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Không tìm thấy bộ câu hỏi nào phù hợp với tiêu chí của bạn.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hộp thoại Xác nhận Xóa */}
            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Xóa Bộ câu hỏi
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Bạn có chắc chắn muốn xóa bộ câu hỏi này không? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Hủy
                        </Button>
                        <Button onClick={confirmDelete}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Hộp thoại Xác nhận Lưu */}
            <Modal isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {editingId ? "Cập nhật Bộ câu hỏi" : "Tạo Bộ câu hỏi Mới"}
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        {editingId
                            ? "Bạn có chắc chắn muốn cập nhật bộ câu hỏi này không?"
                            : "Bạn có chắc chắn muốn tạo bộ câu hỏi mới này không?"}
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowSaveConfirm(false)}>
                            Hủy
                        </Button>
                        <Button onClick={confirmSubmit}>
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </Modal>

            <Button onClick={() => setIsCreateModalOpen(true)} className="mb-4">Tạo câu hỏi mới</Button>
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                    <div className="p-4 w-[350px]">
                        <h2 className="text-lg font-semibold mb-4">Tạo câu hỏi mới</h2>
                        {createStep === 1 && (
                            <>
                                <div className="mb-2">1. Chọn hoặc tạo chủ đề</div>
                                <select
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    value={selectedTopic || ""}
                                    onChange={e => {
                                        setSelectedTopic(e.target.value);
                                        setCreateStep(2);
                                    }}
                                >
                                    <option value="">-- Chọn chủ đề --</option>
                                    {topics.map(topic => (
                                        <option key={topic.id} value={topic.title}>{topic.title}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    placeholder="Hoặc nhập chủ đề mới"
                                    value={newTopicDesc}
                                    onChange={e => setNewTopicDesc(e.target.value)}
                                />
                                <Button onClick={handleAddTopic} disabled={!newTopicDesc}>Tạo chủ đề</Button>
                                {loadingTopics && <p>Đang tải chủ đề...</p>}
                                {errorTopics && <p style={{ color: 'red' }}>{errorTopics}</p>}
                            </>
                        )}
                        {createStep === 2 && selectedTopic && (
                            <>
                                <div className="mb-2">2. Chọn hoặc tạo tag (danh mục)</div>
                                <select
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    value={selectedTag || ""}
                                    onChange={e => {
                                        setSelectedTag(e.target.value);
                                        setCreateStep(3);
                                    }}
                                >
                                    <option value="">-- Chọn tag --</option>
                                    {tags.map(tag => (
                                        <option key={tag.id} value={tag.title}>{tag.title}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    placeholder="Hoặc nhập tag mới"
                                    value={newTagDesc}
                                    onChange={e => setNewTagDesc(e.target.value)}
                                />
                                <Button onClick={handleAddTag} disabled={!newTagDesc}>Tạo tag</Button>
                                <Button onClick={() => setCreateStep(1)} variant="outline" className="ml-2">Quay lại</Button>
                                {loadingTags && <p>Đang tải tag...</p>}
                                {errorTags && <p style={{ color: 'red' }}>{errorTags}</p>}
                            </>
                        )}
                        {createStep === 3 && selectedTag && (
                            <>
                                <div className="mb-2">3. Chọn hoặc tạo câu hỏi</div>
                                <select
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    value={selectedQuestion || ""}
                                    onChange={e => setSelectedQuestion(e.target.value)}
                                >
                                    <option value="">-- Chọn câu hỏi --</option>
                                    {questions.map(q => (
                                        <option key={q.id} value={q.title}>{q.title}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    placeholder="Hoặc nhập câu hỏi mới"
                                    value={questionContent}
                                    onChange={e => setQuestionContent(e.target.value)}
                                />
                                <select
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    value={questionDifficulty}
                                    onChange={e => setQuestionDifficulty(e.target.value)}
                                >
                                    <option value="">-- Chọn độ khó --</option>
                                    <option value="Easy">Dễ</option>
                                    <option value="Medium">Trung bình</option>
                                    <option value="Hard">Khó</option>
                                </select>
                                <input
                                    type="text"
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    placeholder="Câu trả lời phù hợp 1"
                                    value={suitableAnswer1}
                                    onChange={e => setSuitableAnswer1(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="border px-2 py-1 rounded w-full mb-2"
                                    placeholder="Câu trả lời phù hợp 2"
                                    value={suitableAnswer2}
                                    onChange={e => setSuitableAnswer2(e.target.value)}
                                />
                                <Button onClick={handleAddQuestion} disabled={!questionContent || !questionDifficulty || !suitableAnswer1}>Tạo câu hỏi</Button>
                                <Button onClick={() => setCreateStep(2)} variant="outline" className="ml-2">Quay lại</Button>
                                {loadingQuestions && <p>Đang tải câu hỏi...</p>}
                                {errorQuestions && <p style={{ color: 'red' }}>{errorQuestions}</p>}
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}