import { Flame, CheckCircle, AlertTriangle, Siren } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

interface Props {
  total: number;
  active: number;
  expired: number;
  police: number;
}

export default function StatsCards({ total, active, expired, police }: Props) {
  const cards: StatCard[] = [
    {
      title: "Total",
      value: total,
      icon: <Flame size={16} strokeWidth={2} />,
      color: "#2f2f2f",
      bg: "#f8f8f8",
      border: "#e0e0e0",
    },
    {
      title: "Active",
      value: active,
      icon: <CheckCircle size={16} strokeWidth={2} />,
      color: "#2e7d32",
      bg: "#f0faf0",
      border: "#a5d6a7",
    },
    {
      title: "Expired",
      value: expired,
      icon: <AlertTriangle size={16} strokeWidth={2} />,
      color: "#d32f2f",
      bg: "#fff8f8",
      border: "#ffcdd2",
    },
    {
      title: "Police Notified",
      value: police,
      icon: <Siren size={16} strokeWidth={2} />,
      color: "#b71c1c",
      bg: "#fff0f0",
      border: "#ef9a9a",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl p-4 sm:p-5 border flex flex-col gap-3"
          style={{ backgroundColor: card.bg, borderColor: card.border }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: card.color }}
            >
              {card.title}
            </span>
            <span style={{ color: card.color }}>{card.icon}</span>
          </div>
          <p className="text-3xl font-bold leading-none" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
