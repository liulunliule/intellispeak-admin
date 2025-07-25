import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart";
import StatisticsChart from "../../components/dashboard/StatisticsChart";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/dashboard/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import TopHRQuestions from "../../components/dashboard/TopHR";
import PackageMetrics from "../../components/dashboard/PackageMetrics";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Admin Dashboard | React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page "
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 overflow-x-auto">
          <PackageMetrics />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          {/* <RecentOrders /> */}
          <TopHRQuestions />
        </div>
      </div>
    </>
  );
}
