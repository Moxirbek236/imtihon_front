import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import GroupLessons from './GroupLessons';
import {
  Box, Typography, Button, IconButton, Paper, Chip, Avatar,
  Tab, Tabs, Divider, CircularProgress, Collapse, Snackbar, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import '../i18n';

const token = () => localStorage.getItem('token');

const avatarColors = ['#6A50E8', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
const avatarColor = (i) => avatarColors[i % avatarColors.length];

const initials = (name = '') => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (p[0]?.[0] || '?').toUpperCase();
};

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  return `${dt.getDate()} ${months[dt.getMonth()]}, ${dt.getFullYear()}`;
};

const DAY_SHORT = {
  Monday: 'Du', Tuesday: 'Se', Wednesday: 'Ch',
  Thursday: 'Pa', Friday: 'Ju', Saturday: 'Sh', Sunday: 'Ya'
};

function getLessonDates(weekDays = [], startDate, endDate) {
  if (!startDate || !endDate || weekDays.length === 0) return [];
  const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
  const dayNums = weekDays.map(d => dayMap[d]);
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const cur = new Date(start);
  while (cur <= end) {
    if (dayNums.includes(cur.getDay())) dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getCurrentMonthIndex(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now - start;
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
}

function groupDatesByMonth(dates) {
  const months = {};
  dates.forEach(d => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!months[key]) months[key] = { year: d.getFullYear(), month: d.getMonth(), dates: [] };
    months[key].dates.push(d);
  });
  return Object.values(months);
}

const MONTH_NAMES_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

export default function GroupInner() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [mentorsOpen, setMentorsOpen] = useState(true);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam !== null) setActiveTab(parseInt(tabParam));
  }, [location.search]);

  const handleDateClick = (d, isToday, isPast) => {
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dDate > tDate) {
      setSnackbar({ open: true, message: t('AttendanceFuture') });
    } else {
      navigate(`/group/${id}/attendance/${d.toISOString().slice(0, 10)}`);
    }
  };

  const [calendarMonthIdx, setCalendarMonthIdx] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!token()) { navigate('/login'); return; }
    if (!initialized.current) {
      initialized.current = true;
      fetchGroup();
      fetchSchedule();
    }
  }, [id]);

  async function fetchGroup() {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/groups/${id}`);
      const data = res.data?.data || res.data;
      setGroup(data);
    } catch (e) {
      if (e.response?.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
    } finally { setLoading(false); }
  }

  async function fetchSchedule() {
    try {
      const res = await api.get(`/api/v1/groups/${id}/schedule`);
      setSchedule(res.data || []);
    } catch (e) { console.error('Error fetching schedule:', e); }
  }

  const monthGroups = useMemo(() => {
    return schedule.map(m => ({
      month: m.month_name, year: m.year, learning_month: m.learning_month,
      dates: m.lessons.map(l => new Date(l.date))
    }));
  }, [schedule]);

  const showDarsJadvali = monthGroups.length > 0;

  useEffect(() => {
    if (monthGroups.length > 0 && calendarMonthIdx === null) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const idx = monthGroups.findIndex(m =>
        m.year === currentYear && (m.dates?.[0]?.getMonth() === currentMonth)
      );
      setCalendarMonthIdx(idx !== -1 ? idx : 0);
    }
  }, [monthGroups, calendarMonthIdx]);

  const teachers = group?.teachers || [];
  const assistants = teachers.filter(t => t.role === 'assistant' || t.is_assistant);
  const mainTeachers = teachers.filter(t => !t.is_assistant && t.role !== 'assistant');
  const scheduleRows = teachers;
  const visibleSchedule = showAllSchedule ? scheduleRows : scheduleRows.slice(0, 2);
  const currentMonthGroup = calendarMonthIdx !== null ? monthGroups[calendarMonthIdx] : null;
  const calendarDates = currentMonthGroup?.dates || [];
  const today = new Date();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('GroupNotFound')}</Typography>
        <Button onClick={() => navigate('/groups')} sx={{ mt: 2 }}>← {t('Groups')}</Button>
      </Box>
    );
  }

  const resolvePhoto = (photo) => {
    if (!photo) return undefined;
    if (photo.startsWith('http') || photo.startsWith('/')) return photo;
    return `https://seven-oy-crm-backned.onrender.com/file/${photo}`;
  };

  const params = [
    { label: t('Course') + ':', value: group.course?.name || '—' },
    { label: t('AverageAge') + ':', value: group.averageAge ? Math.round(group.averageAge) : '—' },
    { label: t('StudentCapacity') + ':', value: group.room_capacity || '—' },
    { label: t('CurrentStudents') + ':', value: group.students_count ?? '—' },
    { label: t('CourseDurationMonth') + ':', value: group.course?.duration_month || '—' },
    { label: t('MonthlyLessons') + ':', value: group.month_lessons || '—' },
    { label: t('TotalLessons') + ':', value: group.total_lessons || '—' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/groups')} size="small"
            sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--primary)', backgroundColor: 'var(--primary-light)' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {group.course?.name || t('GroupInfo')}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<BarChartIcon />}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: 'var(--border)', color: 'var(--gray-700)', '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)' } }}>
          {t('Statistics')}
        </Button>
      </Box>

      <Box sx={{ borderBottom: '2px solid var(--surface-muted)', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)', height: 2 },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-400)', minWidth: 0, mr: { xs: 2, sm: 3 }, px: 0 },
            '& .Mui-selected': { color: 'var(--primary) !important' } }}>
          <Tab label={t('GroupInfo')} />
          <Tab label={t('GroupLessons')} />
          <Tab label={t('GroupAcademicProgress')} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3, alignItems: 'start' }}>
            <Box>
              <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', mb: 2 }}>
                <Box onClick={() => setMentorsOpen(!mentorsOpen)}
                  sx={{ backgroundColor: mentorsOpen ? '#3b82f6' : 'var(--gray-50)', color: mentorsOpen ? '#fff' : 'var(--text-primary)', px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{t('GroupMentors')}</Typography>
                  <IconButton size="small" sx={{ color: 'inherit' }}>
                    {mentorsOpen ? <CloseIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>
                <Collapse in={mentorsOpen}>
                  <Box sx={{ p: 3, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {teachers.length === 0 ? (
                      <Typography sx={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{t('NoTeachers')}</Typography>
                    ) : teachers.map((t, i) => (
                      <Box key={t.id} sx={{ textAlign: 'center', minWidth: 80 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                          <Avatar src={resolvePhoto(t.photo)}
                            sx={{ width: 64, height: 64, fontSize: '1.2rem', fontWeight: 700, backgroundColor: 'var(--gray-100)', border: '1px solid var(--border)', color: 'var(--success)' }}>
                            {!t.photo && t.full_name ? t.full_name[0] : ''}
                          </Avatar>
                        </Box>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)', mb: 0.2, textTransform: 'capitalize' }}>
                          {i === 0 ? t('TeacherRole') : t('AssistantRole')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          {t.full_name.split(' ').map((n, idx) => <Box component="span" sx={{ display: 'block' }} key={idx}>{n}</Box>)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Paper>

              <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <Box onClick={() => setAcademicsOpen(!academicsOpen)}
                  sx={{ backgroundColor: academicsOpen ? '#3b82f6' : 'var(--gray-50)', color: academicsOpen ? '#fff' : 'var(--text-primary)', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { backgroundColor: academicsOpen ? '#2563eb' : '#eef2f6' } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'inherit' }}>{t('AcademicHours')}</Typography>
                  {academicsOpen ? <CloseIcon sx={{ fontSize: 20, color: 'inherit' }} /> : <AddIcon sx={{ fontSize: 20, color: 'inherit' }} />}
                </Box>
                <Collapse in={academicsOpen}>
                  <Box sx={{ p: 2, pt: 0, backgroundColor: 'var(--surface)' }}>
                    {teachers.length === 0 ? (
                      <Typography sx={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>{t('NoAcademicData')}</Typography>
                    ) : teachers.map((t) => (
                      <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid var(--surface-muted)' }}>
                        <Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', fontWeight: 600 }}>{t.full_name}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>— {t('Hours')}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Paper>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <Box onClick={() => setParamsOpen(!paramsOpen)}
                sx={{ backgroundColor: paramsOpen ? '#3b82f6' : 'var(--gray-50)', color: paramsOpen ? '#fff' : 'var(--text-primary)', px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{t('GroupParams')}</Typography>
                <IconButton size="small" sx={{ color: 'inherit' }}>
                  {paramsOpen ? <CloseIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
              <Collapse in={paramsOpen}>
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {params.map((p, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.1, borderBottom: i < params.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                      <Typography sx={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.label}</Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: p.isLink ? '#3b82f6' : 'var(--gray-700)', cursor: p.isLink ? 'pointer' : 'default', '&:hover': p.isLink ? { textDecoration: 'underline' } : {} }}>
                        {p.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          </Box>

          {showDarsJadvali && (
            <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', mb: 2.5 }}>
                {t('GroupSchedule')}
              </Typography>
              <Box>
                {scheduleRows.length === 0 ? (
                  <Typography sx={{ color: 'var(--gray-400)', fontSize: '0.85rem', py: 2 }}>{t('NoData')}</Typography>
                ) : (
                  <>
                    {visibleSchedule.map((t, i) => {
                      const days = (group.week_day || []).map(d => DAY_SHORT[d] || d).join('/');
                      const startTime = group.start_time || '09:30';
                      const [sh, sm] = startTime.split(':').map(Number);
                      const endH = String(sh + 2).padStart(2, '0');
                      const endM = String(sm).padStart(2, '0');
                      const endTime = `${endH}:${endM}`;
                      return (
                        <Box key={t.id} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: { xs: 1.5, md: 3 }, px: 3, py: 2, border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--gray-50)', mb: 1.5, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--primary)' } }}>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', width: { xs: '100%', md: '15%' } }}>{t.full_name}</Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: 'var(--text-secondary)', width: { xs: '100%', md: '15%' }, textAlign: { xs: 'left', md: 'center' } }}>{days}</Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', width: { xs: '100%', md: '25%' }, textAlign: { xs: 'left', md: 'center' } }}>{startTime} {t('FromTime')} — {endTime} {t('ToTime')}</Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', width: { xs: '100%', md: '30%' }, textAlign: { xs: 'left', md: 'center' } }}>{fmtDate(group.start_date)} — {fmtDate(group.end_date)}</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: { xs: '100%', md: '15%' }, textAlign: { xs: 'left', md: 'right' } }}>{group.rooms?.name || group.room?.name || '—'}</Typography>
                        </Box>
                      );
                    })}
                    {scheduleRows.length > 2 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button variant="outlined" size="small" onClick={() => setShowAllSchedule(s => !s)}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)', px: 3, '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)' } }}>
                          {showAllSchedule ? t('ShowLess') : `${t('ShowMore')} (${scheduleRows.length - 2})`}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                {!showAllDates && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconButton size="small" onClick={() => setCalendarMonthIdx(i => Math.max(0, i - 1))}
                      disabled={calendarMonthIdx === 0} sx={{ color: 'var(--gray-400)', '&:not(:disabled):hover': { color: 'var(--primary)' } }}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-700)', minWidth: 100, textAlign: 'center' }}>
                      {calendarMonthIdx !== null && monthGroups[calendarMonthIdx] ? `${monthGroups[calendarMonthIdx].learning_month}-${t('StudyMonth')}` : '—'}
                    </Typography>
                    <IconButton size="small" onClick={() => setCalendarMonthIdx(i => Math.min(monthGroups.length - 1, i + 1))}
                      disabled={calendarMonthIdx === monthGroups.length - 1} sx={{ color: 'var(--gray-400)', '&:not(:disabled):hover': { color: 'var(--primary)' } }}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>
                )}

                {showAllDates ? (
                  <Box>
                    {monthGroups.map((mg, mIdx) => {
                      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return (
                        <Box key={mIdx} sx={{ mb: 2 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--gray-700)', mb: 1 }}>{mg.learning_month}-{t('StudyMonth')} — {mg.month} {mg.year}</Typography>
                          <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
                              {mg.dates.map((d, dIdx) => {
                                const isToday = d.toDateString() === today.toDateString();
                                const isPast = d < today;
                                const isFuture = new Date(d.getFullYear(), d.getMonth(), d.getDate()) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                return (
                                  <Box key={dIdx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                                    <Box onClick={() => handleDateClick(d, isToday, isPast)}
                                      sx={{ width: 44, height: 54, borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: isToday ? '2px solid var(--primary)' : isPast ? '1.5px solid var(--success)' : '1.5px solid var(--border)',
                                        backgroundColor: isToday ? 'var(--primary-light)' : isPast ? 'var(--success-light)' : 'var(--surface)',
                                        cursor: isFuture ? 'not-allowed' : 'pointer', gap: 0.2, transition: 'all 0.15s',
                                        '&:hover': isFuture ? { borderColor: '#f97316' } : isToday ? { borderColor: 'var(--primary)' } : { borderColor: 'var(--success-dark)', backgroundColor: '#dcfce7' } }}>
                                      <Typography sx={{ fontSize: '0.62rem', color: isToday ? 'var(--primary)' : isPast ? 'var(--success)' : 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>
                                        {shortMonths[d.getMonth()]}
                                      </Typography>
                                      <Typography sx={{ fontSize: '0.95rem', fontWeight: (isToday || isPast) ? 800 : 700, color: isToday ? 'var(--primary)' : isPast ? 'var(--success-dark)' : 'var(--gray-700)', lineHeight: 1 }}>
                                        {d.getDate()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => setShowAllDates(false)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)', px: 4, '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)' } }}>
                        {t('Collapse')}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ overflowX: 'auto', pb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
                        {calendarDates.map((d, idx) => {
                          const isToday = d.toDateString() === today.toDateString();
                          const isPast = d < today;
                          const isFuture = new Date(d.getFullYear(), d.getMonth(), d.getDate()) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
                          const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          return (
                            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                              <Box onClick={() => handleDateClick(d, isToday, isPast)}
                                sx={{ width: 44, height: 54, borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                  border: isToday ? '2px solid var(--primary)' : isPast ? '1.5px solid var(--success)' : '1.5px solid var(--border)',
                                  backgroundColor: isToday ? 'var(--primary-light)' : isPast ? 'var(--success-light)' : 'var(--surface)',
                                  cursor: isFuture ? 'not-allowed' : 'pointer', gap: 0.2, transition: 'all 0.15s',
                                  '&:hover': isFuture ? { borderColor: '#f97316' } : isToday ? { borderColor: 'var(--primary)' } : { borderColor: 'var(--success-dark)', backgroundColor: '#dcfce7' } }}>
                                <Typography sx={{ fontSize: '0.62rem', color: isToday ? 'var(--primary)' : isPast ? 'var(--success)' : 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>
                                  {shortMonths[d.getMonth()]}
                                </Typography>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: (isToday || isPast) ? 800 : 700, color: isToday ? 'var(--primary)' : isPast ? 'var(--success-dark)' : 'var(--gray-700)', lineHeight: 1 }}>
                                  {d.getDate()}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                      <Button variant="outlined" size="small" onClick={() => setShowAllDates(true)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)', px: 4, '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)' } }}>
                        {t('ShowAll')}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && <GroupLessons groupId={parseInt(id)} />}

      {activeTab === 2 && (
        <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ fontWeight: 500 }}>{t('AcademicProgressEmpty')}</Typography>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity="warning" variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}