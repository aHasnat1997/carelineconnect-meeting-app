import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { trpc } from "../trpc";
import MeetingRoom from "../MeetingRoom";
import ConfirmModal from "../components/ConfirmModal";

interface ActiveMeeting {
  meetingNumber: string;
  topic: string;
  displayName: string;
  role: 0 | 1;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<ActiveMeeting | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; topic: string } | null>(null);

  // Guard: redirect if not authenticated
  useEffect(() => {
    if (!sessionStorage.getItem("admin_authenticated")) {
      navigate("/admin");
    }
  }, [navigate]);

  const { data, isLoading, refetch } = trpc.meeting.list.useQuery({ page, limit: 10 });
  const createMeeting = trpc.meeting.create.useMutation({
    onSuccess: () => {
      refetch();
      setTopic("");
      toast.success("Meeting created!", { description: "Share the join link with your participants." });
    },
    onError: (err) => toast.error("Failed to create meeting", { description: err.message }),
  });
  const deleteMeeting = trpc.meeting.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteTarget(null);
      toast.success("Meeting deleted");
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast.error("Failed to delete meeting", { description: err.message });
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await createMeeting.mutateAsync({ topic }).catch(() => { });
  };

  const handleCopyLink = (meetingId: string) => {
    const link = `${window.location.origin}/join/${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied!", { description: link });
    });
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoin = (meeting: { zoomId: string; topic: string }) => {
    setActiveMeeting({
      meetingNumber: meeting.zoomId,
      topic: meeting.topic,
      displayName: "Admin",
      role: 1,
    });
  };

  const handleDelete = (meetingId: string, topic: string) => {
    setDeleteTarget({ id: meetingId, topic });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMeeting.mutate({ id: deleteTarget.id });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    navigate("/admin");
  };

  if (activeMeeting) {
    return (
      <MeetingRoom
        {...activeMeeting}
        onLeave={() => setActiveMeeting(null)}
      />
    );
  }

  const meetings = data?.meetings ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #0f172a 50%, #0d1535 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: "rgba(15,23,42,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <div>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.95rem" }}>CareLineConnect</span>
            <span style={{
              marginLeft: "0.5rem",
              background: "rgba(99,102,241,0.2)",
              color: "#a5b4fc",
              fontSize: "0.65rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid rgba(99,102,241,0.3)",
            }}>
              Admin
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Online</span>
          </div>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            style={{
              padding: "0.4rem 1rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Stats Row */}
        {/* <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Meetings", value: total, icon: "📹", color: "#6366f1" },
            { label: "This Page", value: meetings.length, icon: "📋", color: "#8b5cf6" },
            // { label: "Status", value: "Active", icon: "✅", color: "#22c55e" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <span style={{ fontSize: "1.75rem" }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Meetings</h1>
            <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "0.25rem" }}>Create, share, and manage your Zoom meetings</p>
          </div>
          {/* <button
            id="create-meeting-btn"
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: "0.65rem 1.25rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)";
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Meeting
          </button> */}
        </div>

        {/* Create Meeting Form */}
        <div className="animate-fade-in" style={{
          background: "rgba(99,102,241,0.07)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 16,
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}>
          <h3 style={{ color: "#a5b4fc", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", margin: "0 0 1rem 0" }}>
            📹 Create New Meeting
          </h3>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              id="meeting-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Meeting topic (e.g. Weekly Consultation)"
              style={{
                flex: 1,
                minWidth: 220,
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 10,
                padding: "0.7rem 1rem",
                color: "#f1f5f9",
                fontSize: "0.875rem",
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.3)"; e.target.style.boxShadow = "none"; }}
            />
            <button
              id="submit-create-meeting-btn"
              type="submit"
              disabled={createMeeting.isPending || !topic.trim()}
              style={{
                padding: "0.7rem 1.5rem",
                background: createMeeting.isPending || !topic.trim() ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: createMeeting.isPending || !topic.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "0.4rem",
                whiteSpace: "nowrap",
              }}
            >
              {createMeeting.isPending ? (
                <>
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Creating…
                </>
              ) : "Create Meeting"}
            </button>
            {/* <button
              type="button"
              onClick={() => { setShowCreate(false); setTopic(""); }}
              style={{
                padding: "0.7rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#94a3b8", fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button> */}
          </form>
          {createMeeting.isError && (
            <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.75rem" }}>
              ⚠️ {createMeeting.error.message}
            </p>
          )}
        </div>

        {/* Meetings Table */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          overflow: "hidden",
        }}>
          {/* Table Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px 160px 260px",
            padding: "0.875rem 1.5rem",
            background: "rgba(99,102,241,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Meeting Topic", "Zoom ID", "Created", "Actions"].map((h) => (
              <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{
                width: 36, height: 36, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }} />
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading meetings…</p>
            </div>
          ) : meetings.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <p style={{ color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>No meetings yet</p>
              <p style={{ color: "#475569", fontSize: "0.8rem" }}>Click "New Meeting" to create your first meeting</p>
            </div>
          ) : (
            meetings.map((meeting, idx) => (
              <MeetingRow
                key={meeting.id}
                meeting={meeting}
                idx={idx}
                copiedId={copiedId}
                onCopy={handleCopyLink}
                onJoin={handleJoin}
                onDelete={handleDelete}
                isDeleting={deleteMeeting.isPending && deleteMeeting.variables?.id === meeting.id}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 36, height: 36,
                  background: p === page ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.05)",
                  border: "1px solid " + (p === page ? "transparent" : "rgba(255,255,255,0.1)"),
                  borderRadius: 8, color: p === page ? "#fff" : "#64748b",
                  fontSize: "0.875rem", fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Meeting"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.topic}"? This will permanently remove the meeting and its join link.` : ""}
        confirmLabel={deleteMeeting.isPending ? "Deleting…" : "Yes, Delete"}
        cancelLabel="Keep Meeting"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Meeting Row Component ──────────────────────────────────────────────────

interface MeetingRowProps {
  meeting: {
    id: string;
    zoomId: string;
    topic: string;
    joinUrl: string;
    createdAt: Date | string;
  };
  idx: number;
  copiedId: string | null;
  onCopy: (id: string) => void;
  onJoin: (meeting: { zoomId: string; topic: string }) => void;
  onDelete: (id: string, topic: string) => void;
  isDeleting?: boolean;
}

function MeetingRow({ meeting, idx, copiedId, onCopy, onJoin, onDelete, isDeleting }: MeetingRowProps) {
  const [hovered, setHovered] = useState(false);
  const date = new Date(meeting.createdAt);

  return (
    <div
      className="animate-slide-in"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 180px 160px 260px",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: hovered ? "rgba(99,102,241,0.05)" : "transparent",
        transition: "background 0.2s",
        animationDelay: `${idx * 0.05}s`,
        alignItems: "center",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Topic */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, hsl(${(idx * 47 + 240) % 360}, 70%, 50%), hsl(${(idx * 47 + 280) % 360}, 70%, 60%))`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.9rem" }}>{meeting.topic}</div>
          <div style={{ color: "#475569", fontSize: "0.72rem", marginTop: "0.15rem", fontFamily: "monospace" }}>
            #{meeting.id.slice(-8)}
          </div>
        </div>
      </div>

      {/* Zoom ID */}
      <div>
        <code style={{
          background: "rgba(99,102,241,0.12)",
          color: "#a5b4fc",
          fontSize: "0.78rem",
          padding: "0.2rem 0.5rem",
          borderRadius: 6,
          border: "1px solid rgba(99,102,241,0.2)",
        }}>
          {meeting.zoomId}
        </code>
      </div>

      {/* Created Date */}
      <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
        <div>{date.toLocaleDateString()}</div>
        <div style={{ color: "#475569", fontSize: "0.72rem" }}>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          id={`copy-link-btn-${meeting.id}`}
          onClick={() => onCopy(meeting.id)}
          title="Copy join link"
          style={{
            padding: "0.4rem 0.75rem",
            background: copiedId === meeting.id ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
            border: "1px solid " + (copiedId === meeting.id ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"),
            borderRadius: 8,
            color: copiedId === meeting.id ? "#22c55e" : "#94a3b8",
            fontSize: "0.75rem", fontWeight: 500,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.2s",
          }}
        >
          {copiedId === meeting.id ? (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
        <button
          id={`join-meeting-btn-${meeting.id}`}
          onClick={() => onJoin({ zoomId: meeting.zoomId, topic: meeting.topic })}
          style={{
            padding: "0.4rem 0.75rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8))",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: "0.75rem", fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8))";
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Join
        </button>
        <button
          id={`delete-meeting-btn-${meeting.id}`}
          onClick={() => onDelete(meeting.id, meeting.topic)}
          disabled={isDeleting}
          title="Delete meeting"
          style={{
            padding: "0.4rem 0.65rem",
            background: isDeleting ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            color: "#f87171",
            fontSize: "0.75rem", fontWeight: 500,
            cursor: isDeleting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.2s",
            opacity: isDeleting ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.6)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)";
          }}
        >
          {isDeleting ? (
            <div style={{ width: 12, height: 12, border: "1.5px solid rgba(248,113,113,0.4)", borderTop: "1.5px solid #f87171", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          {isDeleting ? "" : "Delete"}
        </button>
      </div>
    </div>
  );
}
