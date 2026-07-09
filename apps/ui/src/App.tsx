import React, { useState } from "react";
import { trpc } from "./trpc";

export default function App() {
  const [topic, setTopic] = useState("");
  const createMeeting = trpc.meeting.create.useMutation();

  const handleCreate = async () => {
    if (!topic) return;
    await createMeeting.mutateAsync({ topic });
    setTopic("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Carelineconnect
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meeting Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              placeholder="e.g. Weekly Consultation"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={createMeeting.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createMeeting.isPending ? "Creating..." : "Create Meeting Link"}
          </button>
        </div>

        {createMeeting.isSuccess && createMeeting.data && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800">Meeting Created!</h3>
            <div className="mt-2 text-sm text-green-700 break-all">
              <p>Join URL: {createMeeting.data.joinUrl}</p>
              <p>Meeting ID: {createMeeting.data.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
