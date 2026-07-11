import React, { useState } from "react";
import { trpc } from "./trpc";
import MeetingRoom from "./MeetingRoom";

type View = "lobby" | "meeting";
type Tab = "create" | "join";

export default function App() {
  const [tab, setTab] = useState<Tab>("create");
  const [view, setView] = useState<View>("lobby");

  // Create form
  const [topic, setTopic] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Join form
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");

  // Active meeting state
  const [activeMeeting, setActiveMeeting] = useState<{
    meetingNumber: string;
    topic: string;
    displayName: string;
  } | null>(null);

  const createMeeting = trpc.meeting.create.useMutation();
  const getMeeting = trpc.meeting.getById.useQuery(
    { meetingId: joinMeetingId, displayName: joinDisplayName },
    { enabled: false }
  );

  const handleCreate = async () => {
    if (!topic.trim() || !displayName.trim()) return;
    const meeting = await createMeeting.mutateAsync({ topic });
    setActiveMeeting({ meetingNumber: meeting.zoomId, topic: meeting.topic, displayName });
    setView("meeting");
  };

  const handleJoin = async () => {
    if (!joinMeetingId.trim() || !joinDisplayName.trim()) return;
    const result = await getMeeting.refetch();
    if (result.data) {
      setActiveMeeting({
        meetingNumber: result.data.zoomId,
        topic: result.data.topic,
        displayName: joinDisplayName,
      });
      setView("meeting");
    }
  };

  if (view === "meeting" && activeMeeting) {
    return (
      <MeetingRoom
        {...activeMeeting}
        onLeave={() => {
          setActiveMeeting(null);
          setView("lobby");
          setTopic("");
          setDisplayName("");
          setJoinMeetingId("");
          setJoinDisplayName("");
          createMeeting.reset();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">CareLineConnect</h1>
          <p className="text-gray-400 text-sm mt-1">Secure video meetings</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(["create", "join"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "text-white border-b-2 border-blue-500 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t === "create" ? "New Meeting" : "Join Meeting"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {tab === "create" ? (
              <>
                <Field
                  label="Your Name"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="e.g. Dr. Smith"
                />
                <Field
                  label="Meeting Topic"
                  value={topic}
                  onChange={setTopic}
                  placeholder="e.g. Weekly Consultation"
                />
                <button
                  onClick={handleCreate}
                  disabled={createMeeting.isPending || !topic.trim() || !displayName.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {createMeeting.isPending ? "Creating…" : "Start Meeting"}
                </button>
                {createMeeting.isError && (
                  <p className="text-red-400 text-xs text-center">{createMeeting.error.message}</p>
                )}
              </>
            ) : (
              <>
                <Field
                  label="Your Name"
                  value={joinDisplayName}
                  onChange={setJoinDisplayName}
                  placeholder="e.g. Jane Doe"
                />
                <Field
                  label="Meeting ID"
                  value={joinMeetingId}
                  onChange={setJoinMeetingId}
                  placeholder="Paste meeting ID"
                />
                <button
                  onClick={handleJoin}
                  disabled={getMeeting.isFetching || !joinMeetingId.trim() || !joinDisplayName.trim()}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {getMeeting.isFetching ? "Joining…" : "Join Meeting"}
                </button>
                {getMeeting.isError && (
                  <p className="text-red-400 text-xs text-center">{getMeeting.error.message}</p>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by Zoom · End-to-end encrypted
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
    </div>
  );
}
