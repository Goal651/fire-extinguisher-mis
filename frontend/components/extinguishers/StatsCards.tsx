interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

interface Props {
  total: number;
  active: number;
  expired: number;
  police: number;
}

export default function StatsCards({ total, active, expired, police }: Props) {
  const cards: StatCard[] = [
    { title: "Total", value: total, icon: "🧯", color: "#2f2f2f", bg: "#f8f8f8" },
    { title: "Active", value: active, icon: "✅", color: "#2e7d32", bg: "#e8f5e9" },
    { title: "Expired", value: expired, icon: "⚠️", color: "#d32f2f", bg: "#ffeaea" },
    { title: "Police Notified", value: police, icon: "🚔", color: "#b71c1c", bg: "#fff0f0" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl p-4 sm:p-5 border flex flex-col gap-3"
          style={{
            backgroundColor: card.bg,
            borderColor: card.color + "22",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>
              {card.title}
            </span>
            <span className="text-lg leading-none">{card.icon}</span>
          </div>
          <p className="text-3xl font-bold leading-none" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
