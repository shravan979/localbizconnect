import { useNavigate } from "react-router-dom";

type NavbarProps = {
  title: string;
};

type StoredUser = {
  name?: string;
  role?: string;
};

export default function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate();

  const user = localStorage.getItem("user");

  let parsedUser: StoredUser | null = null;

  if (user) {
    try {
      parsedUser = JSON.parse(user) as StoredUser;
    } catch {
      parsedUser = null;
    }
  }

  const role = parsedUser?.role || "unknown";
  const name = parsedUser?.name || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            L
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">LocalBizConnect</p>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {name}
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}