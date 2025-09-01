import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import ChartTab from "../common/ChartTab";
import { getPackageStats } from "../../services/dashboard";

export default function StatisticsChart() {
  const currentYear = new Date().getFullYear();
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch package stats
  useEffect(() => {
    setLoading(true);
    getPackageStats(currentYear)
      .then((data) => {
        setSeries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching package stats:", err);
        setError("Failed to load package statistics");
        setSeries([]);
        setLoading(false);
      });
  }, []);

  // Dynamic colors for each package (expandable for more packages)
  const colors = [
    "#465FFF", // Primary color
    "#9CB9FF", // Lighter shade
    "#FF6B6B", // Red
    "#4CAF50", // Green
    "#FFCA28", // Yellow
    "#AB47BC", // Purple
  ].slice(0, series.length || 1); // Limit to number of packages

  const options: ApexOptions = {
    legend: {
      show: true, // Show legend to identify packages
      position: "top",
      horizontalAlign: "left",
    },
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: Array(series.length).fill(2), // Consistent line width for all packages
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "Subscriptions",
        style: {
          fontSize: "12px",
          fontWeight: 600,
          color: "#6B7280",
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Package subscriptions for {currentYear}
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="text-gray-400">Loading data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="text-red-500">{error}</div>
            </div>
          ) : series.length === 0 ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="text-gray-500">No package data available</div>
            </div>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
}
