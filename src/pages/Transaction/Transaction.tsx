import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { getTotalRevenue, getTransactions, Transaction } from "../../services/transaction";

export default function ManageTransaction() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch (err: any) {
            setError(err.message || "Error loading transactions");
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalRevenue = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTotalRevenue();
            setTotalRevenue(data);
        } catch (err: any) {
            setError(err.message || "Error loading total revenue");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTransaction(null);
    };

    useEffect(() => {
        fetchTransactions();
        fetchTotalRevenue();
    }, []);

    const getStatusColor = (status: Transaction['transactionStatus']) => {
        switch (status) {
            case "PAID":
                return "success";
            case "CANCELLED":
                return "error";
            case "PENDING":
            default:
                return "warning";
        }
    };

    const filteredTransactions = statusFilter === "ALL"
        ? transactions
        : transactions.filter(transaction => transaction.transactionStatus === statusFilter);

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
                <div className="mb-4">
                    <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter by Status:
                    </label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <option value="ALL">All</option>
                        <option value="PAID">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>
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
                {!loading && !error && filteredTransactions.length > 0 ? (
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
                                            Package
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
                                    {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="relative group">
                                            <TableCell className="py-3">
                                                <p
                                                    className="font-medium text-blue-600 text-sm dark:text-blue-400 cursor-pointer hover:underline"
                                                    onClick={() => handleViewDetails(transaction)}
                                                >
                                                    {transaction.user.firstName ? transaction.user.firstName : transaction.user.userName}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                ${transaction.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                {transaction.apackage?.packageName || 'None'}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                                {new Date(transaction.createAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge size="sm" color={getStatusColor(transaction.transactionStatus)}>
                                                    {transaction.transactionStatus === "PENDING" && "Pending"}
                                                    {transaction.transactionStatus === "PAID" && "Completed"}
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
                className="max-w-4xl p-8 rounded-2xl"
                showCloseButton={true}
            >
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Details</h3>
                </div>
                <div className="mt-6 max-h-[80vh] overflow-y-auto">
                    {selectedTransaction ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 border-b border-gray-200 dark:border-gray-700 pb-2">User Information</h4>
                                    <dl className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Username</dt>
                                            <dd>{selectedTransaction.user.userName}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Full Name</dt>
                                            <dd>{selectedTransaction.user.firstName || 'None'} {selectedTransaction.user.lastName || ''}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Email</dt>
                                            <dd>{selectedTransaction.user.email}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Phone</dt>
                                            <dd>{selectedTransaction.user.phone || 'None'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Role</dt>
                                            <dd>{selectedTransaction.user.role}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Status</dt>
                                            <dd>{selectedTransaction.user.status}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Bio</dt>
                                            <dd>{selectedTransaction.user.bio || 'None'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Website</dt>
                                            <dd>{selectedTransaction.user.website || 'None'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Account Created</dt>
                                            <dd>{new Date(selectedTransaction.user.createAt).toLocaleDateString()}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">CV Analysis Used</dt>
                                            <dd>{selectedTransaction.user.cvAnalyzeUsed}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">JD Analysis Used</dt>
                                            <dd>{selectedTransaction.user.jdAnalyzeUsed}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Interviews Used</dt>
                                            <dd>{selectedTransaction.user.interviewUsed}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 border-b border-gray-200 dark:border-gray-700 pb-2">Package Information</h4>
                                    <dl className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Package Name</dt>
                                            <dd>{selectedTransaction.apackage?.packageName || 'None'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Description</dt>
                                            <dd>{selectedTransaction.apackage?.description || 'None'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Price</dt>
                                            <dd>${selectedTransaction.apackage?.price.toFixed(2) || '0.00'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Interview Count</dt>
                                            <dd>{selectedTransaction.apackage?.interviewCount || '0'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">CV Analysis Count</dt>
                                            <dd>{selectedTransaction.apackage?.cvAnalyzeCount || '0'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">JD Analysis Count</dt>
                                            <dd>{selectedTransaction.apackage?.jdAnalyzeCount || '0'}</dd>
                                        </div>
                                    </dl>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 border-b border-gray-200 dark:border-gray-700 pb-2">Transaction Information</h4>
                                    <dl className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Order Code</dt>
                                            <dd>{selectedTransaction.orderCode}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Amount</dt>
                                            <dd>${selectedTransaction.amount.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Status</dt>
                                            <dd>
                                                {selectedTransaction.transactionStatus === "PENDING" && "Pending"}
                                                {selectedTransaction.transactionStatus === "PAID" && "Completed"}
                                                {selectedTransaction.transactionStatus === "CANCELLED" && "Cancelled"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Description</dt>
                                            <dd>{selectedTransaction.description}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium">Created At</dt>
                                            <dd>{new Date(selectedTransaction.createAt).toLocaleDateString()}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300">No details to display.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
