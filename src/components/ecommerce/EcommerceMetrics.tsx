import axios from "axios";
import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  const [counts, setCounts] = useState<{ PROFESSIONAL: number; BUSINESS: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://endlessly-enabling-husky.ngrok-free.app/admin/plan-counts")
      .then((res) => {
        if (res.data && res.data.data) {
          console.log('Plan counts API data:', res);
          setCounts(res.data.data);
        }
      })
      .catch(() => {
        setCounts({ PROFESSIONAL: 0, BUSINESS: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* PROFESSIONAL Premium Metric Item */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              PROFESSIONAL Premium
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading || !counts ? "..." : counts.PROFESSIONAL}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {/* Placeholder for percentage or trend */}
          </Badge>
        </div>
      </div>
      {/* BUSINESS Premium Metric Item */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              BUSINESS Premium
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading || !counts ? "..." : counts.BUSINESS}
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon />
            {/* Placeholder for percentage or trend */}
          </Badge>
        </div>
      </div>
    </div>
  );
}
