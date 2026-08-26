import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          This is your admin dashboard. Manage agents, view analytics, and
          oversee the system.
        </p>
      </div>
    </div>
  );
}
