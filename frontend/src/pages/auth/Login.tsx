// pages/LoginPage.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Ticket, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

type LoginStep = "credentials" | "otp";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, isAuthenticated, getDashboardPath } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardPath]);

  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Verify credentials — backend sends OTP
      await api.post("/auth/login", { email, password });
      setStep("otp");
      setTimeLeft(300);
      setOtp("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = useCallback(
    async (code: string) => {
      if (code.length !== 6) return;
      setLoading(true);
      setError(null);

      try {
        // Step 2: Verify OTP — backend returns tokens + user
        const { data } = await api.post("/auth/verify-otp", {
          email,
          otp: code,
        });

        setAuth(data.user, data.accessToken, data.refreshToken);

        // Role-based redirect
        const dashboard = useAuthStore.getState().getDashboardPath();
        navigate(dashboard, { replace: true });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Invalid code. Please try again.",
        );
        setOtp("");
        setLoading(false);
      }
    },
    [email, navigate, setAuth],
  );

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError(null);

    if (value.length === 6) {
      verifyOtp(value);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      setTimeLeft(300);
      setOtp("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const sessionExpired = searchParams.get("session") === "expired";

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

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {sessionExpired && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle size={16} />
              Your session expired. Please sign in again.
            </div>
          )}

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

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

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

              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep("credentials");
                  setError(null);
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
                {/* Single OTP Input */}
                <div className="flex flex-col items-center">
                  <input
                    ref={otpInputRef}
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

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

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

        {/* Footer */}
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
