import React, { useEffect, useRef, useState } from "react";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { trpc } from "./trpc";

interface Props {
  meetingNumber: string;
  topic: string;
  displayName: string;
  onLeave: () => void;
}

export default function MeetingRoom({ meetingNumber, topic, displayName, onLeave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<ReturnType<typeof ZoomMtgEmbedded.createClient> | null>(null);
  const [status, setStatus] = useState<"loading" | "joined" | "error">("loading");
  const [error, setError] = useState("");

  const getSignature = trpc.meeting.getSignature.useMutation();

  useEffect(() => {
    if (!containerRef.current) return;

    const client = ZoomMtgEmbedded.createClient();
    clientRef.current = client;

    client.init({
      zoomAppRoot: containerRef.current,
      language: "en-US",
      customize: {
        video: {
          isResizable: true,
          viewSizes: { default: { width: 900, height: 500 } },
        },
        toolbar: {
          buttons: [
            { text: "Leave", className: "leave-btn", onClick: () => handleLeave() },
          ],
        },
      },
    });

    getSignature.mutateAsync({ meetingNumber, role: 0 }).then(({ signature, sdkKey }) => {
      client.join({
        sdkKey,
        signature,
        meetingNumber,
        userName: displayName,
      }).then(() => setStatus("joined"))
        .catch((e: Error) => { setError(e.message); setStatus("error"); });
    }).catch((e: Error) => { setError(e.message); setStatus("error"); });

    return () => {
      client.leaveMeeting().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = () => {
    clientRef.current?.leaveMeeting().catch(() => {});
    onLeave();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-semibold text-sm">{topic}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs">{displayName}</span>
          <button
            onClick={handleLeave}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Zoom embed container */}
      <div className="flex-1 relative flex items-center justify-center">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-gray-950">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Joining meeting…</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-gray-950">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={onLeave} className="text-blue-400 text-sm underline">Go back</button>
          </div>
        )}
        <div ref={containerRef} id="zoom-meeting-container" className="w-full h-full" />
      </div>
    </div>
  );
}
