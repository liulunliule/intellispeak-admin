import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}