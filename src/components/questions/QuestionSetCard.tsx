import { useState } from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";

interface QuestionSet {
    id: number;
    title: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
    questionsCount: number;
}

export default function QuestionSetCard({
    questionSet,
    onEdit,
    onDelete
}: {
    questionSet: QuestionSet;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
                        {questionSet.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge color="primary">{questionSet.topic}</Badge>
                        <Badge
                            color={
                                questionSet.difficulty === "Easy"
                                    ? "success"
                                    : questionSet.difficulty === "Medium"
                                        ? "warning"
                                        : "error"
                            }
                        >
                            {questionSet.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {questionSet.questionsCount} questions
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(questionSet.id)}>
                        Edit
                    </Button>
                    <Button size="sm" variant="outline" color="error" onClick={() => onDelete(questionSet.id)}>
                        Delete
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sample Answer:
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {questionSet.sampleAnswer}
                    </p>
                </div>
            )}

            <button
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? "Show Less" : "Show More"}
            </button>
        </div>
    );
}