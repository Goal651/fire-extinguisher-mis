import { ExtinguisherStatus } from "@/types";
import clsx from "clsx";

interface Props {
  status: ExtinguisherStatus;
  size?: "sm" | "md";
}

export default function Badge({ status, size = "md" }: Props) {
  const colors = {
    active: "bg-emerald-500 text-white",
    expired: "bg-red-500 text-white",
    reported: "bg-amber-500 text-black",
    police_notified: "bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wide",
        colors[status],
        sizes[size],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
