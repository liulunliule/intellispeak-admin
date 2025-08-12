import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/Profile/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ManageUsers from "./pages/Profile/ManageUsers";
import ManageQuestions from "./pages/Questions/Question/ManageQuestions";
import FeedbackPage from "./pages/Feedback/FeedbackPage";
import ReportsPage from "./pages/Feedback/ReportsPage";
import ModelConfiguration from "./pages/AISettings/ModelConfiguration";
import ApiManagement from "./pages/AISettings/ApiManagement";
import PerformanceMetrics from "./pages/AISettings/PerformanceMetrics";
import ManageForum from "./pages/Forum/ManageForum";
import ManageTags from "./pages/Questions/ManageTags";
import ManageInterviewSessions from "./pages/Questions/ManageInterviewSessions";
import ManageHR from "./pages/HR/ManageHR";
import ManagePackage from "./pages/Package/ManagePackage";
import ManageTopics from "./pages/Questions/Topics/ManageTopics";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/manage_user" element={<ManageUsers />} />
            <Route path="/manage-forum" element={<ManageForum />} />
            <Route path="/manage-hr" element={<ManageHR />} />

            {/* Package Management */}
            <Route path="/manage-package" element={<ManagePackage />} />
            {/* Future: Add more package management screens here as needed */}


            <Route path="/questions" element={<ManageQuestions />} />
            <Route path="/manage-tags" element={<ManageTags />} />
            <Route path="/manage-interview-sessions" element={<ManageInterviewSessions />} />
            <Route path="/manage-topics" element={<ManageTopics />} />

            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Feedback and Reports */}
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* AI Settings */}
            <Route path="/ai/config" element={<ModelConfiguration />} />
            <Route path="/ai/api" element={<ApiManagement />} />
            <Route path="/ai/metrics" element={<PerformanceMetrics />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route index path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
