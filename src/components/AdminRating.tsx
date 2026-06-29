"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

export default function AdminRating() {
  const [data, setData] = useState<any[] | null>(null);

  // Filters
  const [centerId, setCenterId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [period, setPeriod] = useState<string>("all");

  // Options
  const [centers, setCenters] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const resC = await axiosClient.get("/centers");
        if (resC.data?.success) setCenters(resC.data.data);

        const resB = await axiosClient.get("/branches");
        if (resB.data?.success) setBranches(resB.data.data);

        const resCr = await axiosClient.get("/courses");
        if (resCr.data?.success) setCourses(resCr.data.data);

        const resG = await axiosClient.get("/groups?page=1&limit=20");
        if (resG.data?.success) setGroups(resG.data.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchOptions();
  }, []);

  useEffect(() => {
    async function fetchRating() {
      setData(null);
      try {
        const queryParams = new URLSearchParams();
        if (centerId) queryParams.append("centerId", centerId);
        if (branchId) queryParams.append("branchId", branchId);
        if (courseId) queryParams.append("courseId", courseId);
        if (groupId) queryParams.append("groupId", groupId);
        if (period && period !== "all") queryParams.append("period", period);

        const res = await axiosClient.get(`/students/admin/rating?${queryParams.toString()}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Admin rating yuklanmadi", error);
      }
    }
    fetchRating();
  }, [centerId, branchId, courseId, groupId, period]);

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>
        Umumiy Reyting (Admin)
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
        Markaz, filial, kurs, guruh va muddat bo'yicha saralash
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Markaz</InputLabel>
          <Select value={centerId} label="Markaz" onChange={(e) => setCenterId(e.target.value)}>
            <MenuItem value="">Barchasi</MenuItem>
            {centers.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filial</InputLabel>
          <Select value={branchId} label="Filial" onChange={(e) => setBranchId(e.target.value)}>
            <MenuItem value="">Barchasi</MenuItem>
            {branches.map(b => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Kurs</InputLabel>
          <Select value={courseId} label="Kurs" onChange={(e) => setCourseId(e.target.value)}>
            <MenuItem value="">Barchasi</MenuItem>
            {courses.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Guruh</InputLabel>
          <Select value={groupId} label="Guruh" onChange={(e) => setGroupId(e.target.value)}>
            <MenuItem value="">Barchasi</MenuItem>
            {groups.map(g => (
              <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Muddat</InputLabel>
          <Select value={period} label="Muddat" onChange={(e) => setPeriod(e.target.value)}>
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
                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
                      <Avatar src={row.photo ? `https://seven-oy-crm-backned-1.onrender.com/file/${row.photo}` : ""} sx={{ width: 32, height: 32 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{row.full_name}</Typography>
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
