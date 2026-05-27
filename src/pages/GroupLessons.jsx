import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Chip, IconButton, Tooltip, Menu, MenuItem,
  Snackbar, Alert, Dialog, DialogContent, DialogTitle,
} from '@mui/material';
import { useUploads } from '../context/UploadContext';
import CreateVideo from './CreateVideo';
import Add from '@mui/icons-material/Add';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import AccessTime from '@mui/icons-material/AccessTime';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import MoreVert from '@mui/icons-material/MoreVert';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Close from '@mui/icons-material/Close';
import PlayCircle from '@mui/icons-material/PlayCircle';
import '../i18n';

const AddIcon = Add;
const PersonOutlineIcon = PersonOutlined;
const AccessTimeIcon = AccessTime;
const CheckCircleOutlineIcon = CheckCircleOutlined;
const MoreVertIcon = MoreVert;
const DeleteOutlineIcon = DeleteOutlined;
const EditOutlinedIcon = EditOutlined;
const CloseIcon = Close;
const PlayCircleIcon = PlayCircle;

const MONTHS = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];

function fmtDateTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  const day = dt.getDate();
  const mon = MONTHS[dt.getMonth()];
  const yr = dt.getFullYear();
  const h = String(dt.getHours()).padStart(2, '0');
  const m = String(dt.getMinutes()).padStart(2, '0');
  return `${day} ${mon}, ${yr}\n${h}:${m}`;
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]}, ${dt.getFullYear()}`;
}

function fmtFileSize(bytes) {
  if (!bytes) return '—';
  const b = Number(bytes);
  if (b === 0) return '—';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFullVideoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  let baseUrl = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
  baseUrl = baseUrl.replace(/\/api\/v1$/, '');
  return `${baseUrl}/file/${url}`;
}

const SUB_TABS = ['HomeworkTab', 'VideosTab', 'ExamsTab', 'GradebookTab'];

export default function GroupLessons({ groupId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uploads, setUploads } = useUploads();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subTab = parseInt(params.get('subTab') || '0', 10);
  const [homeworks, setHomeworks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', description: '', start_date: '', end_date: '' });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const refetchedIds = useRef(new Set());
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuHw, setMenuHw] = useState(null);
  const [vidAnchorEl, setVidAnchorEl] = useState(null);
  const [menuVid, setMenuVid] = useState(null);
  const [examAnchorEl, setExamAnchorEl] = useState(null);
  const [menuExam, setMenuExam] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [hwDeleteConfirmOpen, setHwDeleteConfirmOpen] = useState(false);
  const [hwToDelete, setHwToDelete] = useState(null);
  const [vidDeleteConfirmOpen, setVidDeleteConfirmOpen] = useState(false);
  const [vidToDelete, setVidToDelete] = useState(null);
  const [previewVid, setPreviewVid] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', sev: 'success' });

  const fetchExams = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/api/v1/exams/group/${groupId}`);
      setExams(res.data?.data || res.data || []);
    } catch (e) { console.error('Exams fetch error:', e); setExams([]); }
    finally { if (!silent) setLoading(false); }
  }, [groupId]);

  const fetchHomeworks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/api/v1/home-works/group/${groupId}`);
      setHomeworks(res.data?.data || res.data || []);
    } catch (e) { console.error('HomeWorks fetch error:', e); setHomeworks([]); }
    finally { if (!silent) setLoading(false); }
  }, [groupId]);

  const fetchVideos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/api/v1/videos/group/${groupId}`);
      setVideos(res.data?.data || res.data || []);
    } catch (e) { console.error('Videos fetch error:', e); setVideos([]); }
    finally { if (!silent) setLoading(false); }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    if (subTab === 0) Promise.resolve().then(() => fetchHomeworks());
    if (subTab === 1) Promise.resolve().then(() => fetchVideos());
    if (subTab === 2) Promise.resolve().then(() => fetchExams());
  }, [subTab, groupId, fetchHomeworks, fetchVideos, fetchExams]);

  async function handleCreateExam(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', examForm.title);
      formData.append('description', examForm.description);
      formData.append('group_id', String(groupId));
      if (examForm.start_date) formData.append('start_date', examForm.start_date);
      if (examForm.end_date) formData.append('end_date', examForm.end_date);
      if (file) formData.append('file', file);
      if (editingExamId) {
        await api.put(`/api/v1/exams/${editingExamId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, msg: t('Success'), sev: 'success' });
      } else {
        await api.post('/api/v1/exams', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, msg: t('Success'), sev: 'success' });
      }
      setCreateExamModalOpen(false);
      setExamForm({ title: '', description: '', start_date: '', end_date: '' });
      setEditingExamId(null); setFile(null);
      fetchExams(true);
    } catch (e) {
      setSnackbar({ open: true, msg: e.response?.data?.message || t('ErrorOccurred'), sev: 'error' });
    }
  }

  function handleDeleteExam(id) { handleExamMenuClose(); setExamToDelete(id); setDeleteConfirmOpen(true); }

  async function confirmDeleteExam(id) {
    if (!id) return;
    try {
      await api.delete(`/api/v1/exams/${id}`);
      setSnackbar({ open: true, msg: t('Success'), sev: 'success' });
      fetchExams(true);
    } catch (e) { setSnackbar({ open: true, msg: e.response?.data?.message || t('ErrorOccurred'), sev: 'error' }); }
    finally { setExamToDelete(null); }
  }

  function handleExamMenuOpen(e, exam) { e.stopPropagation(); setExamAnchorEl(e.currentTarget); setMenuExam(exam); }
  function handleExamMenuClose() { setExamAnchorEl(null); setMenuExam(null); }

  useEffect(() => {
    const completed = uploads.filter(u => String(u.metadata.groupId) === String(groupId) && u.status === 'completed' && !refetchedIds.current.has(u.id));
    if (completed.length > 0) {
      completed.forEach(u => refetchedIds.current.add(u.id));
      const timer = setTimeout(() => {
        if (subTab === 0) fetchHomeworks(true);
        if (subTab === 1) fetchVideos(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [uploads, groupId, subTab, fetchHomeworks, fetchVideos]);

  function handleDelete(id) { handleMenuClose(); setHwToDelete(id); setHwDeleteConfirmOpen(true); }

  async function confirmDeleteHw(id) {
    if (!id) return;
    try {
      await api.delete(`/api/v1/home-works/${id}`);
      setSnackbar({ open: true, msg: t('Success'), sev: 'success' });
      fetchHomeworks(true);
    } catch (e) { setSnackbar({ open: true, msg: e.response?.data?.message || t('ErrorOccurred'), sev: 'error' }); }
    finally { setHwToDelete(null); }
  }

  function handleDeleteVideo(id) { handleVidMenuClose(); setVidToDelete(id); setVidDeleteConfirmOpen(true); }

  async function confirmDeleteVideo(id) {
    if (!id) return;
    try {
      await api.delete(`/api/v1/videos/${id}`);
      setSnackbar({ open: true, msg: t('Success'), sev: 'success' });
      fetchVideos(true);
    } catch (e) { setSnackbar({ open: true, msg: e.response?.data?.message || t('ErrorOccurred'), sev: 'error' }); }
    finally { setVidToDelete(null); }
  }

  function handleMenuOpen(e, hw) { e.stopPropagation(); setAnchorEl(e.currentTarget); setMenuHw(hw); }
  function handleMenuClose() { setAnchorEl(null); setMenuHw(null); }
  function handleVidMenuOpen(e, vid) { e.stopPropagation(); setVidAnchorEl(e.currentTarget); setMenuVid(vid); }
  function handleVidMenuClose() { setVidAnchorEl(null); setMenuVid(null); }

  const thSx = {
    fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)',
    py: 1.5, px: 2, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', backgroundColor: 'var(--gray-50)',
  };
  const tdSx = { py: 1.5, px: 2, borderBottom: '1px solid var(--surface-muted)', verticalAlign: 'middle' };
  const addBtnSx = {
    backgroundColor: 'var(--success)', color: '#fff', textTransform: 'none', fontWeight: 600,
    borderRadius: '8px', px: 3, py: 0.8, boxShadow: 'none',
    '&:hover': { backgroundColor: 'var(--success-dark)', boxShadow: 'none' },
  };
  const emptyPaperSx = { border: '1px solid var(--border)', borderRadius: '8px', py: 8, textAlign: 'center' };
  const emptyBtnSx = { mt: 2, textTransform: 'none', fontWeight: 600, borderColor: 'var(--success)', color: 'var(--success)', borderRadius: '10px', '&:hover': { borderColor: 'var(--success-dark)', backgroundColor: 'var(--success-light)' } };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 3, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', mr: 2 }}>{t('GroupLessons')}</Typography>
          <Tabs value={subTab} onChange={(_, v) => { navigate(`?tab=1&subTab=${v}`, { replace: true }); }}
            variant="scrollable" scrollButtons="auto"
            sx={{ minHeight: 36, '& .MuiTabs-indicator': { backgroundColor: 'var(--success)', height: 2 },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: 36, minWidth: 0, px: 2, py: 0.5 },
              '& .Mui-selected': { color: 'var(--text-primary) !important' } }}>
            {SUB_TABS.map((k, i) => <Tab key={i} label={t(k)} />)}
          </Tabs>
        </Box>
        {subTab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/group/${groupId}/homework/create`)} sx={addBtnSx}>
            {t('AddHomework')}
          </Button>
        )}
        {subTab === 1 && (
          <Button variant="contained" onClick={() => setUploadModalOpen(true)}
            sx={{ background: 'linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%)', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3, py: 0.8, boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, var(--success-dark) 0%, #047857 100%)', boxShadow: 'none' } }}>
            {t('AddVideo')}
          </Button>
        )}
      </Box>

      {subTab === 0 && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'var(--success)' }} />
          </Box>
        ) : (homeworks.length === 0 && uploads.filter(u => String(u.metadata.groupId) === String(groupId) && u.metadata.type === 'homework').length === 0) ? (
          <Paper elevation={0} sx={emptyPaperSx}>
            <Typography sx={{ color: 'var(--gray-400)', fontWeight: 500 }}>{t('NoHomeworks')}</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate(`/group/${groupId}/homework/create`)} sx={emptyBtnSx}>
              {t('AddFirstHomework')}
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead><TableRow sx={{ backgroundColor: 'var(--gray-50)' }}>
                <TableCell sx={thSx}>#</TableCell>
                <TableCell sx={thSx}>{t('Subject')}</TableCell>
                <TableCell sx={{ ...thSx, textAlign: 'center', width: 50 }}><Tooltip title={t('StudentsCountIcon')}><PersonOutlineIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} /></Tooltip></TableCell>
                <TableCell sx={{ ...thSx, textAlign: 'center', width: 50 }}><Tooltip title={t('Pending')}><AccessTimeIcon sx={{ fontSize: 18, color: 'var(--warning)' }} /></Tooltip></TableCell>
                <TableCell sx={{ ...thSx, textAlign: 'center', width: 50 }}><Tooltip title={t('Completed')}><CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'var(--success)' }} /></Tooltip></TableCell>
                <TableCell sx={thSx}>{t('GivenTime')}</TableCell>
                <TableCell sx={thSx}>{t('Deadline')}</TableCell>
                <TableCell sx={thSx}>{t('LessonDate')}</TableCell>
                <TableCell sx={{ ...thSx, width: 48 }} />
              </TableRow></TableHead>
              <TableBody>
                {homeworks.map((hw, idx) => {
                  const createdAt = new Date(hw.created_at);
                  const [datePart1, timePart1] = fmtDateTime(createdAt).split('\n');
                  const deadlineDate = new Date(createdAt.getTime() + 86400000);
                  const [datePart2, timePart2] = fmtDateTime(deadlineDate).split('\n');
                  const lessonDate = hw.lessons?.date ? fmtDate(hw.lessons.date) : fmtDate(hw.created_at);
                  const stats = hw.stats || { totalStudents: 0, pending: 0, graded: 0 };
                  return (
                    <TableRow key={hw.id} sx={{ borderBottom: '1px solid var(--surface-muted)', transition: 'background 0.15s', '&:hover': { backgroundColor: '#f8f7ff' } }}>
                      <TableCell sx={tdSx}><Typography sx={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: '0.85rem' }}>{idx + 1}</Typography></TableCell>
                      <TableCell sx={{ ...tdSx, maxWidth: 340 }}>
                        <Typography onClick={() => navigate(`/group/${groupId}/homework/${hw.id}`)}
                          sx={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.4, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', '&:hover': { textDecoration: 'underline', color: 'var(--success)' } }}>
                          {hw.title}
                        </Typography>
                        {hw.lessons?.topic && <Typography sx={{ fontSize: '0.75rem', color: 'var(--gray-400)', mt: 0.3 }}>{hw.lessons.topic}</Typography>}
                      </TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}><Typography sx={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: '0.85rem' }}>{stats.totalStudents || '—'}</Typography></TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}><Typography sx={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.85rem' }}>{stats.pending || 0}</Typography></TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}><Typography sx={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>{stats.graded || 0}</Typography></TableCell>
                      <TableCell sx={tdSx}><Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', fontWeight: 500 }}>{datePart1}</Typography><Typography sx={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{timePart1}</Typography></TableCell>
                      <TableCell sx={tdSx}><Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', fontWeight: 500 }}>{datePart2}</Typography><Typography sx={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{timePart2}</Typography></TableCell>
                      <TableCell sx={tdSx}><Typography sx={{ fontSize: '0.82rem', color: 'var(--gray-700)', fontWeight: 500 }}>{lessonDate}</Typography></TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, hw); }} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--gray-700)' } }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {subTab === 1 && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: 'var(--success)' }} /></Box>
        ) : (videos.length === 0 && uploads.filter(u => String(u.metadata.groupId) === String(groupId) && u.metadata.type === 'video').length === 0) ? (
          <Paper elevation={0} sx={emptyPaperSx}>
            <Typography sx={{ color: 'var(--gray-400)', fontWeight: 500 }}>{t('NoVideos')}</Typography>
            <Button variant="outlined" onClick={() => setUploadModalOpen(true)} sx={emptyBtnSx}>{t('AddFirstVideo')}</Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
              <Table>
                <TableHead><TableRow sx={{ backgroundColor: 'var(--gray-50)' }}>
                  <TableCell sx={thSx}>{t('VideoName')}</TableCell>
                  <TableCell sx={thSx}>{t('LessonName')}</TableCell>
                  <TableCell sx={thSx}>{t('VideoStatus')}</TableCell>
                  <TableCell sx={thSx}>{t('LessonDate')}</TableCell>
                  <TableCell sx={thSx}>{t('VideoSize')}</TableCell>
                  <TableCell sx={thSx}>{t('AddedTime')}</TableCell>
                  <TableCell sx={{ ...thSx, width: 80, textAlign: 'center' }}>{t('Actions')}</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {uploads.filter(u => String(u.metadata.groupId) === String(groupId) && u.metadata.type === 'video' && u.status !== 'completed').map(u => (
                    <TableRow key={u.id} sx={{ backgroundColor: u.status === 'error' ? 'var(--danger-light)' : '#eff6ff' }}>
                      <TableCell sx={{ ...tdSx, color: u.status === 'error' ? '#991b1b' : 'var(--info)', fontWeight: 600 }}>{u.metadata.title}</TableCell>
                      <TableCell sx={tdSx}>{u.metadata.lessonTopic || '—'}</TableCell>
                      <TableCell sx={tdSx}>
                        {u.status === 'error' ? (
                          <Chip label={t('VideoError')} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: 'var(--danger)' }} />
                        ) : (
                          <Chip label={`${t('VideoUploading')} ${u.progress || 0}%`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, color: 'var(--info)', borderColor: 'var(--info)', background: '#eff6ff' }} />
                        )}
                      </TableCell>
                      <TableCell sx={tdSx}>—</TableCell>
                      <TableCell sx={tdSx}>—</TableCell>
                      <TableCell sx={tdSx}>{t('DashboardToday')}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}>
                        {u.status === 'error' ? (
                          <Button size="small" color="error" sx={{ fontSize: '0.65rem' }} onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))}>{t('ClearError')}</Button>
                        ) : (
                          <IconButton size="small" sx={{ color: 'var(--danger)' }} onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {videos.map((vid) => (
                    <TableRow key={vid.id} sx={{ '&:hover': { backgroundColor: 'var(--gray-50)' } }}>
                      <TableCell sx={tdSx}>
                        <Box onClick={() => setPreviewVid(vid)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: 'fit-content', '&:hover .vid-title': { textDecoration: 'underline', color: 'var(--success)' } }}>
                          <PlayCircleIcon sx={{ fontSize: 20, color: 'var(--success)', flexShrink: 0 }} />
                          <Typography className="vid-title" sx={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', transition: 'color 0.2s' }}>{vid.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tdSx}>{vid.lessons?.topic || '—'}</TableCell>
                      <TableCell sx={tdSx}><Chip label={t('VideoReady')} size="small" sx={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, height: 24, fontSize: '0.75rem' }} /></TableCell>
                      <TableCell sx={tdSx}>{fmtDate(vid.lessons?.date || vid.created_at)}</TableCell>
                      <TableCell sx={tdSx}>{fmtFileSize(vid.file_size)}</TableCell>
                      <TableCell sx={tdSx}>{fmtDate(vid.created_at)}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'center' }}>
                        <IconButton size="small" onClick={(e) => handleVidMenuOpen(e, vid)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--gray-700)' } }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
              {uploads.filter(u => String(u.metadata.groupId) === String(groupId) && u.metadata.type === 'video' && u.status !== 'completed').map(u => (
                <Paper key={u.id} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 2, backgroundColor: u.status === 'error' ? 'var(--danger-light)' : '#eff6ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: u.status === 'error' ? '#991b1b' : 'var(--info)' }}>{u.metadata.title}</Typography>
                    <Chip label={u.status === 'error' ? t('VideoError') : `${u.progress || 0}%`} size="small"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, color: u.status === 'error' ? '#fff' : 'var(--info)', background: u.status === 'error' ? 'var(--danger)' : '#eff6ff', border: u.status === 'error' ? 'none' : '1px solid var(--info)' }} />
                  </Box>
                </Paper>
              ))}
              {videos.map((vid) => (
                <Paper key={vid.id} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 2, '&:hover': { backgroundColor: 'var(--gray-50)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box onClick={() => setPreviewVid(vid)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, cursor: 'pointer', '&:hover .vid-title': { textDecoration: 'underline' } }}>
                      <PlayCircleIcon sx={{ fontSize: 28, color: 'var(--success)', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography className="vid-title" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vid.title}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vid.lessons?.topic || '—'}</Typography>
                      </Box>
                    </Box>
                    <Chip label={t('VideoReady')} size="small" sx={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, height: 24, fontSize: '0.72rem', flexShrink: 0 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{fmtDate(vid.created_at)} · {fmtFileSize(vid.file_size)}</Typography>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleVidMenuOpen(e, vid); }} sx={{ color: 'var(--gray-400)' }}><MoreVertIcon fontSize="small" /></IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </>
        )
      )}

      {subTab === 2 && (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateExamModalOpen(true)}
              sx={{ backgroundColor: 'var(--success)', '&:hover': { backgroundColor: 'var(--success-dark)' }, textTransform: 'none', borderRadius: '10px', px: 3, fontWeight: 600 }}>
              {t('AddExam')}
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress sx={{ color: 'var(--success)' }} /></Box>
          ) : exams.length === 0 ? (
            <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', py: 8, textAlign: 'center' }}>
              <Typography sx={{ color: 'var(--gray-400)', fontWeight: 500 }}>{t('NoExams')}</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <Table>
                <TableHead><TableRow sx={{ backgroundColor: 'var(--gray-50)' }}>
                  <TableCell sx={thSx}>#</TableCell>
                  <TableCell sx={thSx}>{t('Subject')}</TableCell>
                  <TableCell sx={{ ...thSx, textAlign: 'center' }}><PersonOutlineIcon sx={{ fontSize: 18 }} /></TableCell>
                  <TableCell sx={thSx}>{t('ExamStatusOngoing')}</TableCell>
                  <TableCell sx={thSx}>{t('ExamPublishedTime')}</TableCell>
                  <TableCell sx={thSx}>{t('ExamDeclaredTime')}</TableCell>
                  <TableCell sx={thSx}></TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {exams.map((ex, idx) => {
                    const isEnded = ex.end_date && new Date(ex.end_date) < new Date();
                    return (
                      <TableRow key={ex.id} sx={{ '&:hover': { backgroundColor: '#f8f7ff' }, borderBottom: '1px solid var(--surface-muted)' }}>
                        <TableCell sx={tdSx}>{exams.length - idx}</TableCell>
                        <TableCell sx={tdSx}>
                          <Typography onClick={() => navigate(`/group/${groupId}/exam/${ex.id}`)}
                            sx={{ fontWeight: 600, color: 'var(--info)', cursor: 'pointer', width: 'fit-content', '&:hover': { textDecoration: 'underline', color: '#1d4ed8' } }}>
                            {ex.title}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: 'center' }}>{ex.total_students ?? ex._count?.examAnswers ?? 0}</TableCell>
                        <TableCell sx={tdSx}>
                          <Chip label={isEnded ? t('ExamStatusEnded') : t('ExamStatusOngoing')} size="small" sx={{ borderRadius: '8px', backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={tdSx}>{fmtDateTime(ex.start_date)}</TableCell>
                        <TableCell sx={tdSx}>{fmtDateTime(ex.created_at)}</TableCell>
                        <TableCell sx={tdSx}>
                          <IconButton size="small" onClick={(e) => handleExamMenuOpen(e, ex)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--gray-700)' } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={createExamModalOpen} onClose={() => { setCreateExamModalOpen(false); setEditingExamId(null); setExamForm({ title: '', description: '', start_date: '', end_date: '' }); setFile(null); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', padding: 1 } }}>
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>{editingExamId ? t('EditExam') : t('ExamCreate')}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleCreateExam}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>{t('Subject')} *</Typography>
                    <input required value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }} placeholder={t('Subject')} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>{t('ExamStartTime')}</Typography>
                      <input type="datetime-local" value={examForm.start_date} onChange={e => setExamForm({ ...examForm, start_date: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>{t('ExamEndTime')}</Typography>
                      <input type="datetime-local" value={examForm.end_date} onChange={e => setExamForm({ ...examForm, end_date: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>{t('ExamDescription')}</Typography>
                    <textarea rows={4} value={examForm.description} onChange={e => setExamForm({ ...examForm, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical', fontSize: '0.95rem' }} placeholder={t('ExamDescription')} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>{t('ExamFileUpload')}</Typography>
                    <Box onClick={() => fileInputRef.current?.click()}
                      sx={{ border: '1px dashed var(--border)', borderRadius: '10px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'var(--success)', background: 'var(--gray-50)' } }}>
                      <input type="file" hidden ref={fileInputRef} onChange={e => setFile(e.target.files[0])} />
                      <Typography sx={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{file ? file.name : t('ExamFileUploadHint')}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                    <Button onClick={() => { setCreateExamModalOpen(false); setEditingExamId(null); setExamForm({ title: '', description: '', start_date: '', end_date: '' }); setFile(null); }} sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 600 }}>{t('Cancel')}</Button>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: 'var(--success)', '&:hover': { backgroundColor: 'var(--success-dark)' }, textTransform: 'none', borderRadius: '10px', px: 3, fontWeight: 600 }}>{editingExamId ? t('Save') : t('Create')}</Button>
                  </Box>
                </Box>
              </form>
            </DialogContent>
          </Dialog>
        </Box>
      )}

      {subTab === 3 && (
        <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', py: 8, textAlign: 'center' }}>
          <Typography sx={{ color: 'var(--gray-400)', fontWeight: 500 }}>{t('AcademicProgressEmpty')}</Typography>
        </Paper>
      )}

      <Dialog open={Boolean(previewVid)} onClose={() => setPreviewVid(null)} fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '25px', backgroundColor: 'var(--surface)', maxWidth: isMobile ? '100%' : '550px', overflow: 'hidden' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{previewVid?.lessons?.topic || previewVid?.title}</Typography>
          <IconButton onClick={() => setPreviewVid(null)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ width: '100%', borderRadius: '9px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
            {previewVid && <Box component="video" src={getFullVideoUrl(previewVid.video_url)} controls autoPlay={false} sx={{ width: '100%', height: '100%', display: 'block' }} />}
          </Box>
        </Box>
      </Dialog>

      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden' } }}>
        <CreateVideo groupId={groupId} onClose={() => setUploadModalOpen(false)} />
      </Dialog>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: '8px', minWidth: 160, py: 0.5 } }}>
        <MenuItem onClick={() => { handleMenuClose(); navigate(`/group/${groupId}/homework/edit/${menuHw?.id}`); }} sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>
          <EditOutlinedIcon fontSize="small" sx={{ color: 'var(--text-secondary)' }} />{t('Edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuHw?.id)} sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)' }}>
          <DeleteOutlineIcon fontSize="small" />{t('Delete')}
        </MenuItem>
      </Menu>

      <Menu anchorEl={vidAnchorEl} open={Boolean(vidAnchorEl)} onClose={handleVidMenuClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: '8px', minWidth: 160, py: 0.5 } }}>
        <MenuItem onClick={() => handleDeleteVideo(menuVid?.id)} sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)' }}>
          <DeleteOutlineIcon fontSize="small" />{t('Delete')}
        </MenuItem>
      </Menu>

      <Menu anchorEl={examAnchorEl} open={Boolean(examAnchorEl)} onClose={handleExamMenuClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: '8px', minWidth: 160, py: 0.5 } }}>
        <MenuItem onClick={() => { handleExamMenuClose(); navigate(`/group/${groupId}/exam/${menuExam?.id}`); }} sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>
          <EditOutlinedIcon fontSize="small" />{t('Edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteExam(menuExam?.id)} sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)' }}>
          <DeleteOutlineIcon fontSize="small" />{t('Delete')}
        </MenuItem>
      </Menu>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.sev} variant="filled">{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
}