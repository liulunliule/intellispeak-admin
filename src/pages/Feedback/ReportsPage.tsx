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
            title: 'User Feedback Analysis - May 2023',
            type: 'Monthly',
            generatedDate: '2023-06-01',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 2,
            title: 'Weekly System Performance',
            type: 'Weekly',
            generatedDate: '2023-05-28',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 3,
            title: 'Daily Error Logs',
            type: 'Daily',
            generatedDate: '2023-05-30',
            status: 'Processing'
        },
        {
            id: 4,
            title: 'User Feedback Analysis - April 2023',
            type: 'Monthly',
            generatedDate: '2023-05-01',
            status: 'Ready',
            downloadUrl: '#'
        },
        {
            id: 5,
            title: 'System Health Report',
            type: 'Weekly',
            generatedDate: '2023-05-21',
            status: 'Failed'
        }
    ]);

    const generateNewReport = () => {
        const newReport: Report = {
            id: Math.max(...reports.map(r => r.id)) + 1,
            title: `New ${new Date().toLocaleString('default', { month: 'long' })} Report`,
            type: 'Monthly',
            generatedDate: new Date().toISOString().split('T')[0],
            status: 'Processing'
        };
        setReports([newReport, ...reports]);

        // Simulate report generation completion after 5 seconds
        setTimeout(() => {
            setReports(reports.map(r =>
                r.id === newReport.id
                    ? { ...r, status: 'Ready', downloadUrl: '#' }
                    : r
            ));
        }, 5000);
    };

    return (
        <>
            <PageMeta title="System Reports" description="System reports management page" />
            <PageBreadcrumb pageTitle="System Reports" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            System Reports
                        </h3>
                        <Button onClick={generateNewReport}>
                            Generate New Report
                        </Button>
                    </div>

                    {/* Reports Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Report Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Generated Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
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
                                            {report.type}
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
                                                {report.status}
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
                                                    Download
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">Not available</span>
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