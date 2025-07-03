
export default function FilterControls({
    topics,
    onTopicChange,
    onDifficultyChange,
    onSortChange
}: {
    topics: string[];
    onTopicChange: (topic: string) => void;
    onDifficultyChange: (difficulty: string) => void;
    onSortChange: (sortBy: string) => void;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    onChange={(e) => onTopicChange(e.target.value)}
                >
                    <option value="">All Topics</option>
                    {topics.map((topic) => (
                        <option key={topic} value={topic}>
                            {topic}
                        </option>
                    ))}
                </select>

                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    onChange={(e) => onDifficultyChange(e.target.value)}
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="title">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                    <option value="difficulty">Difficulty (Easy to Hard)</option>
                    <option value="difficulty-desc">Difficulty (Hard to Easy)</option>
                </select>
            </div>
        </div>
    );
}