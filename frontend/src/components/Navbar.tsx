import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Ticket,
  LayoutDashboard,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  ChevronDown,
  Inbox,
  Layers,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../utils/api";
import toast from "react-hot-toast";

type UserRole = "public" | "customer" | "agent" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  public: [
    { label: "Features", href: "/features", icon: <Zap size={18} /> },
    { label: "How it Works", href: "/how-it-works", icon: <HelpCircle size={18} /> },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "My Tickets", href: "/my-tickets", icon: <Ticket size={18} /> },
    { label: "Create Ticket", href: "/create-ticket", icon: <PlusCircle size={18} /> },
  ],
  agent: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Queue", href: "/queue", icon: <Inbox size={18} /> },
    { label: "My Tickets", href: "/my-tickets", icon: <Ticket size={18} /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Tickets", href: "/tickets", icon: <Layers size={18} /> },
    { label: "Agents", href: "/agents", icon: <Users size={18} /> },
    { label: "Analytics", href: "/analytics", icon: <BarChart3 size={18} /> },
  ],
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const role: UserRole = user?.role ?? "public";
  const navItems = NAV_CONFIG[role];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await api.delete("/api/users/sessions");
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Added `relative` so the absolute mobile menu anchors correctly */}
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ─── Brand ─── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Ticket className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            RelayDesk
          </span>
        </Link>

        {/* ─── Desktop Navigation ─── */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* ─── Right Side Actions ─── */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-white">
                  {getInitials(user.name)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize leading-tight">
                    {user.role}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden text-slate-400 transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5">
                  <div className="border-b border-slate-100 px-4 py-3 sm:hidden">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Users size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ═══ MOBILE OVERLAY MENU ═══ */}
        {/* Absolute: does NOT expand navbar height or push page content */}
        {mobileOpen && (
          <div className="absolute right-0 top-full z-50 w-1/2 h-[50vh] overflow-y-auto rounded-b-lg border border-t-0 border-slate-200 bg-white shadow-xl md:hidden">
            <div className="space-y-1 p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {!user && (
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <Link
                    to="/login"
                    className="rounded-md px-3 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}