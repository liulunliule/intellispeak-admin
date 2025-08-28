import React from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ModalHeader from "./Topics/ModalHeader";
import ModalFooter from "./Topics/ModalFooter";

interface EditTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    updating: boolean;
    editedTitle: string;
    setEditedTitle: (v: string) => void;
    editedDesc: string;
    setEditedDesc: (v: string) => void;
    editedLongDesc: string;
    setEditedLongDesc: (v: string) => void;
    editedThumbnailFile: File | null;
    setEditedThumbnailFile: (v: File | null) => void;
    editedThumbnailPreview: string | null;
    setEditedThumbnailPreview: (v: string | null) => void;
    handleEditedThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditTopicModal: React.FC<EditTopicModalProps> = ({
    isOpen,
    onClose,
    onUpdate,
    updating,
    editedTitle,
    setEditedTitle,
    editedDesc,
    setEditedDesc,
    editedLongDesc,
    setEditedLongDesc,
    // editedThumbnailFile,
    setEditedThumbnailFile,
    editedThumbnailPreview,
    setEditedThumbnailPreview,
    handleEditedThumbnailChange,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <ModalHeader title="Edit topic" onClose={onClose} />
            <div className="space-y-4">
                <div>
                    <Label>Thumbnail image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditedThumbnailChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900/50 dark:file:text-blue-300
                        dark:hover:file:bg-blue-900/70
                        cursor-pointer"
                    />
                    {editedThumbnailPreview && (
                        <div className="mt-2 flex flex-col items-center">
                            <img
                                src={editedThumbnailPreview}
                                alt="Preview"
                                className="h-32 object-contain rounded border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={() => {
                                    setEditedThumbnailFile(null);
                                    setEditedThumbnailPreview(null);
                                }}
                                className="mt-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Remove image
                            </button>
                        </div>
                    )}
                </div>
                <div>
                    <Label>Topic name*</Label>
                    <Input
                        type="text"
                        placeholder="Enter topic name"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Description*</Label>
                    <Input
                        type="text"
                        placeholder="Enter short description"
                        value={editedDesc}
                        onChange={(e) => setEditedDesc(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Long description</Label>
                    <textarea
                        placeholder="Enter detailed description (optional)"
                        value={editedLongDesc}
                        onChange={(e) => setEditedLongDesc(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <ModalFooter
                onCancel={onClose}
                onConfirm={onUpdate}
                confirmText={updating ? "Saving..." : "Save changes"}
                cancelText="Cancel"
                confirmDisabled={updating || !editedTitle || !editedDesc}
            />
        </div>
    </Modal>
);

export default EditTopicModal;
