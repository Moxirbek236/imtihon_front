"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "../api/axios";

// Helper to convert time strings like "10:30" to minutes since 00:00
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const TIMELINE_START = 10 * 60; // 10:00
const TIMELINE_END = 17 * 60;   // 17:00
const TOTAL_MINUTES = TIMELINE_END - TIMELINE_START;

const getPositionStyles = (startTimeStr: string, durationMinut: number) => {
  const startMins = timeToMinutes(startTimeStr);
  
  const offsetMins = Math.max(0, startMins - TIMELINE_START);
  const left = (offsetMins / TOTAL_MINUTES) * 100;
  
  const visibleDuration = startMins < TIMELINE_START ? durationMinut - (TIMELINE_START - startMins) : durationMinut;
  const width = (visibleDuration / TOTAL_MINUTES) * 100;

  return {
    left: `${Math.min(100, Math.max(0, left))}%`,
    width: `${Math.min(100 - left, Math.max(0, width))}%`,
    top: "4px",
    bottom: "4px",
  };
};

const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default function AdminTimetable() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [dayFilter, setDayFilter] = useState("Toq kunlar"); // Toq kunlar | Juft kunlar | Boshqalar

  const { data: timetableRes, isLoading } = useQuery({
    queryKey: ["dashboard-timetable"],
    queryFn: async () => {
      const res = await axiosClient.get("/dashboard/timetable");
      return res.data;
    },
    staleTime: 30_000,
    refetchOnMount: false,
  });

  const data = timetableRes?.data || [];
  
  const today = new Date();
  const currentMonthName = months[today.getMonth()];
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentWeekDay = days[today.getDay()];

  // Filter groups
  const filteredData = data.filter((group: any) => {
    const w = group.week_day || [];
    const isToq = w.includes("Monday") || w.includes("Wednesday") || w.includes("Friday");
    const isJuft = w.includes("Tuesday") || w.includes("Thursday") || w.includes("Saturday");
    
    if (dayFilter === "Toq kunlar") return isToq;
    if (dayFilter === "Juft kunlar") return isJuft && !isToq;
    if (dayFilter === "Boshqalar") return !isToq && !isJuft;
    return true;
  });

  // Extract unique rooms from filtered data
  const uniqueRooms = Array.from(
    new Map(filteredData.filter((g: any) => g.room).map((item: any) => [item.room.id, item.room])).values()
  );

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="min-h-auto bg-gray-50">
        <div className="mx-auto bg-white rounded-lg shadow-sm p-3">
          <div data-slot="accordion" className="w-full" data-orientation="vertical">
            <div data-state={isOpen ? "open" : "closed"} data-orientation="vertical" data-slot="accordion-item">
              <h3 data-orientation="vertical" data-state={isOpen ? "open" : "closed"} className="flex">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  data-state={isOpen ? "open" : "closed"}
                  data-orientation="vertical"
                  data-slot="accordion-trigger"
                  className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 w-full px-3"
                >
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Dars jadvali</h1>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down text-muted-foreground pointer-events-none size-6 mr-5 translate-y-0.5 shrink-0 transition-transform duration-200" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </h3>
              
              <div 
                data-state={isOpen ? "open" : "closed"} 
                role="region" 
                data-orientation="vertical" 
                data-slot="accordion-content" 
                className="overflow-hidden text-sm transition-all"
                style={{ display: isOpen ? "block" : "none" }}
              >
                <div className="pt-0 pb-4">
                  
                  {/* Header tools */}
                  <div className="p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                      <div className="text-center rounded-[8px] shadow-sm min-w-[45px] sm:min-w-[50px]">
                        <div className="text-[10px] sm:text-xs text-gray-500 uppercase bg-gray-50 px-2 sm:px-3 py-1">{currentMonthName}</div>
                        <div className="text-base sm:text-[18px] font-bold text-indigo-600">{currentDay}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600">{currentMonthName} {currentYear}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{currentWeekDay}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        {["Toq kunlar", "Juft kunlar", "Boshqalar"].map((f) => (
                          <button 
                            key={f}
                            onClick={() => setDayFilter(f)}
                            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${dayFilter === f ? "bg-white text-[#7c3aed] shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-b bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Tanlangan kun turi: <span className="font-medium text-[#7c3aed]">{dayFilter}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto md:overflow-x-scroll">
                    <div className="inline-block min-w-full">
                      
                      {/* Timeline Header */}
                      <div className="flex border-b bg-gray-50">
                        <div className="w-20 flex-shrink-0"></div>
                        <div className="flex-1 flex">
                          {["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"].map((time, idx) => (
                            <div key={idx} className="flex-1 px-1 py-2 text-[10px] text-gray-600 text-start border-l">
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rooms Timeline */}
                      {isLoading ? (
                        <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>
                      ) : uniqueRooms.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">Ushbu kunga darslar topilmadi</div>
                      ) : (
                        uniqueRooms.map((room: any) => (
                          <div key={room.id} className="flex border-b hover:bg-gray-100 transition-colors relative" style={{ minHeight: "60px" }}>
                            <div className="w-20 flex-shrink-0 px-3 py-3 border-r bg-gray-50">
                              <div className="text-xs font-medium text-gray-700">{room.name}</div>
                            </div>
                            <div className="flex-1 relative overflow-x-auto">
                              
                              {/* Background grid lines */}
                              <div className="absolute inset-0 flex">
                                {Array.from({ length: 15 }).map((_, i) => (
                                  <div key={i} className="flex-1 border-l"></div>
                                ))}
                              </div>
                              
                              {/* Group cards */}
                              <div className="absolute inset-0 p-2">
                                {filteredData
                                  .filter((g: any) => g.room?.id === room.id)
                                  .map((g: any) => {
                                    const styles = getPositionStyles(g.startTime, g.durationMinut);
                                    return (
                                      <Link
                                        key={g.id}
                                        href={`/dashboard/groups/${g.id}`}
                                        className="absolute rounded-md p-2 border border-gray-200 shadow-sm transition-transform hover:scale-[1.01]"
                                        style={{ ...styles, opacity: 0.95, backgroundColor: g.color || "#7c3aed", textDecoration: "none" }}
                                      >
                                        <div className="flex items-start justify-between h-full">
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-200 truncate">{g.name}</div>
                                            <div className="text-[10px] text-gray-300 font-bold truncate">{g.courseName}</div>
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
