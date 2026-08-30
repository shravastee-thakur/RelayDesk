import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Ticket, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(useAuthStore.getState().getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    setTimeLeft(300);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(timer);
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Auto-focus OTP input
  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => document.getElementById("otp")?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Session expired notification
  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      toast.error("Your session expired. Please sign in again.", {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });
    }
  }, [searchParams]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/users/otp-requests", {
        email,
        password,
      });
      console.log(res.data);
      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
        });

        setStep("otp");
        setOtp("");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (code.length !== 6) return;
    setLoading(true);

    try {
      const { data } = await api.post("/api/users/sessions", {
        email,
        otp: code,
      });
      console.log(data);

      useAuthStore.getState().setAuth(data.user, data.accessToken);
      toast.success(`Welcome back, ${data.user.name}!`, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });
      navigate(useAuthStore.getState().getDashboardPath(), { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid code";
      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      setOtp("");
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (value.length === 6) verifyOtp(value);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/api/users/otp-requests", { email, password });
      toast.success("New OTP sent", {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });
      setTimeLeft(300);
      setOtp("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to resend";
      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Ticket className="text-white" size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              RelayDesk
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === "credentials" ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in to continue managing your support workspace
                </p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                }}
                className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  Enter verification code
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  A code was sent to{" "}
                  <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col items-center">
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={loading || timeLeft === 0}
                    maxLength={6}
                    className="w-full bg-transparent text-center text-4xl font-bold tracking-[0.5em] text-slate-900 outline-none placeholder:text-slate-300 disabled:opacity-50"
                    placeholder="______"
                  />
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${(otp.length / 6) * 100}%` }}
                    />
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </div>
                )}

                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-slate-500">
                      Code expires in{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
