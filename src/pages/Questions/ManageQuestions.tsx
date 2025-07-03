import { useState } from "react";
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
    // State for question sets
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([
        {
            id: 1,
            title: "React Fundamentals",
            topic: "React",
            difficulty: "Easy",
            sampleAnswer: "React is a JavaScript library for building user interfaces.",
            questionsCount: 10
        },
        {
            id: 2,
            title: "Advanced State Management",
            topic: "React",
            difficulty: "Hard",
            sampleAnswer: "Redux provides a centralized store for state management in complex applications.",
            questionsCount: 8
        },
        {
            id: 3,
            title: "CSS Styling Techniques",
            topic: "CSS",
            difficulty: "Medium",
            sampleAnswer: "CSS Grid and Flexbox are modern layout techniques for responsive designs.",
            questionsCount: 12
        }
    ]);

    // Filter and sort state
    const [filteredSets, setFilteredSets] = useState(questionSets);
    const [currentTopic, setCurrentTopic] = useState("");
    const [currentDifficulty, setCurrentDifficulty] = useState("");
    const [currentSort, setCurrentSort] = useState("title");

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<QuestionSet, 'id' | 'questionsCount'>>({
        title: "",
        topic: "",
        difficulty: "Medium",
        sampleAnswer: ""
    });

    // Confirmation dialogs state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Get unique topics for filter dropdown
    const topics = Array.from(new Set(questionSets.map(set => set.topic)));

    // Apply filters and sorting
    const applyFiltersAndSort = () => {
        let filtered = [...questionSets];

        // Apply topic filter
        if (currentTopic) {
            filtered = filtered.filter(set => set.topic === currentTopic);
        }

        // Apply difficulty filter
        if (currentDifficulty) {
            filtered = filtered.filter(set => set.difficulty === currentDifficulty);
        }

        // Apply sorting
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

    // Handle filter changes
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

    // Form handlers
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
            const { id: _, questionsCount: __, ...rest } = setToEdit;
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

    // Submit handlers
    const handleSubmitClick = () => {
        setShowSaveConfirm(true);
    };

    const confirmSubmit = () => {
        if (editingId) {
            // Update existing
            setQuestionSets(questionSets.map(set =>
                set.id === editingId ? { ...set, ...formData } : set
            ));
        } else {
            // Add new
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

    // Delete handlers
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
                title="React.js Manage Questions"
                description="This is React.js Manage Questions page"
            />
            <PageBreadcrumb pageTitle="Questions" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Manage Questions
                        </h3>
                        <Button onClick={openAddForm}>
                            Add New Question Set
                        </Button>
                    </div>

                    {/* Filter and Sort Controls */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentTopic}
                                onChange={(e) => handleTopicChange(e.target.value)}
                            >
                                <option value="">All Topics</option>
                                {topics.map((topic) => (
                                    <option key={topic} value={topic}>
                                        {topic}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentDifficulty}
                                onChange={(e) => handleDifficultyChange(e.target.value)}
                            >
                                <option value="">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="title">Title (A-Z)</option>
                                <option value="title-desc">Title (Z-A)</option>
                                <option value="difficulty">Difficulty (Easy to Hard)</option>
                                <option value="difficulty-desc">Difficulty (Hard to Easy)</option>
                            </select>
                        </div>
                    </div>

                    {/* Question Set Form Modal */}
                    <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-2xl">
                        <div className="no-scrollbar relative w-full overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
                            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                                {editingId ? "Edit Question Set" : "Create New Question Set"}
                            </h3>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Topic</Label>
                                        <Input
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div>
                                        <Label>Difficulty</Label>
                                        <select
                                            name="difficulty"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                            value={formData.difficulty}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Sample Answer</Label>
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
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitClick}>
                                        {editingId ? "Update" : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    {/* Question Sets List */}
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
                                                    {set.difficulty}
                                                </Badge>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {set.questionsCount} questions
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditForm(set.id)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => requestDelete(set.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No question sets found matching your criteria.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete Question Set
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this question set? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Save Confirmation Dialog */}
            <Modal isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {editingId ? "Update Question Set" : "Create New Question Set"}
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        {editingId
                            ? "Are you sure you want to update this question set?"
                            : "Are you sure you want to create this new question set?"}
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowSaveConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmSubmit}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}