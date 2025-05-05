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
          {/* <Route path="*" element={<NotFound />} /> */}

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;