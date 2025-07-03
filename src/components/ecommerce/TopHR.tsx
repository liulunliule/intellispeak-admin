import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Define the TypeScript interface for the table rows
interface HRUser {
    id: number; // Unique identifier for each HR
    name: string; // HR name
    department: string; // Department of the HR
    questionsCreated: number; // Total questions created
    questionsSelected: number; // Number of times questions were selected by users
    selectionRate: string; // Percentage of questions selected
    avatar: string; // URL or path to the HR's avatar
    status: "Active" | "Inactive" | "On Leave"; // Status of the HR
}

// Define the table data using the interface
const hrData: HRUser[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        department: "Recruitment",
        questionsCreated: 42,
        questionsSelected: 38,
        selectionRate: "90.5%",
        avatar: "/images/user/user-17.jpg",
        status: "Active",
    },
    {
        id: 2,
        name: "Michael Chen",
        department: "Talent Development",
        questionsCreated: 35,
        questionsSelected: 31,
        selectionRate: "88.6%",
        avatar: "/images/user/user-22.jpg",
        status: "Active",
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        department: "Employee Relations",
        questionsCreated: 28,
        questionsSelected: 24,
        selectionRate: "85.7%",
        avatar: "/images/user/user-23.jpg",
        status: "On Leave",
    },
    {
        id: 4,
        name: "David Kim",
        department: "Compensation",
        questionsCreated: 31,
        questionsSelected: 25,
        selectionRate: "80.6%",
        avatar: "/images/user/user-24.jpg",
        status: "Active",
    },
    {
        id: 5,
        name: "Lisa Wong",
        department: "Training",
        questionsCreated: 19,
        questionsSelected: 15,
        selectionRate: "78.9%",
        avatar: "/images/user/user-18.jpg",
        status: "Inactive",
    },
];

export default function TopHRQuestions() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Top HRs by Question Selection
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        HR professionals with most selected questions by users
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        <svg
                            className="stroke-current fill-white dark:fill-gray-800"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2.29004 5.90393H17.7067"
                                stroke=""
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M17.7075 14.0961H2.29085"
                                stroke=""
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                                fill=""
                                stroke=""
                                strokeWidth="1.5"
                            />
                            <path
                                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                                fill=""
                                stroke=""
                                strokeWidth="1.5"
                            />
                        </svg>
                        Filter
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        See all
                    </button>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                HR Professional
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Department
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Questions Created
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Selected
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Selection Rate
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {hrData.map((hr) => (
                            <TableRow key={hr.id} className="">
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                                            <img
                                                src={hr.avatar}
                                                className="h-[40px] w-[40px] object-cover"
                                                alt={hr.name}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {hr.name}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {hr.department}
                                </TableCell>
                                <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                    {hr.questionsCreated}
                                </TableCell>
                                <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                    {hr.questionsSelected}
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-800 text-theme-sm dark:text-white/90">
                                            {hr.selectionRate}
                                        </span>
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full"
                                                style={{
                                                    width: `${parseFloat(hr.selectionRate)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge
                                        size="sm"
                                        color={
                                            hr.status === "Active"
                                                ? "success"
                                                : hr.status === "On Leave"
                                                    ? "warning"
                                                    : "error"
                                        }
                                    >
                                        {hr.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}