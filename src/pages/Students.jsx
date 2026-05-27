import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, InputAdornment, Checkbox, Stack, Divider, Drawer,
  Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PlaceIcon from '@mui/icons-material/Place';
import KeyIcon from '@mui/icons-material/VpnKey';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import '../i18n';

const ITEMS_PER_PAGE = 10;

const getInitials = (name = '') => {
  const parts = (name || '').trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (parts[0]?.[0] || '?').toUpperCase();
};

const avatarColors = ['#6A50E8', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
const getColor = (id) => avatarColors[id % avatarColors.length];

export default function Students() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('students');
  const [editingId, setEditingId] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const filteredGroups = allGroups.filter(g =>
    g.name?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroupSelect = (id) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const confirmGroups = () => {
    setForm(f => ({ ...f, groups: selectedGroups }));
    setIsGroupModalOpen(false);
  };

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: 'MALE',
    photo: null,
    groups: []
  });

  const token = () => localStorage.getItem('token');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' 
      ? <ArrowUpwardIcon sx={{ fontSize: 14, ml: 0.3, verticalAlign: 'middle' }} />
      : <ArrowDownwardIcon sx={{ fontSize: 14, ml: 0.3, verticalAlign: 'middle' }} />;
  };

  const thSx = (field) => ({
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': { color: 'var(--primary)' },
  });

  async function getStudents(q = '') {
    try {
      const statusParam = activeTab === 'students' ? 'active' : 'inactive';
      let url = `/api/v1/students/all?status=${statusParam}&page=${page}&limit=${ITEMS_PER_PAGE}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const res = await api.get(url);
      const data = res.data?.data || [];
      setStudents(data);
      const pag = res.data?.pagination;
      if (pag) {
        setTotalPages(pag.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  }

  async function getAllGroups() {
    try {
      const res = await api.get('/api/v1/groups?dropdown=true');
      setAllGroups(res.data?.data || res.data || []);
    } catch { }
  }

  function openCreateDrawer() {
    setEditingId(null);
    resetForm();
    setSelectedGroups([]);
    setIsDrawerOpen(true);
  }

  async function openEditDrawer(student) {
    setEditingId(student.id);
    const gIds = (student.studentGroups || []).map(sg => sg.groups?.id).filter(Boolean);
    setForm({
      full_name: student.full_name,
      email: student.email,
      password: '',
      phone: student.phone,
      address: student.address || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
      gender: student.gender || 'MALE',
      photo: null,
      groups: gIds
    });
    setSelectedGroups(gIds);
    setIsDrawerOpen(true);
  }

  async function handleSubmit() {
    if (editingId) {
      await updateStudent();
    } else {
      await saveStudent();
    }
  }

  async function saveStudent() {
    try {
      const formData = new FormData();
      formData.append('full_name', (form.full_name || '').trim());
      formData.append('email', (form.email || '').trim());
      formData.append('password', (form.password || '').trim());
      formData.append('phone', (form.phone || '').trim());
      formData.append('address', (form.address || '').trim());
      formData.append('birth_date', form.birth_date || '');
      formData.append('gender', form.gender || 'MALE');
      if (form.photo) formData.append('photo', form.photo);
      form.groups.forEach(id => formData.append('groups', id));
      const res = await api.post('/api/v1/students', formData);
      if (res.data) {
        getStudents(searchQuery);
        setIsDrawerOpen(false);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('StudentSaveError')));
    }
  }

  async function updateStudent() {
    try {
      const formData = new FormData();
      formData.append('full_name', (form.full_name || '').trim());
      formData.append('email', (form.email || '').trim());
      if (form.password) formData.append('password', (form.password || '').trim());
      formData.append('phone', (form.phone || '').trim());
      formData.append('address', (form.address || '').trim());
      if (form.birth_date) formData.append('birth_date', form.birth_date);
      formData.append('gender', form.gender || 'MALE');
      if (form.photo) formData.append('photo', form.photo);
      form.groups.forEach(id => formData.append('groups', id));
      const res = await api.put(`/api/v1/students/${editingId}`, formData);
      if (res.data) {
        getStudents(searchQuery);
        setIsDrawerOpen(false);
        setEditingId(null);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('StudentUpdateError')));
    }
  }

  const triggerDelete = (id) => {
    setStudentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await api.delete(`/api/v1/students/${studentToDelete}`);
      getStudents(searchQuery);
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('Delete')));
    }
  };

  async function restoreStudent(id) {
    try {
      const formData = new FormData();
      formData.append('status', 'active');
      await api.put(`/api/v1/students/${id}`, formData);
      getStudents(searchQuery);
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('StudentRestoreError')));
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', phone: '', address: '', birth_date: '', gender: 'MALE', photo: null, groups: [] });
  }

  useEffect(() => {
    if (!token() || token() === 'undefined') { window.location.href = '/login'; return; }
    getStudents(searchQuery);
  }, [searchQuery, activeTab, page, sortBy, sortOrder]);

  const handleToggleAll = (e) => setSelectedIds(e.target.checked ? students.map(s => s.id) : []);
  const handleToggleOne = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{t('AllStudents')}</Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', maxWidth: 600 }}>{t('StudentsDesc')} {t('StudentsDescFull')}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}
            sx={{ backgroundColor: 'var(--primary)', textTransform: 'none', borderRadius: '10px', px: 2.5, fontWeight: 700, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
            {t('AddStudent')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {[
            { key: 'students', label: t('AllStudents') },
            { key: 'archive', label: t('Archive'), icon: <CalendarMonthIcon sx={{ fontSize: 16 }} /> }
          ].map(tab => (
            <Button key={tab.key} startIcon={tab.icon}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 2,
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                '&:hover': { backgroundColor: 'transparent', color: 'var(--primary)' }, whiteSpace: 'nowrap' }}>
              {tab.label}
            </Button>
          ))}
        </Box>
        <TextField size="small" placeholder={t('Search')} value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: 'var(--surface)' } }}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'var(--gray-400)' }} /></InputAdornment>) } }} />
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'var(--gray-50)' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" onChange={handleToggleAll}
                    checked={students.length > 0 && selectedIds.length === students.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < students.length} />
                </TableCell>
                <TableCell sx={thSx('full_name')} onClick={() => handleSort('full_name')}>
                  {t('StudentName')} <SortIcon field="full_name" />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t('StudentGroup')}</TableCell>
                <TableCell sx={thSx('phone')} onClick={() => handleSort('phone')}>
                  {t('StudentPhone')} <SortIcon field="phone" />
                </TableCell>
                <TableCell sx={thSx('birth_date')} onClick={() => handleSort('birth_date')}>
                  {t('StudentBirthDate')} <SortIcon field="birth_date" />
                </TableCell>
                <TableCell sx={thSx('created_at')} onClick={() => handleSort('created_at')}>
                  {t('StudentCreated')} <SortIcon field="created_at" />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t('Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'var(--gray-400)' }}>{t('NoData')}</TableCell></TableRow>
              ) : students.map((student) => {
                const groups = student.studentGroups?.map(g => g.groups?.name).filter(Boolean) || [];
                return (
                  <TableRow key={student.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell padding="checkbox"><Checkbox size="small" checked={selectedIds.includes(student.id)} onChange={() => handleToggleOne(student.id)} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={student.photo ? `http://localhost:3000/file/${student.photo}` : undefined}
                          sx={{ width: 32, height: 32, backgroundColor: getColor(student.id), fontSize: '0.75rem', fontWeight: 700 }}>
                          {getInitials(student.full_name)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{student.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {groups.length > 0 ? groups.map((g, i) => <Chip key={i} label={g} size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }} />) : <Typography sx={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>—</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{student.phone}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{formatDate(student.birth_date)}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(student.created_at)}</Typography></TableCell>
                    <TableCell>
                      {activeTab === 'archive' ? (
                        <Tooltip title={t('Restore')}>
                          <IconButton size="small" onClick={() => restoreStudent(student.id)} sx={{ color: 'var(--success)', '&:hover': { color: 'var(--success-dark)' } }}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" sx={{ '&:hover': { color: 'var(--primary)' } }}><VisibilityIcon sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => triggerDelete(student.id)} sx={{ '&:hover': { color: 'var(--danger)' } }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => openEditDrawer(student)} sx={{ '&:hover': { color: 'var(--success)' } }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <Button size="small" startIcon={<KeyboardArrowLeftIcon />} disabled={page === 1} onClick={() => setPage(p => p - 1)} sx={{ textTransform: 'none', color: 'var(--gray-700)' }}>{t('Previous')}</Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} size="small" onClick={() => setPage(p)}
                sx={{ minWidth: 32, height: 32, borderRadius: '8px', fontWeight: page === p ? 700 : 400,
                  backgroundColor: page === p ? 'var(--primary)' : 'transparent',
                  color: page === p ? '#fff' : 'var(--gray-700)' }}>{p}</Button>
            ))}
          </Box>
          <Button size="small" endIcon={<KeyboardArrowRightIcon />} disabled={page === totalPages} onClick={() => setPage(p => p + 1)} sx={{ textTransform: 'none', color: 'var(--gray-700)' }}>{t('Next')}</Button>
        </Box>
      </Paper>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        sx={{ zIndex: 2000 }}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        {/* Drawer content - same as before */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? t('StudentEditTitle') : t('StudentAddTitle')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {editingId ? t('StudentEditDesc') : t('StudentAddDesc')}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentPhoneLabel')}</Typography>
              <TextField fullWidth size="small" placeholder="+998" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentEmailLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('EmailPlaceholder')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentFIOLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('NamePlaceholder')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentBirthDateLabel')}</Typography>
              <TextField fullWidth size="small" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentGroupLabel')}</Typography>
              <Box onClick={() => { setGroupSearch(''); getAllGroups(); setSelectedGroups(form.groups); setIsGroupModalOpen(true); }}
                sx={{ border: '1.5px dashed var(--border)', borderRadius: '8px', p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)' } }}>
                <AddIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {form.groups.length > 0 ? allGroups.filter(g => form.groups.includes(g.id)).map(g => g.name).join(', ') : t('AddStudentBtn')}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentPhotoLabel')}</Typography>
              <Box component="label" sx={{ border: '1.5px dashed var(--border)', borderRadius: '10px', p: 3, textAlign: 'center', cursor: 'pointer', display: 'block', '&:hover': { borderColor: 'var(--primary)' } }}>
                <input type="file" hidden accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files[0] })} />
                <CloudUploadIcon sx={{ fontSize: 28, color: 'var(--gray-400)', mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{form.photo ? form.photo.name : t('PhotoUpload')}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{t('PhotoHint')}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentAddressLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('AddressPlaceholder')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PlaceIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} /></InputAdornment> } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StudentPasswordLabel')}</Typography>
              <TextField fullWidth size="small" type="password" placeholder={t('PasswordPlaceholder')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><KeyIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} /></InputAdornment> } }} />
            </Box>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setIsDrawerOpen(false)} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: 'var(--border)', color: 'var(--gray-700)' }}>{t('Cancel')}</Button>
          <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>{t('Save')}</Button>
        </Box>
      </Drawer>

      <Dialog open={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} maxWidth="sm" fullWidth sx={{ zIndex: 2100 }}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('GroupAssign')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{t('GroupAssignDesc')}</Typography>
          </Box>
          <IconButton onClick={() => setIsGroupModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 1 }}>
          <TextField fullWidth size="small" placeholder={t('GroupSearch')}
            value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} /></InputAdornment>) } }} />
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filteredGroups.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'var(--gray-400)', py: 3 }}>{t('GroupNotFound2')}</Typography>
            ) : filteredGroups.map((group) => (
              <Box key={group.id} onClick={() => toggleGroupSelect(group.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '8px', cursor: 'pointer', mb: 0.5,
                  '&:hover': { backgroundColor: 'var(--gray-50)' },
                  backgroundColor: selectedGroups.includes(group.id) ? 'var(--primary-light)' : 'transparent' }}>
                <Checkbox size="small" checked={selectedGroups.includes(group.id)}
                  onChange={() => toggleGroupSelect(group.id)} onClick={(e) => e.stopPropagation()}
                  sx={{ '&.Mui-checked': { color: 'var(--primary)' } }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: 'var(--primary-bg-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GroupsIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 500 }}>{group.name}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button onClick={() => setIsGroupModalOpen(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)', flex: 1 }}>{t('Cancel')}</Button>
          <Button onClick={confirmGroups} variant="contained"
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, flex: 1, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>{t('AddStudentBtn')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '8px', width: '420px', maxWidth: '90vw', boxShadow: 'var(--shadow-lg)' } }}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <DeleteOutlineIcon sx={{ fontSize: 32, color: 'var(--danger)' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', mb: 1.5 }}>{t('StudentArchiveTitle')}</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, mb: 4 }}>{t('ArchiveConfirmMessage')}</Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
              <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined"
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)', px: 3, py: 1.2, '&:hover': { borderColor: 'var(--gray-400)', backgroundColor: 'var(--gray-50)' } }}>
                {t('Cancel')}
              </Button>
              <Button onClick={handleConfirmDelete} variant="contained"
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, backgroundColor: 'var(--danger)', color: '#fff', px: 3, py: 1.2, '&:hover': { backgroundColor: 'var(--danger-dark)' } }}>
                {t('ArchiveAction')}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}