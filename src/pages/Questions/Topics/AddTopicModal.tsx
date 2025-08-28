import React from "react";
import { Modal } from "../../../components/ui/modal";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    adding: boolean;
    newTitle: string;
    setNewTitle: (v: string) => void;
    newDesc: string;
    setNewDesc: (v: string) => void;
    newLongDesc: string;
    setNewLongDesc: (v: string) => void;
    newThumbnailFile: File | null;
    setNewThumbnailFile: (f: File | null) => void;
    newThumbnailPreview: string | null;
    setNewThumbnailPreview: (s: string | null) => void;
    handleNewThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    adding,
    newTitle,
    setNewTitle,
    newDesc,
    setNewDesc,
    newLongDesc,
    setNewLongDesc,
    newThumbnailFile,
    setNewThumbnailFile,
    newThumbnailPreview,
    setNewThumbnailPreview,
    handleNewThumbnailChange,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <ModalHeader title="Add new topic" onClose={onClose} />
            <div className="space-y-4">
                <div>
                    <Label>Thumbnail image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewThumbnailChange}
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
                    {newThumbnailPreview && (
                        <div className="mt-2 flex flex-col items-center">
                            <img
                                src={newThumbnailPreview}
                                alt="Preview"
                                className="h-32 object-contain rounded border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={() => {
                                    setNewThumbnailFile(null);
                                    setNewThumbnailPreview(null);
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
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Description*</Label>
                    <Input
                        type="text"
                        placeholder="Enter short description"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Long description</Label>
                    <textarea
                        placeholder="Enter detailed description (optional)"
                        value={newLongDesc}
                        onChange={(e) => setNewLongDesc(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <ModalFooter
                onCancel={onClose}
                onConfirm={onAdd}
                confirmText={adding ? "Adding..." : "Add topic"}
                cancelText="Cancel"
                confirmDisabled={adding || !newTitle || !newDesc}
            />
        </div>
    </Modal>
);

export default AddTopicModal;
