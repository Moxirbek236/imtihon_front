import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ManagementPanel from "./ManagementPanel";
import DashboardHome from "./DashboardHome";
import RoomsPage from "./RoomsPage";
import CoursesPage from "./CoursesPage";
import TeachersPage from "./TeachersPage";
import GroupPage from "./GroupPage";
import GroupInner from "./GroupInner";
import StudentPage from "./StudentPage";
import GroupLesson from "./GroupLesson";
import HomeworkCreate from "./HomeworkCreate";
import HomeworkResults from "./HomeworkResults";
import HomeworkCheck from "./HomeworkCheck";
import ProfilePage from "./ProfilePage";
import StudentMyGroups from "./StudentMyGroups";
import StudentGroupLessons from "./StudentGroupLessons";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthorized(!!localStorage.getItem("token"));
  }, []);

  if (isAuthorized === null) {
    return null; // or a loading skeleton
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // Determine active sidebar item from URL
  let activeItem = "home";
  if (location.pathname.startsWith("/management") || location.pathname.includes("/course") || location.pathname.includes("/rooms")) {
    activeItem = "management";
  } else if (location.pathname.includes("/attendance")) {
    activeItem = "attendance";
  } else if (location.pathname.includes("/leads")) {
    activeItem = "leads";
  } else if (location.pathname.includes("/teachers")) {
    activeItem = "teachers";
  } else if (location.pathname.includes("/planned-groups")) {
    activeItem = "planned-groups";
  } else if (location.pathname.includes("/my-groups")) {
    activeItem = "my-groups";
  } else if (location.pathname.includes("/groups")) {
    activeItem = "groups";
  } else if (location.pathname.includes("/students")) {
    activeItem = "students";
  } else if (location.pathname.includes("/gifts")) {
    activeItem = "gifts";
  } else if (location.pathname.includes("/finance")) {
    activeItem = "finance";
  } else if (location.pathname.includes("/tests")) {
    activeItem = "tests";
  } else if (location.pathname.includes("/profile")) {
    activeItem = "profile";
  }

  const handleItemClick = (id) => {
    if (id === "management") {
      setManagementOpen((prev) => !prev);
      navigate("/management");
    } else {
      setManagementOpen(false);
      navigate(id === "home" ? "/dashboard" : `/dashboard/${id}`);
    }
  };

  // Close management panel when navigating to non-management pages
  useEffect(() => {
    if (!location.pathname.startsWith("/management")) {
      setManagementOpen(false);
    }
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleManagementNavigate = (label) => {
    if (label === "Xonalar") {
      navigate("/management/rooms");
    } else if (label === "Kurslar") {
      navigate("/management/course");
    } else {
      navigate("/management");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f3f4f6",
      }}
    >
      {/* Sidebar - full height from top to bottom */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      {/* Right side: Header + Content */}
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
            onClose={() => {
              setManagementOpen(false);
            }}
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
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="course" element={<CoursesPage />} />
              <Route path="courses" element={<CoursesPage />} />
              {/* Fallbacks for other sidebar tabs temporarily */}
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="planned-groups" element={<GroupPage statusFilter="planned" />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="my-groups" element={<StudentMyGroups />} />
              <Route path="my-groups/:groupId" element={<StudentGroupLessons />} />
              <Route path="groups" element={<GroupPage statusFilter="active" />} />
              <Route path="groups/:id" element={<GroupInner />} />
              <Route path="groups/:id/lesson/:lessonId" element={<GroupLesson />} />
              <Route path="groups/:id/homework/create" element={<HomeworkCreate />} />
              <Route path="groups/:id/homework/:homeworkId/results" element={<HomeworkResults />} />
              <Route path="groups/:id/homework/:homeworkId/result/:studentId" element={<HomeworkCheck />} />
              <Route path="students" element={<StudentPage />} />
              <Route path="attendance" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Davomad</Typography></Box>} />
              <Route path="leads" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Lidlar</Typography></Box>} />
              <Route path="gifts" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Sovg'alar</Typography></Box>} />
              <Route path="finance" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Moliya</Typography></Box>} />
              <Route path="tests" element={<Box sx={{ p: 3.5 }}><Typography sx={{ fontSize: 26, fontWeight: 700 }}>Test</Typography></Box>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
