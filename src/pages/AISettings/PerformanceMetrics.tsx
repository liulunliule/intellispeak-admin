import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ReactComponent as RefreshIcon } from '../../icons/refresh.svg?react';
import { ReactComponent as DownloadIcon } from '../../icons/download.svg?react';
import Button from '../../components/ui/button/Button';

export default function PerformanceMetrics() {
    const [timeRange, setTimeRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(false);

    const refreshData = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const metrics = {
        responseTime: {
            current: 142,
            previous: 156,
            trend: 'down'
        },
        accuracy: {
            current: 92.4,
            previous: 91.8,
            trend: 'up'
        },
        requests: {
            current: 12542,
            previous: 11876,
            trend: 'up'
        },
        errors: {
            current: 1.2,
            previous: 1.8,
            trend: 'down'
        }
    };

    return (
        <>
            <PageMeta title="Performance Metrics" description="AI Performance Metrics" />
            <PageBreadcrumb pageTitle="Performance Metrics" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            System Performance
                        </h3>
                        <div className="flex gap-3">
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                            <Button
                                variant="outline"
                                onClick={refreshData}
                                className="flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(metrics).map(([key, metric]) => (
                            <div key={key} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {key.split(/(?=[A-Z])/).join(' ')}
                                        </h4>
                                        <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                            {typeof metric.current === 'number'
                                                ? key === 'accuracy' || key === 'errors'
                                                    ? `${metric.current}%`
                                                    : metric.current.toLocaleString()
                                                : metric.current}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${metric.trend === 'up'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {metric.trend === 'up' ? '↑' : '↓'} {Math.abs(
                                            ((metric.current - metric.previous) / metric.previous) * 100
                                        ).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="mt-4 h-24 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center">
                                    {/* Chart placeholder - replace with actual chart component */}
                                    <div className="text-sm text-gray-400 dark:text-gray-500">
                                        Chart will appear here
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Charts Section */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
                                Response Time Trend
                            </h4>
                            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center">
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                    Response time chart
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
                                Accuracy Over Time
                            </h4>
                            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center">
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                    Accuracy chart
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                                Recent Activity
                            </h4>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {[
                                { id: 1, event: 'Model updated to v2.3.1', time: '10 minutes ago', status: 'success' },
                                { id: 2, event: 'Scheduled maintenance', time: '2 hours ago', status: 'info' },
                                { id: 3, event: 'API rate limit exceeded', time: '5 hours ago', status: 'warning' },
                                { id: 4, event: 'New training data imported', time: '1 day ago', status: 'success' },
                            ].map((item) => (
                                <div key={item.id} className="px-6 py-4 flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${item.status === 'success'
                                            ? 'bg-green-500'
                                            : item.status === 'warning'
                                                ? 'bg-yellow-500'
                                                : 'bg-blue-500'
                                        }`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {item.event}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {item.time}
                                        </p>
                                    </div>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}