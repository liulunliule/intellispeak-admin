import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ReactComponent as FilterIcon } from '../../icons/filter.svg?react';
import { ReactComponent as ExportIcon } from '../../icons/export.svg?react';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';

interface FeedbackItem {
    id: number;
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    message: string;
    rating: number;
    date: string;
    status: 'New' | 'In Progress' | 'Resolved';
}

export default function FeedbackPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
        {
            id: 1,
            user: {
                name: 'John Doe',
                email: 'john@example.com',
                avatar: '/images/user/user-01.jpg'
            },
            message: 'The AI response time is slower than expected when handling complex queries.',
            rating: 3,
            date: '2023-05-15',
            status: 'New'
        },
        {
            id: 2,
            user: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: '/images/user/user-02.jpg'
            },
            message: 'Great improvement in the accuracy of responses in the last update!',
            rating: 5,
            date: '2023-05-10',
            status: 'Resolved'
        },
        {
            id: 3,
            user: {
                name: 'Robert Johnson',
                email: 'robert@example.com',
                avatar: '/images/user/user-03.jpg'
            },
            message: 'The system sometimes provides inconsistent answers to similar questions.',
            rating: 2,
            date: '2023-05-05',
            status: 'In Progress'
        }
    ]);

    const [currentStatusFilter, setCurrentStatusFilter] = useState<string>('All');
    const [currentRatingFilter, setCurrentRatingFilter] = useState<string>('All');

    const filteredFeedback = feedbackList.filter(item => {
        const statusMatch = currentStatusFilter === 'All' || item.status === currentStatusFilter;
        const ratingMatch = currentRatingFilter === 'All' ||
            (currentRatingFilter === 'Positive' && item.rating >= 4) ||
            (currentRatingFilter === 'Negative' && item.rating <= 2) ||
            (currentRatingFilter === 'Neutral' && item.rating === 3);
        return statusMatch && ratingMatch;
    });

    const handleStatusChange = (id: number, newStatus: 'New' | 'In Progress' | 'Resolved') => {
        setFeedbackList(feedbackList.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
    };

    return (
        <>
            <PageMeta title="User Feedback" description="User feedback management page" />
            <PageBreadcrumb pageTitle="User Feedback" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            User Feedback
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <FilterIcon className="w-4 h-4" />
                                Filter
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ExportIcon className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Feedback List */}
                    <div className="space-y-4">
                        {filteredFeedback.length > 0 ? (
                            filteredFeedback.map((feedback) => (
                                <div key={feedback.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 overflow-hidden rounded-full">
                                                    <img
                                                        src={feedback.user.avatar}
                                                        alt={feedback.user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 dark:text-white/90">
                                                        {feedback.user.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {feedback.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <Badge
                                                    color={
                                                        feedback.status === 'New'
                                                            ? 'primary'
                                                            : feedback.status === 'In Progress'
                                                                ? 'warning'
                                                                : 'success'
                                                    }
                                                >
                                                    {feedback.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            {feedback.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {feedback.date}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(feedback.id, 'In Progress')}
                                                    disabled={feedback.status !== 'New'}
                                                >
                                                    Start Progress
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(feedback.id, 'Resolved')}
                                                    disabled={feedback.status === 'Resolved'}
                                                >
                                                    Mark Resolved
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No feedback found matching your criteria.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Filter Feedback
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentStatusFilter}
                                onChange={(e) => setCurrentStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        <div>
                            <Label>Rating</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentRatingFilter}
                                onChange={(e) => setCurrentRatingFilter(e.target.value)}
                            >
                                <option value="All">All Ratings</option>
                                <option value="Positive">Positive (4-5 stars)</option>
                                <option value="Neutral">Neutral (3 stars)</option>
                                <option value="Negative">Negative (1-2 stars)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsFilterOpen(false)}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}