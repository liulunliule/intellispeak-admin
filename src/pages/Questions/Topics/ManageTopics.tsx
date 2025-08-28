import React, { useEffect, useState } from "react";
import PageMeta from '../../../components/common/PageMeta';
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { FiPlus } from "react-icons/fi";
import type { Topic, Tag } from "./types";
import AddTopicModal from "./AddTopicModal";
import TopicDetailModal from "./TopicDetailModal";
import AddTagModal from "./AddTagModal";
import RemoveTagModal from "./RemoveTagModal";
import DeleteTopicModal from "./DeleteTopicModal";
import TopicTable from "./TopicTable";
import * as topicService from "../../../services/topic";
import EditTopicModal from "./EditTopicModal";

const ManageTopics: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // State for Add functionality
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newLongDesc, setNewLongDesc] = useState("");
    const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State for Edit functionality
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDesc, setEditedDesc] = useState("");
    const [editedLongDesc, setEditedLongDesc] = useState("");
    const [editedThumbnailFile, setEditedThumbnailFile] = useState<File | null>(null);
    const [editedThumbnailPreview, setEditedThumbnailPreview] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State for Delete functionality
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State for Detail functionality
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailThumbnailFile, setDetailThumbnailFile] = useState<File | null>(null);
    const [detailThumbnailPreview, setDetailThumbnailPreview] = useState<string | null>(null);
    const [updatingDetailThumbnail, setUpdatingDetailThumbnail] = useState(false);

    // State for Tag management
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [selectedTagToAdd, setSelectedTagToAdd] = useState<number | null>(null);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [isRemoveTagModalOpen, setIsRemoveTagModalOpen] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<number | null>(null);

    useEffect(() => {
        fetchTopics();
        fetchAllTags();
    }, []);

    useEffect(() => {
        console.log("selectedTopic:", selectedTopic);
    }, [selectedTopic]);

    const fetchTopics = async () => {
        setLoading(true);
        setError("");
        try {
            const topics = await topicService.getTopicsWithTags();
            const normalizedTopics = topics.map((topic: Topic) => ({
                ...topic,
                tags: topic.tags || [], // Normalize tags to empty array if undefined
            }));
            setTopics(normalizedTopics);
        } catch (err: any) {
            setError(err.message || "Error loading topics.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTags = async () => {
        setLoadingTags(true);
        try {
            const tags = await topicService.getAllTags();
            setAllTags(tags);
        } catch (error: any) {
            setError(error.message || "Error loading tag list");
        } finally {
            setLoadingTags(false);
        }
    };

    const handleImageUpload = async (file: File | null): Promise<string | null> => {
        if (!file) return null;
        try {
            return await topicService.uploadImage(file);
        } catch (error: any) {
            setError(error.message || "Error uploading image");
            return null;
        }
    };

    const handleDetailThumbnailUpdate = async () => {
        if (!selectedTopic || !detailThumbnailFile) return;
        setUpdatingDetailThumbnail(true);
        try {
            const thumbnailUrl = await handleImageUpload(detailThumbnailFile);
            if (thumbnailUrl) {
                await topicService.updateTopicThumbnail(selectedTopic.topicId, thumbnailUrl);
                setDetailThumbnailFile(null);
                setDetailThumbnailPreview(null);
                setSelectedTopic(prev => ({
                    ...prev!,
                    thumbnail: thumbnailUrl,
                    tags: prev?.tags || [], // Ensure tags is an array
                }));
                fetchTopics();
            }
        } catch (error: any) {
            setError(error.message || "Error updating thumbnail.");
        } finally {
            setUpdatingDetailThumbnail(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newDesc) return;
        setAdding(true);
        try {
            const newTopicId = await topicService.createTopic({
                title: newTitle,
                description: newDesc,
                longDescription: newLongDesc,
            });
            if (newThumbnailFile && newTopicId) {
                const thumbnailUrl = await handleImageUpload(newThumbnailFile);
                if (thumbnailUrl) {
                    await topicService.updateTopicThumbnail(newTopicId, thumbnailUrl);
                }
            }
            setNewTitle("");
            setNewDesc("");
            setNewLongDesc("");
            setNewThumbnailFile(null);
            setNewThumbnailPreview(null);
            fetchTopics();
            setIsAddModalOpen(false);
        } catch (err: any) {
            setError(err.message || "Error adding topic.");
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingId(topic.topicId);
        setEditedTitle(topic.title);
        setEditedDesc(topic.description);
        setEditedLongDesc(topic.longDescription ?? "");
        setEditedThumbnailFile(null);
        setEditedThumbnailPreview(topic.thumbnail || null);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingId || !editedTitle || !editedDesc) return;
        setUpdating(true);
        try {
            // Log data before updating topic
            console.log("Topic data before update:", {
                editingId,
                editedTitle,
                editedDesc,
                editedLongDesc,
                thumbnailFileName: editedThumbnailFile ? editedThumbnailFile.name : "none",
            });

            // Include thumbnail in the update request, use existing preview or empty string
            await topicService.updateTopic(editingId, {
                title: editedTitle,
                description: editedDesc,
                longDescription: editedLongDesc,
                thumbnail: editedThumbnailPreview ?? "", // Send existing thumbnail URL or empty string
            });
            if (editedThumbnailFile) {
                const thumbnailUrl = await handleImageUpload(editedThumbnailFile);
                if (thumbnailUrl) {
                    await topicService.updateTopicThumbnail(editingId, thumbnailUrl);
                }
            }
            setEditingId(null);
            setEditedTitle("");
            setEditedDesc("");
            setEditedLongDesc("");
            setEditedThumbnailFile(null);
            setEditedThumbnailPreview(null);
            setIsEditModalOpen(false);
            fetchTopics();
        } catch (err: any) {
            setError(err.message || "Error updating topic.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedTitle("");
        setEditedDesc("");
        setEditedLongDesc("");
        setEditedThumbnailFile(null);
        setEditedThumbnailPreview(null);
        setIsEditModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await topicService.deleteTopic(id);
            fetchTopics();
        } catch (err: any) {
            setError(err.message || "Error deleting topic.");
        } finally {
            setDeletingId(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleDeleteClick = (topicId: number) => {
        setDeletingId(topicId);
        setIsDeleteModalOpen(true);
    };

    const handleDetailClick = async (topic: Topic) => {
        try {
            const tags = await topicService.getTopicTags(topic.topicId);
            setSelectedTopic({
                ...topic,
                tags: tags || [], // Ensure tags is an array
            });
            setDetailThumbnailFile(null);
            setDetailThumbnailPreview(null);
            setIsDetailModalOpen(true);
        } catch (error: any) {
            setSelectedTopic({ ...topic, tags: [] });
            setIsDetailModalOpen(true);
        }
    };

    const handleAddTagToTopic = async () => {
        if (!selectedTopic || selectedTagToAdd === null) {
            setError("Please select a valid topic and tag.");
            return;
        }
        try {
            await topicService.addTagToTopic(selectedTopic.topicId, selectedTagToAdd);
            const addedTag = allTags.find(tag => tag.tagId === selectedTagToAdd);
            if (!addedTag) {
                setError("Tag does not exist in the list.");
                return;
            }
            setSelectedTopic(prev => ({
                ...prev!,
                tags: [...(prev?.tags || []), addedTag], // Ensure tags is an array
            }));
            await fetchTopics();
            setIsAddTagModalOpen(false);
            setSelectedTagToAdd(null);
        } catch (error: any) {
            setError(error.message || "Error adding tag to topic");
        }
    };

    const handleRemoveTagFromTopic = async () => {
        if (!selectedTopic || !tagToRemove) {
            setError("Missing topic or tag information");
            return;
        }
        try {
            setSelectedTopic(prev => {
                const newTags = (prev?.tags || []).filter(tag => tag.tagId !== tagToRemove); // Ensure tags is an array
                return {
                    ...prev!,
                    tags: newTags,
                };
            });
            await topicService.removeTagFromTopic(selectedTopic.topicId, tagToRemove);
            await fetchTopics();
            setIsRemoveTagModalOpen(false);
            setTagToRemove(null);
        } catch (error: any) {
            setError(error.message || "Error removing tag from topic");
        }
    };

    const openAddTagModal = () => {
        setSelectedTagToAdd(null);
        setIsAddTagModalOpen(true);
    };

    const openRemoveTagModal = (tagId: number) => {
        console.log("Opening remove tag modal for tag ID:", tagId);
        setTagToRemove(tagId);
        setIsRemoveTagModalOpen(true);
    };

    const handleNewThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewThumbnailFile(file);
            setNewThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleDetailThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDetailThumbnailFile(file);
            setDetailThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleEditedThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditedThumbnailFile(file);
            setEditedThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.tags || []).some(tag => // Use fallback to empty array
            tag.title.toLowerCase().includes(search.toLowerCase()) ||
            tag.description.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <>
            <PageMeta title="Manage Topics" description="Topic management page" />
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-md w-full max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manage Topics</h1>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 max-w-md">
                        <Input
                            type="text"
                            placeholder="Search topics by name, description, or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <FiPlus className="mr-1" /> Add new topic
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <TopicTable
                    loading={loading}
                    filteredTopics={filteredTopics}
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

                {/* Add Topic Modal */}
                <AddTopicModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAdd}
                    adding={adding}
                    newTitle={newTitle}
                    setNewTitle={setNewTitle}
                    newDesc={newDesc}
                    setNewDesc={setNewDesc}
                    newLongDesc={newLongDesc}
                    setNewLongDesc={setNewLongDesc}
                    newThumbnailFile={newThumbnailFile}
                    setNewThumbnailFile={setNewThumbnailFile}
                    newThumbnailPreview={newThumbnailPreview}
                    setNewThumbnailPreview={setNewThumbnailPreview}
                    handleNewThumbnailChange={handleNewThumbnailChange}
                />

                {/* Edit Topic Modal */}
                <EditTopicModal
                    isOpen={isEditModalOpen}
                    onClose={handleCancelEdit}
                    onUpdate={handleUpdate}
                    updating={updating}
                    editedTitle={editedTitle}
                    setEditedTitle={setEditedTitle}
                    editedDesc={editedDesc}
                    setEditedDesc={setEditedDesc}
                    editedLongDesc={editedLongDesc}
                    setEditedLongDesc={setEditedLongDesc}
                    editedThumbnailFile={editedThumbnailFile}
                    setEditedThumbnailFile={setEditedThumbnailFile}
                    editedThumbnailPreview={editedThumbnailPreview}
                    setEditedThumbnailPreview={setEditedThumbnailPreview}
                    handleEditedThumbnailChange={handleEditedThumbnailChange}
                />

                {/* Topic Detail Modal with Tag Management */}
                <TopicDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                    detailThumbnailFile={detailThumbnailFile}
                    setDetailThumbnailFile={setDetailThumbnailFile}
                    detailThumbnailPreview={detailThumbnailPreview}
                    setDetailThumbnailPreview={setDetailThumbnailPreview}
                    updatingDetailThumbnail={updatingDetailThumbnail}
                    handleDetailThumbnailChange={handleDetailThumbnailChange}
                    handleDetailThumbnailUpdate={handleDetailThumbnailUpdate}
                    openAddTagModal={openAddTagModal}
                    openRemoveTagModal={openRemoveTagModal}
                />

                {/* Add Tag Modal */}
                <AddTagModal
                    isOpen={isAddTagModalOpen}
                    onClose={() => setIsAddTagModalOpen(false)}
                    allTags={allTags}
                    loadingTags={loadingTags}
                    selectedTagToAdd={selectedTagToAdd}
                    setSelectedTagToAdd={setSelectedTagToAdd}
                    selectedTopic={selectedTopic}
                    handleAddTagToTopic={handleAddTagToTopic}
                />

                {/* Remove Tag Confirmation Modal */}
                <RemoveTagModal
                    isOpen={isRemoveTagModalOpen}
                    onClose={() => setIsRemoveTagModalOpen(false)}
                    handleRemoveTagFromTopic={handleRemoveTagFromTopic}
                />

                {/* Delete Confirmation Modal */}
                <DeleteTopicModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    deletingId={deletingId}
                    handleDelete={handleDelete}
                />
            </div>
        </>
    );
};

export default ManageTopics;
