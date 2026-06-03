interface Props {
  total: number;
  active: number;
  expired: number;
  police: number;
}

export default function StatsCards({ total, active, expired, police }: Props) {
  const cards = [
    {
      title: "Total Extinguishers",
      value: total,
    },
    {
      title: "Active",
      value: active,
    },
    {
      title: "Expired",
      value: expired,
    },
    {
      title: "Police Notified",
      value: police,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card">
          <h3 style={{ color: "#666666" }}>{card.title}</h3>

          <p className="text-3xl font-bold mt-3" style={{ color: "#2F2F2F" }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
