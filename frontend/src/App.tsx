import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute allowedRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}