"use client";

import { useState, useEffect } from "react";
import axiosClient from "../api/axios";
import { Dialog, DialogContent, DialogTitle, TextField, Button, Box } from "@mui/material";

export default function MessagesClient() {
  const [activeTab, setActiveTab] = useState("send-message"); // send-message | telegram-subscribers | sent-messages
  
  // Data lists
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [sentHistory, setSentHistory] = useState<any[]>([]);

  // Filters state
  const [searchName, setSearchName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Send message dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const resStudents = await axiosClient.get("/students/all?limit=1000");
        if (resStudents.data?.success) {
          const list = resStudents.data.data || [];
          setStudents(list);
          setFilteredStudents(list);
        }

        const resGroups = await axiosClient.get("/groups?limit=1000");
        if (resGroups.data?.success) {
          setGroups(resGroups.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching message clients data:", err);
      }
    }
    fetchData();

    // Read local history
    const savedHistory = localStorage.getItem("messages_history");
    if (savedHistory) {
      try {
        setSentHistory(JSON.parse(savedHistory));
      } catch {
        setSentHistory([]);
      }
    }
  }, []);

  // Filter students logic
  const handleFilter = () => {
    let result = [...students];
    if (searchName) {
      result = result.filter(s => s.full_name?.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (selectedGroupId) {
      result = result.filter(s => 
        s.studentGroups?.some((g: any) => g.groups?.id === Number(selectedGroupId))
      );
    }
    setFilteredStudents(result);
    setSelectedIds([]); // reset selection
  };

  const handleReset = () => {
    setSearchName("");
    setSelectedGroupId("");
    setFilteredStudents(students);
    setSelectedIds([]);
  };

  // Toggle single student checkbox
  const handleSelectOne = (studentId: number) => {
    setSelectedIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  // Select all shown students
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  // Send Broadcast Action
  const handleSendBroadcast = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    // Find selected students telegram IDs
    const selectedStudents = students.filter(s => selectedIds.includes(s.id));
    const telegramIds = selectedStudents.map(s => s.telegram_id).filter(Boolean);

    if (telegramIds.length === 0) {
      alert("Tanlangan talabalardan hech biri telegram botga ulanmagan!");
      setSending(false);
      return;
    }

    try {
      const res = await axiosClient.post("/bot/broadcast", {
        telegramIds,
        message: messageText,
      });

      if (res.data?.success) {
        // Add to history
        const newLog = {
          id: Date.now(),
          message: messageText,
          date: new Date().toISOString(),
          recipientCount: telegramIds.length,
          recipients: selectedStudents.map(s => s.full_name).join(", "),
        };
        const updatedHistory = [newLog, ...sentHistory];
        setSentHistory(updatedHistory);
        localStorage.setItem("messages_history", JSON.stringify(updatedHistory));

        setSendDialogOpen(false);
        setMessageText("");
        setSelectedIds([]);
        alert("Xabar muvaffaqiyatli yuborildi!");
      }
    } catch (err) {
      console.error(err);
      alert("Xabar yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" }) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-[12px] p-6 shadow-xs border border-[#EAECF0]">
      <div dir="ltr" data-orientation="horizontal" data-slot="tabs" className="flex flex-col gap-2 w-full">
        {/* Tab Headers */}
        <div role="tablist" aria-orientation="horizontal" data-slot="tabs-list" className="text-muted-foreground w-fit items-center flex justify-start gap-8 border-b border-[#F2F4F7] dark:border-slate-700 bg-transparent h-auto p-0 mb-6 rounded-none" style={{ outline: "none" }}>
          <button 
            type="button" 
            role="tab" 
            onClick={() => setActiveTab("send-message")}
            aria-selected={activeTab === "send-message"} 
            className={`text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 py-1 whitespace-nowrap text-[14px] md:text-[15px] pb-4 px-1 transition-all relative font-[600] rounded-none border-b-2 border-transparent ${activeTab === "send-message" ? "border-b-[#7F56D9] text-[#7F56D9] bg-transparent" : "text-gray-500 hover:text-gray-800"}`}
          >
            Xabar yuborish
          </button>
          
          <button 
            type="button" 
            role="tab" 
            onClick={() => setActiveTab("telegram-subscribers")}
            aria-selected={activeTab === "telegram-subscribers"}
            className={`text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 py-1 whitespace-nowrap text-[14px] md:text-[15px] pb-4 px-1 transition-all relative font-[600] rounded-none border-b-2 border-transparent ${activeTab === "telegram-subscribers" ? "border-b-[#7F56D9] text-[#7F56D9] bg-transparent" : "text-gray-500 hover:text-gray-800"}`}
          >
            Telegram botga ulanganlar
          </button>
          
          <button 
            type="button" 
            role="tab" 
            onClick={() => setActiveTab("sent-messages")}
            aria-selected={activeTab === "sent-messages"}
            className={`text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 py-1 whitespace-nowrap text-[14px] md:text-[15px] pb-4 px-1 transition-all relative font-[600] rounded-none border-b-2 border-transparent ${activeTab === "sent-messages" ? "border-b-[#7F56D9] text-[#7F56D9] bg-transparent" : "text-gray-500 hover:text-gray-800"}`}
          >
            Yuborilgan xabarlar
          </button>
        </div>

        {/* Tab 1: Send Message */}
        {activeTab === "send-message" && (
          <div data-state="active" data-orientation="horizontal" role="tabpanel" className="flex-1 mt-0 outline-none">
            <div className="w-full">
              <h1 className="text-[20px] font-[600] text-[#1D2939] dark:text-slate-100 mb-6">Barchaga xabar yuborish</h1>
              
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Name */}
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" aria-hidden="true">
                      <path d="m21 21-4.34-4.34"></path>
                      <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                    <input 
                      type="text" 
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="min-w-0 border px-3 py-1 outline-none w-[180px] h-10 pl-9 border-[#D0D5DD] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 rounded-[8px] text-[14px] bg-white" 
                      placeholder="Ism bo'yicha" 
                    />
                  </div>

                  {/* Groups filter */}
                  <select 
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-[160px] h-10 px-3 border border-[#D0D5DD] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-[8px] text-[#667085] text-[14px] bg-white outline-none"
                  >
                    <option value="">Barcha guruhlar</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  {/* Role filter */}
                  <select 
                    className="w-[140px] h-10 px-3 border border-[#D0D5DD] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-[8px] text-[#667085] text-[14px] bg-white outline-none"
                  >
                    <option>Talaba</option>
                  </select>

                  {/* Filter and reset buttons */}
                  <button 
                    onClick={handleFilter}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-all text-white bg-[#7F56D9] hover:bg-[#7F56D9]/90 h-10 px-6 rounded-[8px] font-[600] text-[14px]"
                  >
                    Filtrlash
                  </button>

                  <button 
                    onClick={handleReset}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 border h-10 px-3 border-[#D0D5DD] rounded-[8px] text-[#667085] hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-800 outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-ccw" aria-hidden="true">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                      <path d="M16 16h5v5"></path>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto xl:ml-0">
                  <button 
                    onClick={handleSelectAll}
                    className="inline-flex cursor-pointer items-center justify-center border h-10 border-[#D0D5DD] text-[#7F56D9] font-[600] rounded-[8px] px-4 text-[14px] hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-800 outline-none"
                  >
                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? "Belgilashni bekor qilish" : "Hammasini belgilash"}
                  </button>

                  <button 
                    onClick={() => setSendDialogOpen(true)}
                    disabled={selectedIds.length === 0}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 text-white bg-[#11C1D1] hover:bg-[#11C1D1]/90 h-10 px-6 font-[600] rounded-[8px] text-[14px] disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                  >
                    Xabar yuborish ({selectedIds.length})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border border-[#EAECF0] rounded-[10px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F9FAFB] dark:bg-slate-800 border-b border-[#EAECF0] dark:border-slate-700">
                      <tr className="text-[12px] text-[#475467] dark:text-slate-400 font-[600] uppercase tracking-wider">
                        <th className="p-4 w-[50px] text-center">
                          <input 
                            type="checkbox"
                            checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                            onChange={handleSelectAll}
                            className="size-4 rounded border-gray-300 text-[#7F56D9] focus:ring-[#7F56D9]"
                          />
                        </th>
                        <th className="p-4 w-[60px] text-center">#</th>
                        <th className="p-4">ISMI</th>
                        <th className="p-4 text-left">TELEFON</th>
                        <th className="p-4 text-left">TELEGRAM BOT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-700">
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox"
                              checked={selectedIds.includes(student.id)}
                              onChange={() => handleSelectOne(student.id)}
                              className="size-4 rounded border-gray-300 text-[#7F56D9] focus:ring-[#7F56D9]"
                            />
                          </td>
                          <td className="p-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                          <td className="p-4 font-semibold text-gray-800 dark:text-slate-200">{student.full_name}</td>
                          <td className="p-4 text-gray-600 dark:text-slate-400">{student.phone || "-"}</td>
                          <td className="p-4">
                            {student.telegram_id ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-green-900 dark:text-green-300">Ulangan</span>
                            ) : (
                              <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-red-900 dark:text-red-300">Ulanmagan</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-gray-500 dark:text-slate-400">Foydalanuvchilar topilmadi</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Telegram bot connected */}
        {activeTab === "telegram-subscribers" && (
          <div className="w-full">
            <h1 className="text-[20px] font-[600] text-[#1D2939] dark:text-slate-100 mb-6">Telegram botga ulangan foydalanuvchilar</h1>
            
            <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border border-[#EAECF0] rounded-[10px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F9FAFB] dark:bg-slate-800 border-b border-[#EAECF0] dark:border-slate-700">
                    <tr className="text-[12px] text-[#475467] dark:text-slate-400 font-[600] uppercase tracking-wider">
                      <th className="p-4 w-[60px] text-center">#</th>
                      <th className="p-4">ISMI</th>
                      <th className="p-4 text-left">TELEFON</th>
                      <th className="p-4 text-left">TELEGRAM ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-700">
                    {students.filter(s => s.telegram_id).map((student, idx) => (
                      <tr key={student.id}>
                        <td className="p-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="p-4 font-semibold text-gray-800 dark:text-slate-200">{student.full_name}</td>
                        <td className="p-4 text-gray-600 dark:text-slate-400">{student.phone || "-"}</td>
                        <td className="p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">{student.telegram_id}</td>
                      </tr>
                    ))}
                    {students.filter(s => s.telegram_id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-500 dark:text-slate-400">Ulangan foydalanuvchilar topilmadi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History of sent messages */}
        {activeTab === "sent-messages" && (
          <div className="w-full">
            <h1 className="text-[20px] font-[600] text-[#1D2939] dark:text-slate-100 mb-6">Yuborilgan xabarlar tarixi</h1>
            
            <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border border-[#EAECF0] rounded-[10px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F9FAFB] dark:bg-slate-800 border-b border-[#EAECF0] dark:border-slate-700">
                    <tr className="text-[12px] text-[#475467] dark:text-slate-400 font-[600] uppercase tracking-wider">
                      <th className="p-4 w-[60px] text-center">#</th>
                      <th className="p-4">XABAR MATNI</th>
                      <th className="p-4 text-left">YUBORILGAN VAQT</th>
                      <th className="p-4 text-center">QABUL QILUVCHILAR SONI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-700">
                    {sentHistory.map((log, idx) => (
                      <tr key={log.id}>
                        <td className="p-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">
                          <p className="max-w-[450px] whitespace-pre-wrap">{log.message}</p>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-400 text-xs">{formatDate(log.date)}</td>
                        <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{log.recipientCount} ta</td>
                      </tr>
                    ))}
                    {sentHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-500 dark:text-slate-400">Yuborilgan xabarlar tarixi mavjud emas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Message Modal */}
      <Dialog 
        open={sendDialogOpen} 
        onClose={() => !sending && setSendDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, color: "#1d2939" }}>
          Xabar yuborish ({selectedIds.length} ta talabaga)
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <TextField
            label="Xabar matni"
            placeholder="Salom, darslar o'z vaqtida bo'ladi..."
            multiline
            rows={5}
            fullWidth
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sending}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSendDialogOpen(false)}
              disabled={sending}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              onClick={handleSendBroadcast}
              disabled={sending || !messageText.trim()}
              sx={{ textTransform: "none", borderRadius: 2, bgcolor: "#7F56D9", "&:hover": { bgcolor: "#6d28d9" } }}
            >
              {sending ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}