import { useState, useEffect } from 'react';
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

interface ApiFeedbackItem {
    expression: string;
    description: string;
}

export default function FeedbackPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
        {
            id: 1,
            user: {
                name: 'Nguyễn Văn A',
                email: 'john@example.com',
                avatar: '/images/user/user-01.jpg'
            },
            message: 'Thời gian phản hồi của AI chậm hơn dự kiến khi xử lý các truy vấn phức tạp.',
            rating: 3,
            date: '15-05-2023',
            status: 'New'
        },
        {
            id: 2,
            user: {
                name: 'Trần Thị B',
                email: 'jane@example.com',
                avatar: '/images/user/user-02.jpg'
            },
            message: 'Cải thiện tuyệt vời về độ chính xác của các phản hồi trong bản cập nhật gần đây!',
            rating: 5,
            date: '10-05-2023',
            status: 'Resolved'
        },
        {
            id: 3,
            user: {
                name: 'Lê Văn C',
                email: 'robert@example.com',
                avatar: '/images/user/user-03.jpg'
            },
            message: 'Hệ thống đôi khi cung cấp các câu trả lời không nhất quán cho các câu hỏi tương tự.',
            rating: 2,
            date: '05-05-2023',
            status: 'In Progress'
        }
    ]);

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
            <PageMeta title="Phản hồi người dùng" description="Trang quản lý phản hồi của người dùng" />
            <PageBreadcrumb pageTitle="Phản hồi người dùng" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Phản hồi người dùng
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <FilterIcon className="w-4 h-4" />
                                Lọc
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ExportIcon className="w-4 h-4" />
                                Xuất
                            </Button>
                        </div>
                    </div>

                    {/* Danh sách Phản hồi */}
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
                                                    {feedback.status === 'New' ? 'Mới' : feedback.status === 'In Progress' ? 'Đang xử lý' : 'Đã giải quyết'}
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
                                                    Bắt đầu xử lý
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(feedback.id, 'Resolved')}
                                                    disabled={feedback.status === 'Resolved'}
                                                >
                                                    Đánh dấu đã giải quyết
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Không tìm thấy phản hồi nào phù hợp với tiêu chí của bạn.
                            </div>
                        )}
                    </div>

                    {/* FEED BACK API section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Phản hồi từ website
                        </h3>
                        {loading ? (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Đang tải phản hồi...
                            </div>
                        ) : apiFeedback.length > 0 ? (
                            <div className="space-y-4">
                                {apiFeedback.map((feedback, index) => (
                                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Badge color="primary">
                                                    {feedback.expression === 'VERY_SATISFIED' ? 'Rất hài lòng' :
                                                        feedback.expression === 'SATISFIED' ? 'Hài lòng' :
                                                            feedback.expression === 'NEUTRAL' ? 'Trung lập' :
                                                                feedback.expression === 'DISSATISFIED' ? 'Không hài lòng' : 'Rất không hài lòng'}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {feedback.description || 'Không có mô tả'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Hiện tại chưa có feedback từ website
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal Lọc */}
            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="max-w-md">
                <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Lọc phản hồi
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Trạng thái</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentStatusFilter}
                                onChange={(e) => setCurrentStatusFilter(e.target.value)}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="New">Mới</option>
                                <option value="In Progress">Đang xử lý</option>
                                <option value="Resolved">Đã giải quyết</option>
                            </select>
                        </div>

                        <div>
                            <Label>Đánh giá</Label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={currentRatingFilter}
                                onChange={(e) => setCurrentRatingFilter(e.target.value)}
                            >
                                <option value="All">Tất cả đánh giá</option>
                                <option value="Positive">Tích cực (4-5 sao)</option>
                                <option value="Neutral">Trung lập (3 sao)</option>
                                <option value="Negative">Tiêu cực (1-2 sao)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={() => setIsFilterOpen(false)}>
                            Áp dụng bộ lọc
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}