import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper, Avatar,
  Switch, TextField, Radio, RadioGroup,
  FormControl, FormControlLabel, CircularProgress, Snackbar, Alert, Tab, Tabs
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import '../i18n';

const token = () => localStorage.getItem('token');
const SHORT_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const fmtDateUz = (d) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTH_UZ[dt.getMonth()]}, ${dt.getFullYear()}`;
};

const initials = (name = '') => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (p[0]?.[0] || '?').toUpperCase();
};

export default function Attendance() {
  const { t } = useTranslation();
  const { id, date } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [teacherTab, setTeacherTab] = useState(0);
  const [calMonthIdx, setCalMonthIdx] = useState(null);
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonType, setLessonType] = useState('other');
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
  const [existingLesson, setExistingLesson] = useState(null);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  const today = new Date();

  const handleDateClick = (d) => {
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dDate > tDate) {
      setSnackbar({ open: true, message: t('AttendanceFuture') });
    } else {
      navigate(`/group/${id}/attendance/${d.toISOString().slice(0, 10)}`);
    }
  };

  useEffect(() => {
    if (!token()) { navigate('/login'); return; }
    loadData();
  }, [id, date]);

  async function loadData() {
    setLoading(true);
    try {
      const userRes = await api.get('/api/v1/auth/me');
      setUserRole(userRes.data?.role);
      const groupRes = await api.get(`/api/v1/groups/${id}`);
      const groupData = groupRes.data?.data || groupRes.data;
      setGroup(groupData);
      const attRes = await api.get(`/api/v1/attendances/by-date?group_id=${id}&date=${date}`);
      const attData = attRes.data;
      const studentList = groupData?.studentGroups || [];
      
      if (attData?.lesson) {
        setExistingLesson(attData.lesson);
        setAlreadyTaken(true);
        setLessonTopic(attData.lesson.topic || '');
        setLessonType(attData.lesson.type || 'plan');
        const recorded = {};
        (attData.attendances || []).forEach(att => { recorded[att.student_id] = att.isPresent; });
        const finalAtt = {};
        studentList.forEach(sg => { finalAtt[sg.students.id] = recorded[sg.students.id] === true; });
        setAttendance(finalAtt);
      } else {
        setAlreadyTaken(false);
        setExistingLesson(null);
        setLessonTopic('');
        setLessonType('plan');
        const init = {};
        studentList.forEach(sg => { init[sg.students.id] = true; });
        setAttendance(init);
      }
      fetchSchedule();
    } catch (e) {
      if (e.response?.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
    } finally { setLoading(false); }
  }

  async function fetchSchedule() {
    try {
      const res = await api.get(`/api/v1/groups/${id}/schedule`);
      setSchedule(res.data || []);
    } catch (_) { }
  }

  const monthGroups = useMemo(() =>
    schedule.map(m => ({ learning_month: m.learning_month, month: m.month_name, year: m.year, dates: m.lessons.map(l => new Date(l.date)) })), [schedule]);

  useEffect(() => {
    if (monthGroups.length === 0 || calMonthIdx !== null) return;
    const d = new Date(date);
    const idx = monthGroups.findIndex(m => m.year === d.getFullYear() && m.dates?.[0]?.getMonth() === d.getMonth());
    setCalMonthIdx(idx !== -1 ? idx : 0);
  }, [monthGroups]);

  async function handleSave() {
    if (!lessonTopic.trim()) {
      setSnackbar({ open: true, message: t('AttendanceTopic'), severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/v1/attendances', {
        group_id: Number(id), date, topic: lessonTopic, type: lessonType,
        records: Object.entries(attendance).map(([sid, present]) => ({ student_id: Number(sid), present })),
      });
      setSnackbar({ open: true, message: alreadyTaken ? t('AttendanceUpdated') : t('AttendanceSaved'), severity: 'success' });
      setTimeout(() => navigate(`/group/${id}`), 1200);
    } catch (e) {
      const msg = e.response?.data?.message || t('ErrorOccurred');
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally { setSaving(false); }
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );
  if (!group) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography color="text.secondary">{t('GroupNotFound')}</Typography>
      <Button onClick={() => navigate('/groups')} sx={{ mt: 2 }}>← {t('Groups')}</Button>
    </Box>
  );

  const teachers = group.teachers || [];
  const mainTeacher = teachers.find(t => !t.is_assistant && t.role !== 'assistant') || teachers[0];
  const asst = teachers.find(t => t.is_assistant || t.role === 'assistant');
  const tabTeachers = [mainTeacher, asst].filter(Boolean);
  const activeT = tabTeachers[teacherTab] || mainTeacher;

  const resolvePhoto = (photo) => {
    if (!photo) return undefined;
    if (photo.startsWith('http') || photo.startsWith('/')) return photo;
    return `${import.meta.env.VITE_API_URL || 'https://seven-oy-crm-backned.onrender.com'}/file/${photo}`;
  };

  const startTime = group.start_time || '09:30';
  const [sh, sm] = startTime.split(':').map(Number);
  const endTime = `${String(sh + 2).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
  const selDate = new Date(date);
  const calDates = calMonthIdx !== null ? (monthGroups[calMonthIdx]?.dates || []) : [];
  const students = group.studentGroups || [];

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      {monthGroups.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <IconButton size="small" onClick={() => setCalMonthIdx(i => Math.max(0, i - 1))}
              disabled={calMonthIdx === 0} sx={{ color: 'var(--gray-400)', '&:not(:disabled):hover': { color: 'var(--primary)' } }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gray-700)', minWidth: 120 }}>
              {calMonthIdx !== null && monthGroups[calMonthIdx] ? `${monthGroups[calMonthIdx].learning_month}-${t('StudyMonth')}` : '—'}
            </Typography>
            <IconButton size="small" onClick={() => setCalMonthIdx(i => Math.min(monthGroups.length - 1, i + 1))}
              disabled={calMonthIdx === monthGroups.length - 1} sx={{ color: 'var(--gray-400)', '&:not(:disabled):hover': { color: 'var(--primary)' } }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
              {calDates.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isSelected = d.toISOString().slice(0, 10) === date;
                const isPast = d < today && !isToday;
                const isFuture = new Date(d.getFullYear(), d.getMonth(), d.getDate()) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
                return (
                  <Box key={i} onClick={() => handleDateClick(d)}
                    sx={{ minWidth: 44, height: 54, borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: isSelected ? '2px solid var(--success)' : isToday ? '2px solid var(--primary)' : isPast ? '1.5px solid var(--success)' : '1.5px solid var(--border)',
                      backgroundColor: isSelected ? '#d1fae5' : isToday ? 'var(--primary-light)' : isPast ? 'var(--success-light)' : 'var(--surface)',
                      cursor: isFuture ? 'not-allowed' : 'pointer', gap: 0.2, transition: 'all 0.15s',
                      '&:hover': isFuture ? { borderColor: '#f97316' } : isToday ? { borderColor: 'var(--primary)' } : { borderColor: 'var(--success-dark)', backgroundColor: '#dcfce7' } }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1,
                      color: isSelected ? 'var(--success)' : isToday ? 'var(--primary)' : 'var(--gray-400)' }}>
                      {SHORT_MON[d.getMonth()]}
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: isToday || isSelected ? 800 : 700, lineHeight: 1,
                      color: isSelected ? 'var(--success)' : isToday ? 'var(--primary)' : isPast ? 'var(--gray-400)' : 'var(--gray-700)' }}>
                      {d.getDate()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ borderBottom: '2px solid var(--surface-muted)', mb: 2 }}>
        <Tabs value={teacherTab} onChange={(_, v) => setTeacherTab(v)}
          sx={{ '& .MuiTabs-indicator': { backgroundColor: 'var(--success)', height: 2 },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.88rem', color: 'var(--gray-400)', minWidth: 0, mr: 3, px: 0 },
            '& .Mui-selected': { color: 'var(--success) !important' } }}>
          {mainTeacher && <Tab label={t('TeacherRole')} />}
          {asst && <Tab label={t('AssistantRole')} />}
        </Tabs>
      </Box>

      {activeT && (
        <Box sx={{ border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--gray-50)', overflow: 'hidden', mb: 3, maxWidth: 450 }}>
          <Box sx={{ p: 3, pb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', mb: 2 }}>{t('TeacherInfo')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={resolvePhoto(activeT.photo)} sx={{ width: 56, height: 56, backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {initials(activeT.full_name)}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{activeT.full_name}</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--text-secondary)', mt: 0.3 }}>{teacherTab === 0 ? t('TeacherRole') : t('AssistantRole')}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface)', mx: 2, mb: 2.5, px: 2.5, py: 2, gap: 1 }}>
            {[
              { label: t('LessonDay'), value: fmtDateUz(date) },
              { label: t('LessonTimeRange'), value: `${startTime} - ${endTime}` },
              { label: t('LessonRoom'), value: group.rooms?.name || group.room?.name || '—' },
            ].map((info, i) => (
              <Box key={i}>
                <Typography sx={{ fontSize: '0.72rem', color: 'var(--gray-400)', mb: 0.5, fontWeight: 400, whiteSpace: 'nowrap' }}>{info.label}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>{info.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', mb: 3 }}>
        {group.name}{' '}
        <Box component="span" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {selDate.getDate()}.{String(selDate.getMonth() + 1).padStart(2, '0')}.{selDate.getFullYear()}
        </Box>
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', mb: 4, backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', mb: 2 }}>{t('AttendanceTitle')}</Typography>
        <FormControl component="fieldset" sx={{ mb: 2.5 }}>
          <RadioGroup row value={lessonType} onChange={e => setLessonType(e.target.value)}>
            <FormControlLabel value="plan"
              control={<Radio size="small" sx={{ color: 'var(--border)', '&.Mui-checked': { color: 'var(--success)' } }} />}
              label={<Typography sx={{ fontSize: '0.84rem', color: 'var(--gray-400)' }}>{t('AttendancePlan')}</Typography>} />
            <FormControlLabel value="other"
              control={<Radio size="small" sx={{ color: 'var(--border)', '&.Mui-checked': { color: 'var(--success)' } }} />}
              label={<Typography sx={{ fontSize: '0.84rem', color: 'var(--success)', fontWeight: 800 }}>{t('AttendanceOther')}</Typography>} />
          </RadioGroup>
        </FormControl>
        <Box sx={{ maxWidth: 560 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--gray-700)', mb: 1 }}>
            <Box component="span" sx={{ color: 'var(--danger)', mr: 0.4 }}>*</Box>{t('AttendanceTopic')}
          </Typography>
          <TextField fullWidth placeholder={t('AttendanceTopicPlaceholder')}
            value={lessonTopic} onChange={e => setLessonTopic(e.target.value)} size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--surface)',
              '&:hover fieldset': { borderColor: 'var(--primary)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--success)' } } }} />
        </Box>
      </Paper>

      <Box sx={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 1.8, display: 'flex', alignItems: 'center', backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.73rem', color: 'var(--text-secondary)', width: 44 }}>{t('AttendanceStudentNumber')}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.73rem', color: 'var(--text-secondary)', flex: 1 }}>{t('AttendanceStudentName')}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.73rem', color: 'var(--text-secondary)', width: 120, textAlign: 'center' }}>{t('AttendanceTime')}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.73rem', color: 'var(--text-secondary)', width: 72, textAlign: 'right' }}>{t('AttendancePresent')}</Typography>
        </Box>
        {students.length === 0
          ? <Box sx={{ py: 6, textAlign: 'center' }}><Typography color="text.secondary">{t('AttendanceNoStudents')}</Typography></Box>
          : students.map((sg, idx) => (
            <Box key={sg.students.id} sx={{ px: 3, py: 1.8, display: 'flex', alignItems: 'center',
              borderBottom: idx < students.length - 1 ? '1px solid var(--surface-muted)' : 'none',
              '&:hover': { backgroundColor: 'var(--gray-50)' }, transition: 'background 0.12s' }}>
              <Typography sx={{ fontSize: '0.87rem', color: 'var(--gray-400)', width: 44 }}>{idx + 1}</Typography>
              <Typography sx={{ flex: 1, fontSize: '0.93rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sg.students.full_name}</Typography>
              <Typography sx={{ width: 120, textAlign: 'center', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>{startTime}</Typography>
              <Box sx={{ width: 72, textAlign: 'right' }}>
                <Switch size="small"
                  checked={attendance[sg.students.id] !== false}
                  onChange={e => setAttendance(prev => ({ ...prev, [sg.students.id]: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--success)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--success)' } }} />
              </Box>
            </Box>
          ))}
      </Box>

      {alreadyTaken && userRole === 'TEACHER' ? (
        <Box sx={{ mt: 4, p: 2.5, borderRadius: '8px', backgroundColor: 'var(--success-light)', border: '1.5px solid var(--success)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.93rem', fontWeight: 700, color: 'var(--success-dark)' }}>✓ {t('AttendanceTaken')}</Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(`/group/${id}`)}
            sx={{ borderRadius: '8px', px: 4, textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)' }}>
            {t('Cancel')}
          </Button>
          <Button variant="contained" disabled={!lessonTopic.trim() || saving} onClick={handleSave}
            sx={{ borderRadius: '8px', px: 8, py: 1.2, textTransform: 'none', fontWeight: 800, backgroundColor: 'var(--success)', '&:hover': { backgroundColor: 'var(--success-dark)' }, boxShadow: 'none' }}>
            {saving ? t('Saving') : t('Save')}
          </Button>
        </Box>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity || 'warning'} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}