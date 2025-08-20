import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';

interface ApiFeedbackItem {
    expression: string;
    description: string;
}

export default function FeedbackPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [apiFeedback, setApiFeedback] = useState<ApiFeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStatusFilter, setCurrentStatusFilter] = useState<string>('All');
    const [currentRatingFilter, setCurrentRatingFilter] = useState<string>('All');

    useEffect(() => {
        const fetchWebsiteFeedback = async () => {
            try {
                const response = await fetch('/website-feedback');
                const data = await response.json();
                if (data.code === 200) {
                    setApiFeedback(data.data);
                }
            } catch (error) {
                console.error('Error fetching website feedback:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWebsiteFeedback();
    }, []);


    return (
        <>
            <PageMeta title="User Feedback" description="User feedback management page" />
            <PageBreadcrumb pageTitle="User Feedback" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">

                    {/* FEED BACK API section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Website Feedback
                        </h3>
                        {loading ? (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading feedback...
                            </div>
                        ) : apiFeedback.length > 0 ? (
                            <div className="space-y-4">
                                {apiFeedback.map((feedback, index) => (
                                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Badge color="primary">
                                                    {feedback.expression === 'VERY_SATISFIED' ? 'Very satisfied' :
                                                        feedback.expression === 'SATISFIED' ? 'Satisfied' :
                                                            feedback.expression === 'NEUTRAL' ? 'Neutral' :
                                                                feedback.expression === 'DISSATISFIED' ? 'Dissatisfied' : 'Very dissatisfied'}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {feedback.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                There is currently no feedback from the website
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal Lọc */}
            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Filter feedback
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentStatusFilter}
                                onChange={(e) => setCurrentStatusFilter(e.target.value)}
                            >
                                <option value="All">All statuses</option>
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
                                <option value="All">All ratings</option>
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
                            Apply filter
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}