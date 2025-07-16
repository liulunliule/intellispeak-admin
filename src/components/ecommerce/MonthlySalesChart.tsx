import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MonthlySalesChart() {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Thg 1",
        "Thg 2",
        "Thg 3",
        "Thg 4",
        "Thg 5",
        "Thg 6",
        "Thg 7",
        "Thg 8",
        "Thg 9",
        "Thg 10",
        "Thg 11",
        "Thg 12",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [series, setSeries] = useState([
    {
      name: "Doanh số",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Generate a list of years: current year and two previous years
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - 2 + i).filter(y => y <= currentYear);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `https://endlessly-enabling-husky.ngrok-free.app/admin/yearly-revenue?year=${year}`
      )
      .then((res) => {
        if (res.data && res.data.data) {
          // Extract numeric value from 'Amount' (e.g., '0 Đồng')
          const data = res.data.data.map((item: { Amount: string }) => {
            const match = item.Amount.match(/\d+/g);
            return match ? parseInt(match.join(""), 10) : 0;
          });
          setSeries([
            {
              name: "Doanh số",
              data,
            },
          ]);
        }
      })
      .catch(() => {
        setSeries([
          {
            name: "Doanh số",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Doanh thu hàng tháng
        </h3>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Xem thêm
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Xóa
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
          ) : (
            <Chart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}