import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import api from '../../services/api';

interface Package {
  packageId: number;
  packageName: string;
  description: string;
  price: number;
  interviewCount: number;
  cvAnalyzeCount: number;
  jdAnalyzeCount: number;
  createAt: string;
  updateAt: string;
}

interface PackageMetricsProps {
  className?: string;
}

// Tạo các icon thay thế nếu không có trong thư viện
const UsersIcon = () => (
  <svg className="text-green-600 size-4 mr-2 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="text-purple-600 size-4 mr-2 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="text-orange-600 size-4 mr-2 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function PackageMetrics({ className = "" }: PackageMetricsProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch package list and user counts in parallel
        const [packagesResponse, countsResponse] = await Promise.all([
          api.get("/package"),
          api.get("/admin/plan-counts")
        ]);

        if (packagesResponse.data?.data) {
          setPackages(packagesResponse.data.data);
        }

        if (countsResponse.data?.data) {
          setUserCounts(countsResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPackages([]);
        setUserCounts({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Choose badge color (success if count > 0, error if 0)
  const getBadgeColor = (count: number) => (count > 0 ? "success" : "error");

  return (
    <div className={`${className} overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900`}>
      <div className="flex gap-4 md:gap-6 min-w-max py-1 px-1">
        {loading ? (
          // Skeleton loading states
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8 flex-shrink-0 w-80 animate-pulse"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
              <div className="mt-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
              </div>
            </div>
          ))
        ) : packages.length === 0 ? (
          <div className="flex-1 text-center py-8 text-gray-500 dark:text-gray-400">
            No packages available
          </div>
        ) : (
          [...packages]
            .sort((a, b) => a.price - b.price)
            .map((pkg) => {
              const userCount = userCounts[pkg.packageName] || 0;

              return (
                <div
                  key={pkg.packageId}
                  className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8 flex-shrink-0 w-80 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
                >
                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-900/20 mr-3">
                        <BoxIconLine className="text-blue-600 size-6 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">
                        {pkg.packageName}
                      </h3>
                    </div>
                    <Badge color={getBadgeColor(userCount)}>
                      {userCount > 0 ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                      <span>{userCount} users</span>
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {pkg.price === 0 ? 'Free' : formatCurrency(pkg.price)}
                    </span>
                    {pkg.price > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/one-time</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <UsersIcon />
                      <span className="text-gray-700 dark:text-gray-300">{pkg.interviewCount} Interviews</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DocumentTextIcon />
                      <span className="text-gray-700 dark:text-gray-300">{pkg.cvAnalyzeCount} CV Analyses</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BriefcaseIcon />
                      <span className="text-gray-700 dark:text-gray-300">{pkg.jdAnalyzeCount} JD Analyses</span>
                    </div>
                  </div>

                  {/* Footer with creation date */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(pkg.createAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}