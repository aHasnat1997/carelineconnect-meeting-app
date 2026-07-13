import React, { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when modal opens; trap Escape to cancel
  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "1.75rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: danger ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
          border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.25rem",
        }}>
          {danger ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={danger ? "#f87171" : "#a5b4fc"} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2
          id="confirm-modal-title"
          style={{
            color: "#f1f5f9",
            fontSize: "1.05rem",
            fontWeight: 700,
            margin: "0 0 0.5rem 0",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p style={{
          color: "#94a3b8",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          margin: "0 0 1.75rem 0",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          {description}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.6rem 1.25rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#94a3b8",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{
              padding: "0.6rem 1.25rem",
              background: danger
                ? "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: danger
                ? "0 4px 14px rgba(239,68,68,0.35)"
                : "0 4px 14px rgba(99,102,241,0.35)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = danger
                ? "0 8px 20px rgba(239,68,68,0.5)"
                : "0 8px 20px rgba(99,102,241,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = danger
                ? "0 4px 14px rgba(239,68,68,0.35)"
                : "0 4px 14px rgba(99,102,241,0.35)";
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
