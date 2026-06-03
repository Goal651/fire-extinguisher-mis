"use client";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <p className="text-xs" style={{ color: "#999" }}>
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <PagBtn
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title="First page"
        >
          «
        </PagBtn>
        <PagBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="Previous page"
        >
          ‹
        </PagBtn>

        {/* Page window */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1),
          )
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
              acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 text-center text-sm"
                style={{ color: "#999" }}
              >
                …
              </span>
            ) : (
              <PagBtn
                key={p}
                onClick={() => onPageChange(p as number)}
                active={p === page}
              >
                {p}
              </PagBtn>
            ),
          )}

        <PagBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Next page"
        >
          ›
        </PagBtn>
        <PagBtn
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title="Last page"
        >
          »
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: active ? "#2f2f2f" : "transparent",
        color: active ? "#ffffff" : "#666666",
        border: active ? "1px solid #2f2f2f" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#f8f8f8";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "transparent";
      }}
    >
      {children}
    </button>
  );
}
