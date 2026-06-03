import { ExtinguisherStatus } from "@/types";

interface Props {
  status: ExtinguisherStatus;
}

export default function Badge({ status }: Props) {
  const colors = {
    active: { bg: "#4CAF50", text: "#FFFFFF" },
    expired: { bg: "#F44336", text: "#FFFFFF" },
    reported: { bg: "#FFC107", text: "#000000" },
    police_notified: { bg: "#D32F2F", text: "#FFFFFF" },
  };

  const color = colors[status];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}
