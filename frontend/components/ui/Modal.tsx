"use client";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  message,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className="p-6 rounded-lg w-100 shadow-xl"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "#2F2F2F" }}>
          {title}
        </h2>

        <p className="mb-6" style={{ color: "#666666" }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg transition"
            style={{
              backgroundColor: "#FBFBFB",
              color: "#2F2F2F",
              border: "1px solid #D2D2D2",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg transition"
            style={{
              backgroundColor: "#D32F2F",
              color: "#FFFFFF",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
