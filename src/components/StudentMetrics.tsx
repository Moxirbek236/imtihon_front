"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from "@mui/material";
import axiosClient from "../api/axios";
import { EmojiEvents } from "@mui/icons-material";

export default function StudentMetrics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axiosClient.get("/students/my/stats");
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Stats yuklanmadi", error);
      }
    }
    fetchStats();
  }, []);

  if (!data) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Ko'rsatkichlar
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        Sizning ta'limdagi ko'rsatkichlaringiz va yig'ilgan XP lar tarixi
      </Typography>

      {/* Top Banner */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: "linear-gradient(to right, #0f2c59, #1a4b8c)",
          color: "white",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, p: "24px !important" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EmojiEvents sx={{ fontSize: 40, color: "#fde047" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, opacity: 0.9 }}>Jami yig'ilgan XP</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 800 }}>{data.totalXP}</Typography>
            <Typography sx={{ fontSize: 14, opacity: 0.8, mt: 0.5 }}>
              Bosqich {data.level}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 2 }}>
        XP yig'ish tarixi (yo'nalishlar bo'yicha)
      </Typography>
      
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f9fafb" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Yo'nalish nomi</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="right">Olingan XP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.breakdown?.map((row: any, idx: number) => (
              <TableRow key={idx} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#16a34a" }}>
                  +{row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
