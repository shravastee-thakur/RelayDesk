import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./components/MainLayout";
import AppLayout from "./components/AppLayout";

// Guards
import GuestOnlyRoute from "./components/GuestOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Public
import LandingPage from "./pages/LandingPage";

// Auth
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

// Dashboards
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerTicketsPage from "./pages/customer/CustomerTicketsPage";
import AuthBootstrap from "./components/AuthBootstrap";
import AgentQueuePage from "./pages/agent/AgentQueuePage";
import AgentTicketsPage from "./pages/agent/AgentTicketsPage";

const App = () => {
  return (
    <AuthBootstrap>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* ─── PUBLIC (with navbar) ─── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* ─── AUTH (no navbar, no layout) ─── */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ─── PROTECTED DASHBOARDS (with navbar) ─── */}
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/tickets" element={<CustomerTicketsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/queue" element={<AgentQueuePage />} />
            <Route path="/agent/tickets" element={<AgentTicketsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* ─── CATCH ALL ─── */}
      </Routes>
    </AuthBootstrap>
  );
};

export default App;
