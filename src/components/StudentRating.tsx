"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  Chip,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function StudentRating() {
  const [data, setData] = useState<any[] | null>(null);
  const [filter, setFilter] = useState("group");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    async function fetchRating() {
      setData(null);
      try {
        const res = await axiosClient.get(`/students/my/rating?filter=${filter}&period=${period}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Rating yuklanmadi", error);
      }
    }
    fetchRating();
  }, [filter, period]);

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Reyting
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        Sizning o'zlashtirish va faollik bo'yicha o'rningiz
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="group">Guruh bo'yicha</MenuItem>
            <MenuItem value="branch">Filial bo'yicha</MenuItem>
            <MenuItem value="center">Barcha filiallar bo'yicha</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="weekly">Haftalik</MenuItem>
            <MenuItem value="monthly">Oylik</MenuItem>
            <MenuItem value="3month">3 oylik</MenuItem>
            <MenuItem value="all">Umumiy</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {!data ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#374151", width: 80 }}>O'rin</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Talaba</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Guruh</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#374151" }}>XP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row: any) => (
                <TableRow 
                  key={row.id} 
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 },
                    bgcolor: row.id === Number(localStorage.getItem("userId")) ? "#f0fdf4" : "transparent"
                  }}
                >
                  <TableCell>
                    {row.rank === 1 ? (
                      <EmojiEvents sx={{ color: "#eab308" }} />
                    ) : row.rank === 2 ? (
                      <EmojiEvents sx={{ color: "#9ca3af" }} />
                    ) : row.rank === 3 ? (
                      <EmojiEvents sx={{ color: "#b45309" }} />
                    ) : (
                      <Typography sx={{ fontWeight: 600, color: "#6b7280", ml: 1 }}>{row.rank}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={row.photo ? `http://localhost:3000/uploads/${row.photo}` : ""} sx={{ width: 32, height: 32 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{row.full_name}</Typography>
                      {row.id === Number(localStorage.getItem("userId")) && (
                        <Chip label="Siz" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{row.group_name}</TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 700, color: "#16a34a" }}>{row.xp}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#6b7280" }}>
                    Ma'lumot topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
