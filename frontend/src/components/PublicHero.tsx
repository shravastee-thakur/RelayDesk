import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Zap,
  Clock,
  Users,
  AlertCircle,
  ShieldAlert,
  CircleDot,
  CheckCircle2,
} from "lucide-react";

export default function PublicHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ─── Left Content ─────────────────────────────────────── */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Zap size={14} />
              Real-Time Support Queue
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Connect customers with the right support agent{" "}
              <span className="text-blue-600">instantly</span>.
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg leading-8 text-slate-600">
              RelayDesk helps support teams manage incoming requests with{" "}
              <span className="font-semibold text-slate-900">
                intelligent ticket prioritization
              </span>
              ,{" "}
              <span className="font-semibold text-slate-900">
                real-time updates
              </span>
              , and streamlined agent workflows. No more lost tickets. No more
              waiting in the dark.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <Play size={18} className="text-blue-600" />
                View Demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Real-time queue</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Smart prioritization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Live agent status</span>
              </div>
            </div>
          </div>

          {/* ─── Right Visual: Live Queue Preview ───────────────── */}
          <div className="relative lg:ml-auto">
            {/* Decorative blur blobs */}
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100 opacity-50 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-slate-100 opacity-50 blur-3xl" />

            {/* Dashboard Card */}
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Support Queue
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-emerald-600">
                    Live
                  </span>
                </div>
              </div>

              {/* Queue List */}
              <div className="px-2 py-3">
                {/* Ticket 1 - URGENT */}
                <div className="m-2 flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50/50 p-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        Urgent
                      </span>
                      <span className="text-xs text-slate-400">2 min ago</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Payment failure at checkout
                    </p>
                    <p className="text-xs text-slate-500">
                      Customer:{" "}
                      <span className="font-medium text-slate-700">
                        Sarah Mitchell
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ticket 2 - HIGH */}
                <div className="m-2 flex items-start gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 p-3">
                  <ShieldAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        High
                      </span>
                      <span className="text-xs text-slate-400">5 min ago</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Account locked after password reset
                    </p>
                    <p className="text-xs text-slate-500">
                      Customer:{" "}
                      <span className="font-medium text-slate-700">
                        Mike Chen
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ticket 3 - MEDIUM */}
                <div className="m-2 flex items-start gap-3 rounded-lg border-l-4 border-blue-400 bg-blue-50/30 p-3">
                  <CircleDot
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Medium
                      </span>
                      <span className="text-xs text-slate-400">12 min ago</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Request for invoice copy
                    </p>
                    <p className="text-xs text-slate-500">
                      Customer:{" "}
                      <span className="font-medium text-slate-700">
                        James Wilson
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Stats */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <Users size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Agents Online</p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-slate-900">
                        5 Active
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg. Response</p>
                    <p className="text-sm font-bold text-slate-900">2 min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating agent card */}
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  JD
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    John Doe
                  </p>
                  <p className="text-xs text-slate-500">
                    Agent • Resolving #1024
                  </p>
                </div>
                <span className="ml-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
