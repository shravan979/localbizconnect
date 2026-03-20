import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

type LoginResponse = {
  token: string;
  user: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is missing");
      }

      const res = await axios.post<LoginResponse>(
        `${apiUrl}/api/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      const normalizedRole =
        user.role?.toLowerCase() === "service_provider"
          ? "provider"
          : user.role?.toLowerCase();

      if (normalizedRole !== "customer" && normalizedRole !== "provider") {
        throw new Error("Invalid user role");
      }

      const normalizedUser = {
        ...user,
        role: normalizedRole,
      };

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      if (normalizedRole === "customer") {
        navigate("/customer-dashboard", { replace: true });
        return;
      }

      navigate("/provider-dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Login error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Login failed"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
            L
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue using LocalBizConnect
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}