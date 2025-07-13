import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ReactComponent as DownloadIcon } from '../../icons/download.svg?react';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';

interface Report {
    id: number;
    title: string;
    type: 'Daily' | 'Weekly' | 'Monthly';
    generatedDate: string;
    status: 'Ready' | 'Processing' | 'Failed';
    downloadUrl?: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([
        {
            id: 1,
            title: 'Phân tích phản hồi người dùng - Tháng 5/2023',
            type: 'Monthly',
            generatedDate: '01-06-2023',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 2,
            title: 'Hiệu suất hệ thống hàng tuần',
            type: 'Weekly',
            generatedDate: '28-05-2023',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 3,
            title: 'Nhật ký lỗi hàng ngày',
            type: 'Daily',
            generatedDate: '30-05-2023',
            status: 'Processing'
        },
        {
            id: 4,
            title: 'Phân tích phản hồi người dùng - Tháng 4/2023',
            type: 'Monthly',
            generatedDate: '01-05-2023',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 5,
            title: 'Báo cáo tình trạng hệ thống',
            type: 'Weekly',
            generatedDate: '21-05-2023',
            status: 'Failed'
        }
    ]);

    const generateNewReport = () => {
        const newReport: Report = {
            id: Math.max(...reports.map(r => r.id)) + 1,
            title: `Báo cáo mới tháng ${new Date().toLocaleString('vi-VN', { month: 'long' })}`,
            type: 'Monthly',
            generatedDate: new Date().toLocaleDateString('vi-VN'),
            status: 'Processing'
        };
        setReports([newReport, ...reports]);

        // Simulate report generation completion after 5 seconds
        setTimeout(() => {
            setReports(prevReports => prevReports.map(r => // Use functional update for useState
                r.id === newReport.id
                    ? { ...r, status: 'Ready', downloadUrl: '#' }
                    : r
            ));
        }, 5000);
    };

    return (
        <>
            <PageMeta title="Báo cáo hệ thống" description="Trang quản lý báo cáo hệ thống" />
            <PageBreadcrumb pageTitle="Báo cáo hệ thống" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Báo cáo hệ thống
                        </h3>
                        <Button onClick={generateNewReport}>
                            Tạo báo cáo mới
                        </Button>
                    </div>

                    {/* Bảng báo cáo */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tiêu đề báo cáo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Loại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white/90">
                                            {report.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {report.type === 'Daily' ? 'Hàng ngày' : report.type === 'Weekly' ? 'Hàng tuần' : 'Hàng tháng'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {report.generatedDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                color={
                                                    report.status === 'Ready'
                                                        ? 'success'
                                                        : report.status === 'Processing'
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                            >
                                                {report.status === 'Ready' ? 'Sẵn sàng' : report.status === 'Processing' ? 'Đang xử lý' : 'Thất bại'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {report.status === 'Ready' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    <DownloadIcon className="w-4 h-4" />
                                                    Tải xuống
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">Chưa có</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}