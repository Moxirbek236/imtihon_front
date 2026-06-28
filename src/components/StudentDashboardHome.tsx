"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  MonetizationOn,
  Stars,
  EmojiEvents,
  AccessTime,
  Room,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function StudentDashboardHome() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axiosClient.get("/students/my/dashboard");
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard yuklanmadi", error);
      }
    }
    fetchDashboard();
  }, []);

  if (!data) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        Sizning umumiy natijalaringiz va joriy darslaringiz
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                <MonetizationOn sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                  Kumushlar (Coins)
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                  {data.coins}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563" }}>
                <Stars sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                  Umumiy XP
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                  {data.xp}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                  <EmojiEvents sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                    Bosqich {data.level}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>
                    Keyingi bosqichga {100 - data.progress} XP qoldi
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": { bgcolor: "#10b981" }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedule */}
      <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 2 }}>
        Joriy Guruhlarim
      </Typography>
      
      <Grid container spacing={2}>
        {data.schedule?.map((group: any) => (
          <Grid item xs={12} md={6} key={group.id}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 3,
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
              }}
            >
              <CardContent>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", mb: 1 }}>
                  {group.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 3, color: "#6b7280", fontSize: 14 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTime fontSize="small" />
                    {group.week_day.join(", ")} ({group.start_time})
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Room fontSize="small" />
                    {group.rooms?.name || "Noma'lum"}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {data.schedule?.length === 0 && (
          <Typography sx={{ color: "#6b7280", ml: 2 }}>Sizda hozircha faol guruhlar yo'q.</Typography>
        )}
      </Grid>
    </Box>
  );
}
