import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import api from '../../services/api';

export default function PackageMetrics() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/plan-counts")
      .then((res) => {
        if (res.data && res.data.data) {
          setCounts(res.data.data);
        } else {
          setCounts({});
        }
      })
      .catch(() => {
        setCounts({});
      })
      .finally(() => setLoading(false));
  }, []);

  // Always use BoxIconLine for all packages
  const getIcon = () => <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />;

  // Choose badge color (success if count > 0, error if 0)
  const getBadgeColor = (count: number) => (count > 0 ? "success" : "error");

  return (
    <div
      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-black dark:scrollbar-track-gray-800"
      style={{
        scrollbarColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
          ? '#6d6b6bff #1f2937'
          : '#d1d5db #f3f4f6',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex gap-4 md:gap-6 min-w-max py-1">
        {loading || !counts ? (
          <div className="flex-1 text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          Object.entries(counts).map(([name, count]) => (
            <div
              key={name}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8 flex-shrink-0 w-96"
              style={{ minWidth: '10rem', maxWidth: '30rem' }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                {getIcon()}
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {name}
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {count}
                  </h4>
                </div>
                <Badge color={getBadgeColor(count)}>
                  {count > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}