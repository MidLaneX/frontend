import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import Dashboard from "./Dashboard";

const OrganizationDetailPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const getUserId = (): string | null => {
    // First try URL params
    const userId = queryParams.get("userId");
    if (
      userId &&
      userId !== "null" &&
      userId !== "undefined" &&
      userId !== ""
    ) {
      return userId;
    }

    // Try to get userId from auth_tokens in localStorage
    try {
      const tokens = localStorage.getItem("auth_tokens");
      if (tokens) {
        const parsed = JSON.parse(tokens);
        const id = parsed.userId ?? parsed.user_id;
        if (id) {
          return typeof id === "number" ? String(id) : String(id);
        }
      }
    } catch (e) {
      console.warn("Failed to parse auth_tokens:", e);
    }

    // Try legacy userId from localStorage
    try {
      const legacyUserId = localStorage.getItem("userId");
      if (legacyUserId && legacyUserId !== "null") {
        return legacyUserId;
      }
    } catch (e) {
      console.warn("Failed to get legacy userId:", e);
    }

    return null;
  };

  const userId = getUserId();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("OrganizationDetailPage - orgId:", orgId, "userId:", userId);
    if (!orgId || !userId) {
      setError(
        "Organization ID or User ID missing. Please ensure you are properly logged in.",
      );
    } else {
      setError(null);
      // Store in localStorage for future use
      localStorage.setItem("orgId", orgId);
      if (userId !== "null" && userId !== "undefined") {
        localStorage.setItem("userId", userId);
      }
    }
  }, [orgId, userId]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Pass orgId and userId as numbers to Dashboard
  return (
    <Box sx={{ p: 3 }}>
      <Dashboard
        orgId={orgId ? Number(orgId) : undefined}
        userId={userId ? Number(userId) : undefined}
      />
    </Box>
  );
};

export default OrganizationDetailPage;
