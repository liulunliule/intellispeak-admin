import { useState, useEffect, ReactNode } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import api from '../../services/api';

// Icons (unchanged)
const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const MessageIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EmailIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// Custom Button Component
interface CustomButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const CustomButton = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    disabled = false,
    type = 'button'
}: CustomButtonProps) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base'
    };

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800'
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    const classes = `
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? disabledClasses : ''}
        ${className}
    `;

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

interface ApiFeedbackItem {
    userID: string;
    websiteFeedbackId: string;
    userName: string;
    userEmail: string;
    description: string;
    isHandled: boolean | null;
    createAt: string;
}

export default function FeedbackPage() {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentFeedbackId, setCurrentFeedbackId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [apiFeedback, setApiFeedback] = useState<ApiFeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentStatusFilter, setCurrentStatusFilter] = useState<string>('All');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchWebsiteFeedback = async () => {
            try {
                const response = await api.get('/website-feedback');
                if (response.status === 200) {
                    setApiFeedback(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching website feedback:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWebsiteFeedback();
    }, []);

    // Filter feedback based on search and status only
    const filteredFeedback = apiFeedback.filter(feedback => {
        const matchesSearch = feedback.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feedback.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feedback.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = currentStatusFilter === 'All' ||
            (currentStatusFilter === 'Approved' && feedback.isHandled === true) ||
            (currentStatusFilter === 'Pending' && feedback.isHandled === null) ||
            (currentStatusFilter === 'Rejected' && feedback.isHandled === false);

        return matchesSearch && matchesStatus;
    });

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await api.post(`/website-feedback/handle-approve/${id}`);
            setApiFeedback(prev => prev.map(item =>
                item.websiteFeedbackId === id ? { ...item, isHandled: true } : item
            ));
        } catch (error) {
            console.error('Error approving feedback:', error);
            alert('Failed to approve feedback. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string, reason: string) => {
        setProcessingId(id);
        try {
            await api.post(`/website-feedback/handle-reject/${id}?reason=${encodeURIComponent(reason)}`);
            setApiFeedback(prev => prev.map(item =>
                item.websiteFeedbackId === id ? { ...item, isHandled: false } : item
            ));
            setIsRejectModalOpen(false);
            setRejectReason('');
            setCurrentFeedbackId(null);
        } catch (error) {
            console.error('Error rejecting feedback:', error);
            alert('Failed to reject feedback. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (id: string) => {
        setCurrentFeedbackId(id);
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setRejectReason('');
        setCurrentFeedbackId(null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No date';
        return dateString; // Keep the original date format from API
    };

    const getStatus = (isHandled: boolean | null) => {
        if (isHandled === true) return { text: 'Approved', color: 'success' };
        if (isHandled === false) return { text: 'Rejected', color: 'danger' };
        return { text: 'Pending', color: 'warning' };
    };

    return (
        <>
            <PageMeta title="User Complaint Management" description="Manage user complaints" />
            <PageBreadcrumb pageTitle="User Complaint Management" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
                {/* Header with search and filter */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">User Complaints</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage and respond to user complaints</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email or content..."
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Status filter dropdown */}
                        <div className="relative">
                            <select
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-44 appearance-none"
                                value={currentStatusFilter}
                                onChange={e => setCurrentStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FilterIcon />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats summary */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="flex items-center">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-800/30">
                                <MessageIcon />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Feedback</h3>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{apiFeedback.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20">
                        <div className="flex items-center">
                            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-800/30">
                                <MessageIcon />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Pending</h3>
                                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                    {apiFeedback.filter(f => f.isHandled === null).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                        <div className="flex items-center">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-800/30">
                                <MessageIcon />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Approved</h3>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {apiFeedback.filter(f => f.isHandled === true).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex items-center">
                            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-800/30">
                                <MessageIcon />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Rejected</h3>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                    {apiFeedback.filter(f => f.isHandled === false).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback list */}
                <div className="mt-8">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="mt-3 h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredFeedback.length > 0 ? (
                        <div className="space-y-4">
                            {filteredFeedback.map((feedback) => {
                                const status = getStatus(feedback.isHandled);

                                return (
                                    <div key={feedback.websiteFeedbackId} className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800/70">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                                                        <UserIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 dark:text-white/90">{feedback.userName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <EmailIcon />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{feedback.userEmail}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {formatDate(feedback.createAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {status.text === 'Rejected' ? (
                                                    <Badge variant="light" color="error">
                                                        Rejected
                                                    </Badge>
                                                ) : (
                                                    <Badge color={status.color as any}>
                                                        {status.text}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="ml-11">
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {feedback.description || 'No description provided'}
                                                </p>
                                            </div>

                                            {feedback.isHandled === null && (
                                                <div className="ml-11 flex items-center gap-2">
                                                    <CustomButton
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleApprove(feedback.websiteFeedbackId)}
                                                        disabled={processingId === feedback.websiteFeedbackId}
                                                    >
                                                        {processingId === feedback.websiteFeedbackId ? 'Processing...' : 'Approve'}
                                                    </CustomButton>
                                                    <CustomButton
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => openRejectModal(feedback.websiteFeedbackId)}
                                                        disabled={processingId === feedback.websiteFeedbackId}
                                                    >
                                                        Reject
                                                    </CustomButton>
                                                </div>
                                            )}

                                            {feedback.isHandled !== null && (
                                                <div className="ml-11">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        This feedback has been {feedback.isHandled ? 'approved' : 'rejected'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                <MessageIcon />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No feedback found</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                {searchQuery || currentStatusFilter !== 'All'
                                    ? 'Try adjusting your search or filter to find what you\'re looking for.'
                                    : 'There is currently no feedback from users.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Reason Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Reject Feedback
                        </h3>
                        <button
                            onClick={closeRejectModal}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="rejectReason">Reason for rejection</Label>
                        <textarea
                            id="rejectReason"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Please provide a reason for rejecting this feedback..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <CustomButton variant="outline" onClick={closeRejectModal}>
                            Cancel
                        </CustomButton>
                        <CustomButton
                            variant="danger"
                            onClick={() => currentFeedbackId && handleReject(currentFeedbackId, rejectReason)}
                            disabled={!rejectReason.trim() || processingId === currentFeedbackId}
                        >
                            {processingId === currentFeedbackId ? 'Processing...' : 'Confirm Reject'}
                        </CustomButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}