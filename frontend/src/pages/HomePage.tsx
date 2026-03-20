import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          LocalBizConnect
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Connect customers with trusted local service providers. Book services,
          manage requests, and grow local businesses.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}