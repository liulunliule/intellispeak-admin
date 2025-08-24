import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";

export interface HRApplication {
    hrId: number;
    fullName: string;
    email: string;
    company: string;
    phone: string;
    country: string;
    experienceYears: number;
    linkedinUrl: string;
    cvUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    submittedAt: string;
}

// Cập nhật interface Props
interface HRApplicationTableProps {
    applications: HRApplication[];
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onViewCv: (cvUrl: string) => void; // Thêm prop này
}

export default function HRApplicationTable({
    applications,
    onApprove,
    onReject,
    onViewCv, // Thêm vào destructuring của props
}: HRApplicationTableProps) {
    const getStatusColor = (status: HRApplication['status']) => {
        switch (status) {
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "error";
            case "PENDING":
            default:
                return "warning";
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Full Name
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Email
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Phone
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Years of Experience
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Status
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {applications.map((app) => (
                            <TableRow
                                key={app.hrId}
                                className="relative group"
                            >
                                <TableCell className="py-3">
                                    {/* Gắn sự kiện onClick vào đây */}
                                    <p
                                        className="font-medium text-blue-600 text-theme-sm dark:text-blue-400 cursor-pointer hover:underline"
                                        onClick={() => onViewCv(app.cvUrl)}
                                    >
                                        {app.fullName}
                                    </p>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {app.email}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {app.phone}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {app.experienceYears} years
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color={getStatusColor(app.status)}>
                                        {app.status === "PENDING" && "Pending"}
                                        {app.status === "APPROVED" && "Approved"}
                                        {app.status === "REJECTED" && "Rejected"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 space-x-2">
                                    {app.status === "PENDING" && (
                                        <>
                                            <Button size="sm" onClick={() => onApprove(app.hrId)}>
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => onReject(app.hrId)}>
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {app.status !== "PENDING" && (
                                        <span className="text-gray-500 text-sm">Processed</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}