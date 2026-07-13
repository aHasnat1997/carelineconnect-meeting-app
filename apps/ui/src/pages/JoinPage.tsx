import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../trpc";
import MeetingRoom from "../MeetingRoom";

export default function JoinPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [displayName, setDisplayName] = useState("");
  const [joining, setJoining] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<{
    meetingNumber: string;
    topic: string;
    displayName: string;
    role: 0 | 1;
  } | null>(null);

  const { data: meeting, isLoading, isError, error } = trpc.meeting.getByDbId.useQuery(
    { id: meetingId ?? "" },
    { enabled: !!meetingId, retry: false }
  );

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting || !displayName.trim()) return;
    setJoining(true);
    setActiveMeeting({
      meetingNumber: meeting.zoomId,
      topic: meeting.topic,
      displayName: displayName.trim(),
      role: 0,
    });
  };

  if (activeMeeting) {
    return (
      <MeetingRoom
        {...activeMeeting}
        onLeave={() => { setActiveMeeting(null); setJoining(false); }}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1240 40%, #0d1b40 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: "20%", right: "15%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", left: "10%",
        width: 250, height: 250,
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div className="animate-fade-in" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="animate-float" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            marginBottom: "1rem",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: 0 }}>
            CareLineConnect
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "0.375rem" }}>
            You've been invited to a meeting
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
        }}>
          {/* Meeting info */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{
                width: 32, height: 32, border: "2.5px solid rgba(99,102,241,0.3)", borderTop: "2.5px solid #6366f1",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }} />
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading meeting details…</p>
            </div>
          ) : isError ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>❌</div>
              <p style={{ color: "#f87171", fontWeight: 600, marginBottom: "0.5rem" }}>Meeting Not Found</p>
              <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {error?.message || "This meeting link may have expired or is invalid."}
              </p>
            </div>
          ) : meeting ? (
            <>
              {/* Meeting badge */}
              <div style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 14,
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex", alignItems: "center", gap: "0.875rem",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                    Meeting
                  </div>
                  <div style={{
                    color: "#f1f5f9", fontWeight: 700, fontSize: "1rem",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {meeting.topic}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
                    <span style={{ color: "#22c55e", fontSize: "0.72rem" }}>Live</span>
                  </div>
                </div>
              </div>

              {/* Name input */}
              <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{
                    display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8",
                    marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    Your Display Name
                  </label>
                  <input
                    id="join-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    style={{
                      width: "100%",
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: 12,
                      padding: "0.75rem 1rem",
                      color: "#f1f5f9",
                      fontSize: "0.9rem",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(99,102,241,0.7)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(99,102,241,0.25)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <button
                  id="join-meeting-submit-btn"
                  type="submit"
                  disabled={!displayName.trim() || joining}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    background: displayName.trim() && !joining
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(99,102,241,0.3)",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: displayName.trim() && !joining ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    boxShadow: displayName.trim() ? "0 4px 20px rgba(99,102,241,0.4)" : "none",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    if (displayName.trim() && !joining) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.55)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = displayName.trim() ? "0 4px 20px rgba(99,102,241,0.4)" : "none";
                  }}
                >
                  {joining ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Joining Meeting…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Join Meeting
                    </>
                  )}
                </button>
              </form>
            </>
          ) : null}
        </div>

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: "0.75rem", marginTop: "1.5rem" }}>
          Powered by Zoom · End-to-end encrypted
        </p>
      </div>
    </div>
  );
}
