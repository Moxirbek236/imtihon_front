"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ManagementPanel from "../components/ManagementPanel";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname === "/";

  useEffect(() => {
    if (isPublicRoute) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [isPublicRoute, pathname, router]);

  // Determine active sidebar item from URL
  let activeItem = "home";
  if (pathname.startsWith("/management") || pathname.includes("/course") || pathname.includes("/rooms")) {
    activeItem = "management";
  } else if (pathname.includes("/attendance")) {
    activeItem = "attendance";
  } else if (pathname.includes("/leads")) {
    activeItem = "leads";
  } else if (pathname.includes("/teachers")) {
    activeItem = "teachers";
  } else if (pathname.includes("/planned-groups")) {
    activeItem = "planned-groups";
  } else if (pathname.includes("/my-groups")) {
    activeItem = "my-groups";
  } else if (pathname.includes("/groups")) {
    activeItem = "groups";
  } else if (pathname.includes("/students")) {
    activeItem = "students";
  } else if (pathname.includes("/gifts")) {
    activeItem = "gifts";
  } else if (pathname.includes("/finance")) {
    activeItem = "finance";
  } else if (pathname.includes("/tests")) {
    activeItem = "tests";
  } else if (pathname.includes("/profile")) {
    activeItem = "profile";
  }

  const handleItemClick = (id: string) => {
    if (id === "management") {
      setManagementOpen((prev) => !prev);
      router.push("/management");
    } else {
      setManagementOpen(false);
      router.push(id === "home" ? "/dashboard" : `/dashboard/${id}`);
    }
  };

  // Close management panel when navigating to non-management pages
  useEffect(() => {
    if (!pathname.startsWith("/management")) {
      setManagementOpen(false);
    }
  }, [pathname]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleManagementNavigate = (label: string) => {
    if (label === "Xonalar") {
      router.push("/management/rooms");
    } else if (label === "Kurslar") {
      router.push("/management/course");
    } else {
      router.push("/management");
    }
  };

  // Don't show layout on login or forgot-password
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f3f4f6",
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Header darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          <ManagementPanel
            open={managementOpen}
            onClose={() => setManagementOpen(false)}
            sidebarCollapsed={sidebarCollapsed}
            onNavigate={handleManagementNavigate}
          />

          <Box
            component="main"
            sx={{
              flex: 1,
              overflowY: "auto",
              bgcolor: "#f3f4f6",
              transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
