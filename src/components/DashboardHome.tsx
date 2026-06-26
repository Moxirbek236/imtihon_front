"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  School,
  Group,
  Person,
  MenuBook,
  Room,
  AssignmentTurnedIn,
  ExpandMore,
  FiberManualRecord,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 3,
        mb: 1.5,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 2px 12px rgba(124,58,237,0.08)" },
      }}
    >
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "#f9fafb" },
          transition: "background 0.15s",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{title}</Typography>
        <IconButton
          size="small"
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            color: "#6b7280",
          }}
        >
          <ExpandMore />
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2.5, color: "#6b7280", fontSize: 14 }}>
          {children}
        </Box>
      </Collapse>
    </Card>
  );
}

export default function DashboardHome() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axiosClient.get("/dashboard");
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard datasi yuklanmadi", error);
      }
    }
    fetchDashboard();
  }, []);

  const stats = [
    { label: "O'quvchilar", value: data?.students || 0, icon: <School />, color: "#7c3aed" },
    { label: "Guruhlar", value: data?.groups || 0, icon: <Group />, color: "#7c3aed" },
    { label: "O'qituvchilar", value: data?.teachers || 0, icon: <Person />, color: "#7c3aed" },
    { label: "Kurslar", value: data?.courses || 0, icon: <MenuBook />, color: "#7c3aed" },
    { label: "Xonalar", value: data?.rooms || 0, icon: <Room />, color: "#7c3aed" },
    { label: "Davomat", value: `${data?.attendanceRate || 0}%`, icon: <AssignmentTurnedIn />, color: "#7c3aed" },
  ];

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        Markaz faoliyati bo'yicha umumiy statistika
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.8, mb: 3, width: "100%" }}>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            elevation={0}
            sx={{
              flex: "1 1 calc(16.66% - 1.8rem)",
              minWidth: "140px",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              transition: "box-shadow 0.2s, transform 0.2s",
              "&:hover": {
                boxShadow: "0 4px 20px rgba(124,58,237,0.12)",
                transform: "translateY(-2px)",
              },
              cursor: "default",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.8,
                py: "18px !important",
                px: 2,
              }}
            >
              <Box sx={{ color: stat.color, fontSize: 22 }}>{stat.icon}</Box>
              <Typography
                sx={{ fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.3 }}
              >
                {stat.label}
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Accordion Sections */}
      <AccordionSection title="So'nggi Faolliklar">
        {data?.recentActivity?.length > 0 ? (
          <List>
            {data.recentActivity.map((activity, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <FiberManualRecord sx={{ fontSize: 12, color: activity.dot || "#7c3aed" }} />
                </ListItemIcon>
                <ListItemText 
                  primary={activity.text} 
                  secondary={new Date(activity.date).toLocaleString('ru-RU')} 
                  primaryTypographyProps={{ fontSize: 14, color: "#111827" }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Hozircha faolliklar yo'q.</Typography>
        )}
      </AccordionSection>

      <AccordionSection title="Boshqa Ko'rsatkichlar">
        <List>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText primary={`Uyga vazifalar bajarilishi: ${data?.homeworkCompletionRate || 0}%`} />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText primary={`Kurslarning to'liqligi: ${data?.courseOccupancyRate || 0}%`} />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText primary={`Faol o'quvchilar ulushi: ${data?.activeStudentsRate || 0}%`} />
          </ListItem>
        </List>
      </AccordionSection>
    </Box>
  );
}
