import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole?: "customer" | "provider";
};

type StoredUser = {
  role?: string;
  name?: string;
  email?: string;
};

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let user: StoredUser;

  try {
    user = JSON.parse(userString) as StoredUser;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const normalizedRole =
    user.role === "service_provider" ? "provider" : user.role;

  if (allowedRole && normalizedRole !== allowedRole) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}