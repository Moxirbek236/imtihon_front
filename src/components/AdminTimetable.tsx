"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axios";

// Standard time slots for the CRM
const TIME_SLOTS = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00"
];

export default function AdminTimetable() {
  const { data: roomsRes, isLoading: loadingRooms } = useQuery({
    queryKey: ["rooms", "schedule"],
    queryFn: async () => {
      const res = await axiosClient.get("/rooms");
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: groupsRes, isLoading: loadingGroups } = useQuery({
    queryKey: ["groups", "schedule"],
    queryFn: async () => {
      const res = await axiosClient.get("/groups?limit=1000");
      return res.data;
    },
    staleTime: 60000,
  });

  const loading = loadingRooms || loadingGroups;
  const rooms = roomsRes?.data || [];
  const groups = groupsRes?.data || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Map groups by room and time
  const getGroupForSlot = (roomName: string, timeSlot: string) => {
    // Basic mapping logic: check if group belongs to room and its start_time matches
    return groups.filter(g => g.rooms === roomName && g.start_time?.startsWith(timeSlot));
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "white", borderRadius: 3, p: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1, color: "#111827" }}>
        Dars Jadvali
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 3 }}>
        Joriy barcha guruhlar soatlar va xonalar bo'yicha
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: "#f9fafb" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#4b5563", borderRight: "1px solid #e5e7eb", width: 100 }}>
                Xona / Vaqt
              </TableCell>
              {TIME_SLOTS.map(time => (
                <TableCell key={time} align="center" sx={{ fontWeight: 700, color: "#4b5563", minWidth: 140 }}>
                  {time}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map(room => (
              <TableRow key={room.id}>
                <TableCell sx={{ fontWeight: 600, borderRight: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
                  {room.name}
                  <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
                    Sig'im: {room.capacity}
                  </Typography>
                </TableCell>
                {TIME_SLOTS.map(time => {
                  const slotGroups = getGroupForSlot(room.name, time);
                  return (
                    <TableCell key={`${room.id}-${time}`} align="center" sx={{ p: 1, verticalAlign: "top" }}>
                      {slotGroups.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {slotGroups.map(g => (
                            <Tooltip 
                              key={g.id}
                              title={`${g.week_day?.join(", ")} | O'qituvchi: ${g.teachers?.[0]?.full_name || 'Yo\'q'}`} 
                              arrow
                            >
                              <Box 
                                sx={{ 
                                  bgcolor: g.status === 'active' ? "#f0fdfa" : "#fef2f2", 
                                  border: `1px solid ${g.status === 'active' ? "#ccfbf1" : "#fee2e2"}`,
                                  p: 1, 
                                  borderRadius: 1.5,
                                  textAlign: "left",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  "&:hover": { boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }
                                }}
                              >
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f766e" }}>
                                  {g.name}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "#0d9488", mt: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {g.course?.name}
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                  <Typography sx={{ fontSize: 10, color: "#64748b" }}>
                                    {g.student_count} / {g.max_students}
                                  </Typography>
                                  <Chip label={g.status === 'active' ? 'Faol' : 'Tugagan'} size="small" sx={{ height: 16, fontSize: 9, bgcolor: g.status === 'active' ? "#14b8a6" : "#f87171", color: "white" }} />
                                </Box>
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: "#cbd5e1" }}>Bo'sh</Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={TIME_SLOTS.length + 1} align="center" sx={{ py: 4 }}>
                  Xonalar mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
