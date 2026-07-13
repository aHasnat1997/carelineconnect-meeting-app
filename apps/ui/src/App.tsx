import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import JoinPage from "./pages/JoinPage";

export default function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "0.875rem",
            borderRadius: "12px",
          },
        }}
      />
      <Routes>
        {/* Root → redirect to admin login */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Public join link for users */}
        <Route path="/join/:meetingId" element={<JoinPage />} />

        {/* Catch-all → redirect home */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


