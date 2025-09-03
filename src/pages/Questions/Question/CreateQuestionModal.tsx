import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import MultiSelect from "../../../components/form/MultiSelect";
import Button from "../../../components/ui/button/Button";

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestionCreated: () => Promise<void>;
    questionService: any;
    topicService: any;
    templateService: any;
}

export default function CreateQuestionModal({
    isOpen,
    onClose,
    onQuestionCreated,
    questionService,
    topicService,
    templateService,
}: CreateQuestionModalProps) {
    const [createStep, setCreateStep] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [topics, setTopics] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newTopic, setNewTopic] = useState("");
    const [newTopicDesc, setNewTopicDesc] = useState("");
    const [newTag, setNewTag] = useState("");
    const [newTagDesc, setNewTagDesc] = useState("");
    const [newTemplate, setNewTemplate] = useState("");
    const [newTemplateDesc, setNewTemplateDesc] = useState("");
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

    useEffect(() => {
        if (isOpen) {
            fetchTopics();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && selectedTopicId !== null && createStep === 2) {
            fetchTags();
        }
    }, [isOpen, selectedTopicId, createStep]);

    useEffect(() => {
        if (isOpen && selectedTopicId !== null && createStep === 3) {
            fetchTemplates();
        }
    }, [isOpen, selectedTopicId, createStep]);

    const fetchTopics = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await questionService.getTopics();
            setTopics(response.data);
        } catch (error) {
            setError("Failed to load topics");
            console.error("Error fetching topics:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        setLoading(true);
        setError("");
        try {
            if (selectedTopicId !== null) {
                const response = await topicService.getTopicsWithTags();
                const topic = response.find((t: any) => t.topicId === selectedTopicId);
                const topicTags = topic?.tags || [];
                setTags(topicTags.filter((tag: any) => !tag.isDeleted));
            } else {
                setTags([]);
            }
        } catch (error) {
            setError("Failed to load tags");
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await templateService.getAdminInterviews();
            // console.log('fetchTemplates response', response);

            const filteredTemplates = response.data.data.filter((template: any) => !template.isDeleted);
            setTemplates(filteredTemplates);
        } catch (error) {
            setError("Failed to load templates");
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
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
            await fetchTopics();
        } catch (error) {
            console.error("Error adding topic:", error);
        }
    };

    const handleAddTag = async () => {
        if (!newTag || !newTagDesc || selectedTopicId === null) return;
        try {
            const response = await questionService.createTagForQuestion({
                title: newTag,
                description: newTagDesc,
            });
            const newTagId = response.data.id;
            await connectTagToTopic(selectedTopicId, newTagId);
            setSelectedTags([...selectedTags, newTag]);
            setSelectedTagIds([...selectedTagIds, newTagId]);
            setNewTag("");
            setNewTagDesc("");
            await fetchTags();
        } catch (error) {
            console.error("Error adding tag:", error);
        }
    };

    const handleAddTemplate = async () => {
        if (!newTemplate || !newTemplateDesc || selectedTopicId === null) return;
        try {
            const response = await templateService.createTemplate({
                title: newTemplate,
                description: newTemplateDesc,
                topicId: selectedTopicId,
            });
            const newTemplateId = response.data.interviewSessionId;
            setSelectedTemplate(newTemplate);
            setSelectedTemplateId(newTemplateId);
            setNewTemplate("");
            setNewTemplateDesc("");
            await fetchTemplates();
        } catch (error) {
            console.error("Error adding template:", error);
        }
    };

    const handleAddQuestion = async () => {
        if (!questionContent || !questionDifficulty || !suitableAnswer1 || selectedTopicId === null || selectedTemplateId === null) return;
        try {
            if (selectedTagIds.length === 0) {
                console.error("No tags selected");
                return;
            }

            await questionService.createQuestion({
                title: newQuestion,
                content: questionContent,
                difficulty: questionDifficulty,
                suitableAnswer1,
                suitableAnswer2,
                tagIds: selectedTagIds,
                topicId: selectedTopicId,
                interviewSessionId: selectedTemplateId,
            });

            for (const tagId of selectedTagIds) {
                await connectTagToTopic(selectedTopicId, tagId);
            }

            await onQuestionCreated();
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const resetCreateFlow = () => {
        setCreateStep(1);
        setSelectedTopic("");
        setSelectedTopicId(null);
        setSelectedTags([]);
        setSelectedTagIds([]);
        setSelectedTemplate("");
        setSelectedTemplateId(null);
        setNewTopic("");
        setNewTopicDesc("");
        setNewTag("");
        setNewTagDesc("");
        setNewTemplate("");
        setNewTemplateDesc("");
        setNewQuestion("");
        setQuestionContent("");
        setQuestionDifficulty("");
        setSuitableAnswer1("");
        setSuitableAnswer2("");
        setTags([]);
        setTemplates([]);
        setCsvFile(null);
        setCsvImportError("");
        setCsvImportSuccess("");
        setCreateTab('manual');
    };

    useEffect(() => {
        if (!isOpen) resetCreateFlow();
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                                {loading ? (
                                    <div className="py-2 text-gray-500">Loading topics...</div>
                                ) : (
                                    <>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            value={selectedTopic}
                                            onChange={(e) => {
                                                const selected = topics.find((t) => t.title === e.target.value);
                                                setSelectedTopic(e.target.value);
                                                setSelectedTopicId(selected ? selected.topicId : null);
                                            }}
                                        >
                                            <option value="">-- Select topic --</option>
                                            {topics.map((topic) => (
                                                <option key={topic.topicId} value={topic.title}>
                                                    {topic.title}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Selected Topic: {selectedTopic || "None"}
                                        </p>
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
                                {error && <p className="text-red-500">{error}</p>}
                            </div>
                            <div className="flex justify-end pt-4 gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setCreateStep(2)}
                                    disabled={!selectedTopic}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
                    {createStep === 2 && selectedTopic && (
                        <div className="space-y-4">
                            <div>
                                <Label>2. Select tags (category)</Label>
                                {loading ? (
                                    <div className="py-2 text-gray-500">Loading tags...</div>
                                ) : (
                                    <>
                                        <MultiSelect
                                            label="Select multiple tags"
                                            options={tags.map((tag) => ({
                                                value: tag.tagId.toString(),
                                                text: tag.title,
                                                selected: selectedTagIds.includes(tag.tagId),
                                            }))}
                                            defaultSelected={selectedTagIds.map(id => id.toString())}
                                            onChange={(values) => {
                                                const selectedIds = values.map(Number);
                                                const selectedTitles = tags
                                                    .filter((t) => selectedIds.includes(t.tagId))
                                                    .map((t) => t.title);
                                                setSelectedTagIds(selectedIds);
                                                setSelectedTags(selectedTitles);
                                            }}
                                        />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Selected Tags: {selectedTags.join(", ") || "None"}
                                        </p>
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
                                {error && <p className="text-red-500">{error}</p>}
                            </div>
                            <div className="flex justify-between pt-4 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setCreateStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setCreateStep(3)}
                                    disabled={selectedTags.length === 0}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
                    {createStep === 3 && selectedTags.length > 0 && (
                        <div className="space-y-4">
                            <div>
                                <Label>3. Select interview template</Label>
                                {loading ? (
                                    <div className="py-2 text-gray-500">Loading templates...</div>
                                ) : templates.length === 0 ? (
                                    <div className="py-2 text-gray-500">No templates available</div>
                                ) : (
                                    <>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            value={selectedTemplate}
                                            onChange={(e) => {
                                                const selected = templates.find((t) => t.title === e.target.value);
                                                setSelectedTemplate(e.target.value);
                                                setSelectedTemplateId(selected ? selected.interviewSessionId : null);
                                            }}
                                        >
                                            <option value="">-- Select template --</option>
                                            {templates.map((template) => (
                                                <option key={template.interviewSessionId} value={template.title}>
                                                    {template.title}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Selected Template: {selectedTemplate || "None"}
                                        </p>
                                        <div className="mt-4">
                                            <Label>Or create new template</Label>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Input
                                                        placeholder="Template name"
                                                        value={newTemplate}
                                                        onChange={(e) => setNewTemplate(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <TextArea
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                        placeholder="Template description"
                                                        rows={3}
                                                        value={newTemplateDesc}
                                                        onChange={setNewTemplateDesc}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    onClick={handleAddTemplate}
                                                    disabled={!newTemplate || !newTemplateDesc}
                                                >
                                                    Create template
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {error && <p className="text-red-500">{error}</p>}
                            </div>
                            <div className="flex justify-between pt-4 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setCreateStep(2)}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setCreateStep(4)}
                                    disabled={!selectedTemplate}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
                    {createStep === 4 && selectedTemplate && (
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
                                    <div className="flex justify-between pt-4 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCreateStep(3)}
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
                                    <div className="flex justify-between pt-4 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCreateStep(3)}
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
                                                if (selectedTagIds.length === 0) {
                                                    setCsvImportError("Please select at least one tag before importing.");
                                                    return;
                                                }
                                                if (selectedTemplateId === null) {
                                                    setCsvImportError("Please select a template before importing.");
                                                    return;
                                                }
                                                setCsvImporting(true);
                                                // console.log("data to use importQuestionsFromCsv:", selectedTagIds);

                                                try {

                                                    await questionService.importQuestionsFromCsv({
                                                        tagIds: selectedTagIds,
                                                        // topicId: selectedTopicId,
                                                        interviewSessionId: selectedTemplateId,
                                                        file: csvFile,
                                                    });
                                                    setCsvImportSuccess("CSV imported successfully.");
                                                    await onQuestionCreated();
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
    );
}