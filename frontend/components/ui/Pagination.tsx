"use client";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex gap-2 justify-end items-center">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: page === 1 ? "#FBFBFB" : "#2F2F2F",
          color: page === 1 ? "#C5C5C5" : "#FFFFFF",
          border: "1px solid #D2D2D2",
        }}
      >
        Previous
      </button>

      <span className="px-4" style={{ color: "#666666" }}>
        {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: page === totalPages ? "#FBFBFB" : "#2F2F2F",
          color: page === totalPages ? "#C5C5C5" : "#FFFFFF",
          border: "1px solid #D2D2D2",
        }}
      >
        Next
      </button>
    </div>
  );
}
