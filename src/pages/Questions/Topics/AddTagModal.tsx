import React from "react";
import { Modal } from "../../../components/ui/modal";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";
import Label from "../../../components/form/Label";
import type { Tag, Topic } from "./types";

interface AddTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTags: Tag[];
    loadingTags: boolean;
    selectedTagToAdd: number | null;
    setSelectedTagToAdd: (id: number | null) => void;
    selectedTopic: Topic | null;
    handleAddTagToTopic: () => void;
}

const AddTagModal: React.FC<AddTagModalProps> = ({
    isOpen,
    onClose,
    allTags,
    loadingTags,
    selectedTagToAdd,
    setSelectedTagToAdd,
    selectedTopic,
    handleAddTagToTopic,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md  my-4 mx-auto">
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
            <ModalHeader title="Add Tag to topic" onClose={onClose} />
            <div className="space-y-4">
                <div>
                    <Label>Select Tag</Label>
                    {loadingTags ? (
                        <div className="py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                    ) : allTags.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No tags available
                        </div>
                    ) : (
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTagToAdd ?? ""}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedTagToAdd(id || null);
                            }}
                        >
                            <option value="">-- Select tag --</option>
                            {allTags
                                .filter(tag => !selectedTopic?.tags?.some(t => t.tagId === tag.tagId))
                                .map(tag => (
                                    <option key={tag.tagId} value={tag.tagId}>
                                        {tag.title} - {tag.description}
                                    </option>
                                ))}
                        </select>
                    )}
                </div>
                <ModalFooter
                    onCancel={onClose}
                    onConfirm={handleAddTagToTopic}
                    confirmText="Add Tag"
                    cancelText="Cancel"
                    confirmDisabled={selectedTagToAdd === null || loadingTags}
                />
            </div>
        </div>
    </Modal>
);

export default AddTagModal;
