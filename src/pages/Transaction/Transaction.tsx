import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { getTransactions, Transaction } from "../../services/transaction";

export default function ManageTransaction() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<string>("");

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactions();
            setTransactions(data);
            // Tính tổng số tiền từ tất cả giao dịch
            const total = data.reduce((sum, transaction) => sum + transaction.amount, 0);
            setTotalRevenue(total);
        } catch (err: any) {
            setError(err.message || "Error loading transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (details: string) => {
        setSelectedTransactionDetails(details);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTransactionDetails("");
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusColor = (status: Transaction['transactionStatus']) => {
        switch (status) {
            case "COMPLETED":
                return "success";
            case "CANCELLED":
                return "error";
            case "PENDING":
            default:
                return "warning";
        }
    };

    return (
        <div>
            <PageMeta title="Manage Transactions | Admin Dashboard" description="Page for managing transactions." />
            <PageBreadcrumb pageTitle="Manage Transactions" />
            {!loading && !error && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${totalRevenue.toFixed(2)}
                    </p>
                </div>
            )}
            <ComponentCard title="Transaction List">
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-gray-600 dark:text-gray-300">Loading transactions...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center py-4">
                        <p className="text-red-500 font-medium">Error: {error}</p>
                    </div>
                )}
                {!loading && !error && transactions.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                    <TableRow>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            User Name
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Amount
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Created At
                                        </TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                            Status
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="relative group">
                                            <TableCell className="py-3">
                                                <p
                                                    className="font-medium text-blue-600 text-sm dark:text-blue-400 cursor-pointer hover:underline"
                                                    onClick={() => handleViewDetails(transaction.description)}
                                                >
                                                    {transaction.user.userName}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                ${transaction.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                {new Date(transaction.createAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge size="sm" color={getStatusColor(transaction.transactionStatus)}>
                                                    {transaction.transactionStatus === "PENDING" && "Pending"}
                                                    {transaction.transactionStatus === "COMPLETED" && "Completed"}
                                                    {transaction.transactionStatus === "CANCELLED" && "Cancelled"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    !loading && !error && (
                        <div className="flex justify-center items-center py-4">
                            <p className="text-gray-600 dark:text-gray-300">There are currently no transactions.</p>
                        </div>
                    )
                )}
            </ComponentCard>

            <Modal
                isOpen={showDetailsModal}
                onClose={handleCloseDetailsModal}
                className="max-w-4xl p-6"
                showCloseButton={true}
            >
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h3>
                </div>
                <div className="mt-4 max-h-[80vh] overflow-y-auto">
                    {selectedTransactionDetails ? (
                        <p className="text-gray-700 dark:text-gray-300">{selectedTransactionDetails}</p>
                    ) : (
                        <p>No details to display.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}