import React from "react";
import { Modal } from "../../../components/ui/modal";
import ModalFooter from "./ModalFooter";
import { FiTrash2 } from "react-icons/fi";

interface RemoveTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleRemoveTagFromTopic: () => void;
}

const RemoveTagModal: React.FC<RemoveTagModalProps> = ({
    isOpen,
    onClose,
    handleRemoveTagFromTopic,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md m-4">
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
                    Remove Tag from topic
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to remove this tag from the topic? This action cannot be undone.
                </div>
            </div>
            <ModalFooter
                onCancel={onClose}
                onConfirm={handleRemoveTagFromTopic}
                confirmText="Confirm remove"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    </Modal>
);

export default RemoveTagModal;
