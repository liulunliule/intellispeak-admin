import React, { useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { squarelogo } from '../../../assets';
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { Topic, Tag } from "./types";

interface TopicDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTopic: Topic | null;
    setSelectedTopic: (t: Topic | null) => void;
    detailThumbnailFile: File | null;
    setDetailThumbnailFile: (f: File | null) => void;
    detailThumbnailPreview: string | null;
    setDetailThumbnailPreview: (s: string | null) => void;
    updatingDetailThumbnail: boolean;
    handleDetailThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDetailThumbnailUpdate: () => void;
    openAddTagModal: () => void;
    openRemoveTagModal: (tagId: number) => void;
}

const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
    isOpen,
    onClose,
    selectedTopic,
    setSelectedTopic,
    detailThumbnailFile,
    setDetailThumbnailFile,
    detailThumbnailPreview,
    setDetailThumbnailPreview,
    updatingDetailThumbnail,
    handleDetailThumbnailChange,
    handleDetailThumbnailUpdate,
    openAddTagModal,
    openRemoveTagModal,
}) => {
    const detailThumbnailInputRef = useRef<HTMLInputElement>(null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl my-4 mx-auto">
            <div className="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                <ModalHeader title="Topic details" onClose={onClose} />
                {selectedTopic && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center">
                            <img
                                src={detailThumbnailPreview ?? selectedTopic.thumbnail ?? squarelogo}
                                alt={selectedTopic.title}
                                className="h-48 w-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={detailThumbnailInputRef}
                                    onChange={handleDetailThumbnailChange}
                                    className="hidden"
                                />
                                <Button size="sm" onClick={() => detailThumbnailInputRef.current?.click()}>
                                    Change image
                                </Button>
                                {detailThumbnailPreview && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={handleDetailThumbnailUpdate}
                                            disabled={updatingDetailThumbnail}
                                        >
                                            {updatingDetailThumbnail ? "Saving..." : "Save image"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setDetailThumbnailFile(null);
                                                setDetailThumbnailPreview(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Topic ID</Label>
                                <p className="text-gray-800 dark:text-white/90">{selectedTopic.topicId}</p>
                            </div>
                            <div>
                                <Label>Topic name</Label>
                                <p className="text-gray-800 dark:text-white/90">{selectedTopic.title}</p>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <p className="text-gray-800 dark:text-white/90">{selectedTopic.description}</p>
                            </div>
                            {selectedTopic.longDescription && (
                                <div className="md:col-span-2">
                                    <Label>Long description</Label>
                                    <p className="text-gray-800 dark:text-white/90 whitespace-pre-line">
                                        {selectedTopic.longDescription}
                                    </p>
                                </div>
                            )}
                            <div>
                                <Label>Created at</Label>
                                <p className="text-gray-800 dark:text-white/90">
                                    {selectedTopic.createdAt ? new Date(selectedTopic.createdAt).toLocaleString() : "N/A"}
                                </p>
                            </div>
                            <div>
                                <Label>Updated at</Label>
                                <p className="text-gray-800 dark:text-white/90">
                                    {selectedTopic.updatedAt ? new Date(selectedTopic.updatedAt).toLocaleString() : "N/A"}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Manage Tags
                                </h5>
                                <Button size="sm" onClick={openAddTagModal}>
                                    <FiPlus className="mr-1" /> Add Tag
                                </Button>
                            </div>
                            {selectedTopic.tags && selectedTopic.tags.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedTopic.tags.map((tag) => (
                                        <div
                                            key={tag.tagId}
                                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div>
                                                <span className="font-medium text-gray-800 dark:text-white/90">{tag.title}</span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{tag.description}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">ID: {tag.tagId}</p>
                                            </div>
                                            <button
                                                onClick={() => openRemoveTagModal(tag.tagId)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    No tags assigned to this topic yet
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <ModalFooter onCancel={onClose} cancelText="Close" />
            </div>
        </Modal>
    );
};

export default TopicDetailModal;
