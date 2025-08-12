import React from "react";
import Button from "../../../components/ui/button/Button";

interface ModalFooterProps {
    onCancel: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
    variant?: "danger" | "outline" | undefined;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
    onCancel,
    onConfirm,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmDisabled = false,
    variant = undefined,
}) => (
    <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
            {cancelText}
        </Button>
        {onConfirm && (
            <Button variant={variant} onClick={onConfirm} disabled={confirmDisabled}>
                {confirmText}
            </Button>
        )}
    </div>
);

export default ModalFooter;
