import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({
  text = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-blue-600" />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}
