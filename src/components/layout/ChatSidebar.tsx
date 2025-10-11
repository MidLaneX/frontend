import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Paper, Typography, Drawer } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MinimizeIcon from '@mui/icons-material/Minimize';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ENV } from '@/config/env';

const MESSAGING_APP_URL = ENV.MESSAGING_APP_URL;

// Clean modern styling constants
const STYLES = {
  floatingButton: {
    position: "fixed" as const,
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    bgcolor: "#2563eb",
    color: "white",
    borderRadius: "50%",
    boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(16px)",
    zIndex: 1400,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      bgcolor: "#1d4ed8",
      transform: "translateY(-2px) scale(1.05)",
      boxShadow: "0 12px 40px rgba(37, 99, 235, 0.4)",
    },
  },
  sidebar: {
    width: 420,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: 420,
      boxSizing: "border-box",
      border: "none",
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.12)",
      background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      zIndex: 1300,
    },
  },
  chatWindow: {
    position: "fixed" as const,
    width: 380,
    height: 680,
    borderRadius: "16px",
    overflow: "hidden",
    bgcolor: "white",
    boxShadow: "0 24px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(24px)",
    zIndex: 1500,
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    cursor: "grab",
    minHeight: 60,
    "&:active": { cursor: "grabbing" },
  },
  iconButton: {
    color: "white",
    width: 32,
    height: 32,
    bgcolor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "rgba(255, 255, 255, 0.2)",
      transform: "scale(1.1)",
    },
  },
} as const;

interface ChatSidebarProps {
  defaultOpen?: boolean;
}

interface Position {
  x: number;
  y: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraggableMode, setIsDraggableMode] = useState(false);
  const [position, setPosition] = useState<Position>({
    x: window.innerWidth - 420,
    y: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Single iframe element that persists across mode changes to preserve conversation state
  const iframeElement = React.useMemo(
    () => (
      <iframe
        src={MESSAGING_APP_URL}
        title="Messaging App"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: isDraggableMode ? "0 0 16px 16px" : "0 0 0 12px",
        }}
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    ),
    [isDraggableMode]
  ); // Only recreate if draggable mode changes styling

  // Drag handlers (only for draggable mode)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggableMode) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !isDraggableMode) return;
      const newX = Math.max(
        0,
        Math.min(window.innerWidth - 380, e.clientX - dragOffset.x)
      );
      const newY = Math.max(
        0,
        Math.min(window.innerHeight - 520, e.clientY - dragOffset.y)
      );
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset, isDraggableMode]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners for dragging
  React.useEffect(() => {
    if (isDragging && isDraggableMode) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isDraggableMode, handleMouseMove, handleMouseUp]);

  // Action handlers
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleDraggableMode = () => {
    setIsDraggableMode(!isDraggableMode);
    if (isMinimized) setIsMinimized(false);
  };

  const handleOpenInNewTab = () => {
    window.open(MESSAGING_APP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating Chat Button */}
      {(!isOpen || isMinimized) && (
        <IconButton onClick={handleToggle} sx={STYLES.floatingButton}>
          <ChatIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* Draggable Chat Window */}
      {isOpen && !isMinimized && isDraggableMode && (
        <Paper
          sx={{
            ...STYLES.chatWindow,
            left: position.x,
            top: position.y,
            cursor: isDragging ? "grabbing" : "default",
            transform: isDragging ? "scale(1.02)" : "scale(1)",
            transition: isDragging ? "none" : "transform 0.2s ease",
          }}
        >
          {/* Draggable Window Header */}
          <Box sx={STYLES.header} onMouseDown={handleMouseDown}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DragIndicatorIcon sx={{ fontSize: 20, opacity: 0.8 }} />
              <ChatIcon sx={{ fontSize: 24 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  letterSpacing: 0.5,
                }}
              >
                Messages
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Back to Sidebar" arrow placement="top">
                <IconButton
                  onClick={handleDraggableMode}
                  sx={STYLES.iconButton}
                  size="small"
                >
                  <DragIndicatorIcon
                    sx={{ fontSize: 18, transform: "rotate(90deg)" }}
                  />
                </IconButton>
              </Tooltip>

              <Tooltip title="Minimize" arrow placement="top">
                <IconButton
                  onClick={handleMinimize}
                  sx={STYLES.iconButton}
                  size="small"
                >
                  <MinimizeIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Open in New Tab" arrow placement="top">
                <IconButton
                  onClick={handleOpenInNewTab}
                  sx={STYLES.iconButton}
                  size="small"
                >
                  <OpenInNewIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Draggable Window Iframe Container */}
          {/* Shared Iframe Container */}
          <Box
            sx={{
              height: 600,
              overflow: "hidden",
              bgcolor: "#f8fafc",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            {iframeElement}
          </Box>
        </Paper>
      )}

      {/* Sidebar Drawer Mode - Default */}
      <Drawer
        anchor="right"
        open={isOpen && !isMinimized && !isDraggableMode}
        onClose={handleToggle}
        variant="persistent"
        sx={{
          width: isOpen && !isMinimized && !isDraggableMode ? 420 : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 420,
            boxSizing: "border-box",
            top: 0,
            height: "100vh",
            border: "none",
            boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
            zIndex: 1400,
            borderRadius: "12px 0 0 12px",
            overflow: "hidden",
          },
        }}
      >
        {/* Sidebar Header */}
        <Box sx={STYLES.header}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ChatIcon sx={{ fontSize: 24 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                letterSpacing: 0.5,
              }}
            >
              Messages
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Minimize" arrow placement="top">
              <IconButton
                onClick={handleMinimize}
                sx={STYLES.iconButton}
                size="small"
              >
                <MinimizeIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Float Window" arrow placement="top">
              <IconButton
                onClick={handleDraggableMode}
                sx={STYLES.iconButton}
                size="small"
              >
                <DragIndicatorIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open in New Tab" arrow placement="top">
              <IconButton
                onClick={handleOpenInNewTab}
                sx={STYLES.iconButton}
                size="small"
              >
                <OpenInNewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Sidebar Iframe Container */}
        <Box
          sx={{
            flexGrow: 1,
            height: "calc(100vh - 72px)",
            position: "relative",
            overflow: "hidden",
            bgcolor: "#f8fafc",
            borderBottomLeftRadius: 12,
          }}
        >
          {iframeElement}
        </Box>
      </Drawer>
    </>
  );
};

export default ChatSidebar;
