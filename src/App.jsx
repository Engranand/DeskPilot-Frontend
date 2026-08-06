import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerPortal from "./pages/CustomerPortal";
import AgentInbox from "./pages/AgentInbox";
import GuestTracker from "./pages/GuestTracker";
import Widget from "./pages/Widget";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      {/* Root path — abhi koi landing page nahi hai, isliye /login pe redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={["agent"]}>
            <AgentInbox />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerPortal />
          </ProtectedRoute>
        }
      />

      <Route path="/track" element={<GuestTracker />} />

      {/* Widget Route */}
      <Route path="/widget" element={<Widget />} />

      {/* Catch-all — koi bhi unknown path /login pe bhej do, taaki wahan bhi blank screen na aaye */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;