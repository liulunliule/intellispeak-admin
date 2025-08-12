import React from "react";
import { FiX } from "react-icons/fi";

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => (
    <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
        <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
            <FiX className="h-5 w-5" />
        </button>
    </div>
);

export default ModalHeader;
