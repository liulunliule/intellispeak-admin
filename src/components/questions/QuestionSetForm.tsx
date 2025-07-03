import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function QuestionSetForm({
    initialData,
    onCancel,
    onSubmit
}: {
    initialData?: {
        title: string;
        topic: string;
        difficulty: string;
        sampleAnswer: string;
    };
    onCancel: () => void;
    onSubmit: (data: {
        title: string;
        topic: string;
        difficulty: string;
        sampleAnswer: string;
    }) => void;
}) {
    const [formData, setFormData] = useState(
        initialData || {
            title: "",
            topic: "",
            difficulty: "Medium",
            sampleAnswer: ""
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Title</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}

                />
            </div>

            <div>
                <Label>Topic</Label>
                <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}

                />
            </div>

            <div>
                <Label>Difficulty</Label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    required
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div>
                <Label>Sample Answer</Label>
                <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    rows={3}
                    value={formData.sampleAnswer}
                    onChange={(e) => setFormData({ ...formData, sampleAnswer: e.target.value })}
                    required
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button >
                    {initialData ? "Update" : "Create"} Question Set
                </Button>
            </div>
        </form>
    );
}