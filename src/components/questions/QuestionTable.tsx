import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

interface Tag {
    tagId: number;
    title: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    isDeleted: boolean;
}

interface QuestionSet {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswer: string;
}

interface QuestionTableProps {
    questionSets: QuestionSet[];
    onAddTag: (questionId: number) => void;
    onDeleteTag: (questionId: number, tagId: number) => void;
}

export default function QuestionTable({ questionSets, onAddTag, onDeleteTag }: QuestionTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tiêu đề
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tags
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Độ khó
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Hành động
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {questionSets.length > 0 ? (
                            questionSets.map((set) => (
                                <TableRow key={set.id}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-white/90">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-semibold">{set.title}</span>
                                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{set.content}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {set.tags.map((tag) => (
                                                <div key={tag.tagId} className="relative group">
                                                    <Badge color="primary">
                                                        {tag.title}
                                                    </Badge>
                                                    <span
                                                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/50 text-gray-600 text-[10px] font-medium cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600"
                                                        onClick={() => onDeleteTag(set.id, tag.tagId)}
                                                    >
                                                        ✕
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <Badge
                                            size="sm"
                                            color={
                                                set.difficulty === "Easy"
                                                    ? "success"
                                                    : set.difficulty === "Medium"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        >
                                            {set.difficulty === "Easy"
                                                ? "Dễ"
                                                : set.difficulty === "Medium"
                                                    ? "Trung bình"
                                                    : "Khó"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAddTag(set.id)}
                                        >
                                            Thêm Tag
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Không tìm thấy bộ câu hỏi nào phù hợp với tiêu chí của bạn.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}