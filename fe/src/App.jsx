import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Common Pages
import HomePage from './pages/HomePage';
import ResidentLogin from './pages/auth/ResidentLogin';
import StaffLogin from './pages/auth/StaffLogin';
import ManagerLogin from './pages/auth/ManagerLogin';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentServiceRequest from './pages/resident/ResidentServiceRequest';
import ResidentRequests from './pages/resident/ResidentRequests';
import ResidentBills from './pages/resident/ResidentBills';
import ResidentInformation from './pages/resident/ResidentInformation';
import ResidentNotifications from './pages/resident/ResidentNotifications';
import ResidentFeedback from './pages/resident/ResidentFeedback';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import HandleRequests from './pages/staff/HandleRequests';
import CreateServiceBill from './pages/staff/CreateServiceBill';
import CreateMaintenanceBill from './pages/staff/CreateMaintenanceBill';
import CreateFinancialReport from './pages/staff/CreateFinancialReport';
import SendNotification from './pages/staff/SendNotification';
import ViewFeedback from './pages/staff/ViewFeedback';

// Manager Pages - Đảm bảo đã import hết
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerCreateRequest from './pages/manager/ManagerCreateRequest';
import ViewReports from './pages/manager/ViewReports';
import ManageStaff from './pages/manager/ManageStaff';
import ManageResidents from './pages/manager/ManageResidents';
import ManageApartments from './pages/manager/ManageApartments';
import ManageServices from './pages/manager/ManageServices';
import ManageContracts from './pages/manager/ManageContracts';
// import ManagerInternalRequest from './pages/manager/ManagerInternalRequest'; // Xóa nếu không dùng nữa

function App() {
  // // Create a ProtectedRoute component
  // const ProtectedRoute = ({ allowedRole }) => {
  //   const { user } = useContext(AuthContext);
  //   const location = useLocation();
    
  //   if (!user) {
  //     return <Navigate to="/login" state={{ from: location }} replace />;
  //   }
    
  //   if (allowedRole && user.role !== allowedRole) {
  //     return <Navigate to="/" replace />;
  //   }
    
  //   return <Outlet />;
  // };

  const NotFound = () => {
    return (
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-base font-semibold text-indigo-600">404</h1>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            Page not found
          </h2>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back home
            </a>
          </div>
        </div>
      </main>
    );
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Home & Login Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login/resident" element={<ResidentLogin />} />
          <Route path="/login/staff" element={<StaffLogin />} />
          <Route path="/login/manager" element={<ManagerLogin />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Resident Layout & Routes */}
          <Route path="/resident" element={<ResidentDashboard />}>
            <Route path="services" element={<ResidentServiceRequest />} />
            <Route path="requests" element={<ResidentRequests />} />
            <Route path="bills" element={<ResidentBills />} />
            <Route path="information" element={<ResidentInformation />} />
            <Route path="notifications" element={<ResidentNotifications />} />
            <Route path="feedback" element={<ResidentFeedback />} />
          </Route>

          {/* Staff Layout & Routes */}
          <Route path="/staff" element={<StaffDashboard />}>
            <Route path="handle-requests" element={<HandleRequests />} />
            <Route path="view-feedback" element={<ViewFeedback />} />
            <Route path="create-service-bill" element={<CreateServiceBill />} />
            <Route path="create-maintenance-bill" element={<CreateMaintenanceBill />} />
            <Route path="create-financial-report" element={<CreateFinancialReport />} />
            <Route path="send-notification" element={<SendNotification />} />
          </Route>

          {/* Manager Layout & Routes */}
          <Route path="/manager" element={<ManagerDashboard />}>
            <Route path="create-request" element={<ManagerCreateRequest />} />
            <Route path="view-reports" element={<ViewReports />} />
            <Route path="manage-staff" element={<ManageStaff />} />
            <Route path="manage-residents" element={<ManageResidents />} />
            <Route path="manage-contracts" element={<ManageContracts />} />
            <Route path="manage-apartments" element={<ManageApartments />} />
            <Route path="manage-services" element={<ManageServices />} />
            {/* <Route path="create-internal-request" element={<ManagerInternalRequest />} /> */} {/* Xóa nếu không dùng */}
          </Route>

          {/* TODO: Add 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;