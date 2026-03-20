import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";

type UserRole = "customer" | "service_provider" | null;

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  businessName: string;
  category: string;
  yearsOfExperience: string;
  description: string;
};

type SignupResponse = {
  token: string;
  user: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    category?: string;
  };
};

export default function Signup() {
  const navigate = useNavigate();

  const savedRole = localStorage.getItem("signupRole") as UserRole | null;

  const [step, setStep] = useState<"role" | "form">(savedRole ? "form" : "role");
  const [role, setRole] = useState<UserRole>(savedRole || null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    businessName: "",
    category: "",
    yearsOfExperience: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem("signupRole", selectedRole || "");
    setStep("form");
  };

  const handleBackToRole = () => {
    setStep("role");
    setRole(null);
    localStorage.removeItem("signupRole");
    setError("");
  };

  const handleInputChange = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role,
        businessName: role === "service_provider" ? formData.businessName : "",
        category: role === "service_provider" ? formData.category : "",
        yearsOfExperience:
          role === "service_provider" ? formData.yearsOfExperience : "",
        description: role === "service_provider" ? formData.description : "",
      };

      const res = await axios.post<SignupResponse>(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        payload
      );

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid signup response");
      }

      const normalizedRole =
        user.role?.toLowerCase() === "service_provider"
          ? "provider"
          : user.role?.toLowerCase();

      const normalizedUser = {
        ...user,
        role: normalizedRole,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.removeItem("signupRole");

      if (normalizedRole === "customer") {
        navigate("/customer-dashboard");
      } else if (normalizedRole === "provider") {
        navigate("/provider-dashboard");
      } else {
        setError("Invalid user role received after signup.");
      }
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Signup failed. Please try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isCustomer = role === "customer";

  if (step === "role") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <span className="text-xl font-bold text-white">L</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              Join LocalBizConnect
            </h1>
            <p className="text-slate-500">
              Choose how you&apos;d like to get started
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleRoleSelect("customer")}
              className="group rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 transition-transform group-hover:scale-110">
                🔍
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Find Services
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Browse and book local service providers in your area
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>✓ Search nearby providers</li>
                <li>✓ Book services instantly</li>
                <li>✓ Track booking status</li>
              </ul>
              <div className="mt-6 font-medium text-blue-600">
                Continue as Customer →
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("service_provider")}
              className="group rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all duration-300 hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-600 transition-transform group-hover:scale-110">
                💼
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Offer Services
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Grow your business and connect with customers
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>✓ Create business profile</li>
                <li>✓ Receive bookings</li>
                <li>✓ Manage requests easily</li>
              </ul>
              <div className="mt-6 font-medium text-emerald-600">
                Continue as Provider →
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={handleBackToRole}
            className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ← Back
          </button>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            {isCustomer ? "Create Your Account" : "Start Your Business"}
          </h1>
          <p className="text-slate-500">
            {isCustomer
              ? "Join LocalBizConnect and book trusted local services"
              : "Grow your business with LocalBizConnect"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="123 Main Street, City"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isCustomer && (
              <>
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    Business Information
                  </h3>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    placeholder="Your Business Name"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Service Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="tailor">Tailor</option>
                      <option value="mechanic">Mechanic</option>
                      <option value="salon">Salon</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="60"
                      placeholder="5"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Business Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about your services..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-slate-600">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-blue-500 hover:text-blue-600"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}