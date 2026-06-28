"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ManagementPanel from "../components/ManagementPanel";

import axiosClient from "../api/axios";
import { LanguageProvider } from "../context/LanguageContext";
import { NotificationProvider } from "../context/NotificationContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname === "/";

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      axiosClient.get("/health").catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (isPublicRoute) {
      setRoleChecked(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const role = localStorage.getItem("role");

    if (role === "STUDENT") {
      const allowedStudentRoutes = ["/dashboard/my-groups", "/dashboard/metrics", "/dashboard/shop", "/dashboard/settings"];
      const isAllowed = allowedStudentRoutes.some(route => 
        pathname === route || pathname.startsWith(route + "/")
      );
      if (!isAllowed) {
        router.replace("/dashboard/my-groups");
        return;
      }
    } else if (role === "TEACHER") {
      const allowedTeacherRoutes = ["/dashboard/groups", "/dashboard/my-groups", "/dashboard/students", "/dashboard/settings", "/dashboard/rating"];
      const isAllowed = allowedTeacherRoutes.some(route => 
        pathname === route || pathname.startsWith(route + "/")
      );
      if (!isAllowed) {
        router.replace("/dashboard/my-groups");
        return;
      }
    }
    
    setRoleChecked(true);
  }, [isPublicRoute, pathname, router]);

  useEffect(() => {
    if (!pathname.startsWith("/management")) {
      setManagementOpen(false);
    }
  }, [pathname]);

  if (!mounted || !roleChecked) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      </Box>
    );
  }

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
  } else if (pathname.includes("/metrics")) {
    activeItem = "metrics";
  } else if (pathname.includes("/rating")) {
    activeItem = "rating";
  } else if (pathname.includes("/shop")) {
    activeItem = "shop";
  } else if (pathname.includes("/settings")) {
    activeItem = "settings";
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



  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleManagementNavigate = (label: string) => {
    if (label === "Xonalar") {
      router.push("/management/rooms");
    } else if (label === "Kurslar") {
      router.push("/management/course");
    } else if (label === "Coin") {
      router.push("/dashboard/rating");
    } else if (label === "Hodimlar" || label === "Xodimlar") {
      router.push("/management/teachers");
    } else if (label === "Filiallar") {
      router.push("/management/branches");
    } else if (label === "Xabar Yuborish") {
      router.push("/management/messages");
    } else {
      router.push("/management");
    }
  };

  // Don't show layout on login or forgot-password
  if (isPublicRoute) {
    return (
      <LanguageProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </LanguageProvider>
  );
}
