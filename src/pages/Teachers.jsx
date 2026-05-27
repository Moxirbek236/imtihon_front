import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, InputAdornment, Checkbox, Stack, Divider, Drawer, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Tooltip
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
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import '../i18n';

const ITEMS_PER_PAGE = 10;

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (parts[0]?.[0] || '?').toUpperCase();
};

const avatarColors = ['#6A50E8', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
const getColor = (id) => avatarColors[id % avatarColors.length];

export default function Teachers() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('teachers');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    photo: null,
    groups: []
  });
  const [editingId, setEditingId] = useState(null);

  const token = () => localStorage.getItem('token');

  async function getTeachers(search = '') {
    try {
      const statusParam = activeTab === 'teachers' ? 'active' : 'inactive';
      let url = `/api/v1/teachers?status=${statusParam}`;
      if (search) url += `&full_name=${search}`;
      const res = await api.get(url);
      setTeachers(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  }

  async function getAllGroups() {
    const res = await api.get('/api/v1/groups');
    setAllGroups(res.data || []);
  }

  function openCreateDrawer() {
    setEditingId(null);
    resetForm();
    setIsDrawerOpen(true);
  }

  function openEditDrawer(teacher) {
    setEditingId(teacher.id);
    setForm({
      full_name: teacher.full_name,
      email: teacher.email,
      password: '',
      phone: teacher.phone,
      address: teacher.address || '',
      photo: null,
      groups: teacher.teachersGroups?.map(tg => tg.group?.id) || []
    });
    setSelectedGroups(teacher.teachersGroups?.map(tg => tg.group?.id) || []);
    setIsDrawerOpen(true);
  }

  async function handleSubmit() {
    if (editingId) {
      await updateTeacher();
    } else {
      await saveTeacher();
    }
  }

  async function saveTeacher() {
    try {
      if (!form.full_name || !form.email || !form.password || !form.phone) {
        return alert(t('TeacherRequiredFields'));
      }
      const formData = new FormData();
      formData.append('full_name', form.full_name.trim());
      formData.append('email', form.email.trim());
      formData.append('password', form.password.trim());
      formData.append('phone', form.phone.trim());
      formData.append('address', (form.address || '').trim());
      if (form.photo) formData.append('photo', form.photo);
      form.groups.forEach((id) => formData.append('groups', id));
      const res = await api.post('/api/v1/teachers', formData);
      if (res.data.success) {
        getTeachers(searchQuery);
        setIsDrawerOpen(false);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('TeacherSaveError')));
    }
  }

  async function updateTeacher() {
    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name.trim());
      formData.append('email', form.email.trim());
      if (form.password) formData.append('password', form.password.trim());
      formData.append('phone', form.phone.trim());
      formData.append('address', (form.address || '').trim());
      if (form.photo) formData.append('photo', form.photo);
      form.groups.forEach((id) => formData.append('groups', id));
      const res = await api.put(`/api/v1/teachers/${editingId}`, formData);
      if (res.data.success) {
        getTeachers(searchQuery);
        setIsDrawerOpen(false);
        setEditingId(null);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('TeacherUpdateError')));
    }
  }

  const triggerDelete = (id) => {
    setTeacherToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await api.delete(`/api/v1/teachers/${teacherToDelete}`);
      getTeachers(searchQuery);
      setDeleteConfirmOpen(false);
      setTeacherToDelete(null);
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('TeacherDeleteError')));
    }
  };

  async function restoreTeacher(id) {
    try {
      const formData = new FormData();
      formData.append('status', 'active');
      await api.put(`/api/v1/teachers/${id}`, formData);
      getTeachers(searchQuery);
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('TeacherRestoreError')));
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', phone: '', address: '', photo: null, groups: [] });
    setSelectedGroups([]);
  }

  useEffect(() => {
    if (!token() || token() === 'undefined') {
      window.location.href = '/login';
      return;
    }
    const timer = setTimeout(() => { getTeachers(searchQuery); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(teachers.length / ITEMS_PER_PAGE));
  const paginated = teachers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleAll = (e) => setSelectedIds(e.target.checked ? paginated.map(t => t.id) : []);
  const handleToggleOne = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const filteredGroups = allGroups.filter(g =>
    g.name?.toLowerCase().includes(groupSearch.toLowerCase())
  );
  const toggleGroupSelect = (id) => setSelectedGroups(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
  const confirmGroups = () => {
    setForm(f => ({ ...f, groups: selectedGroups }));
    setIsGroupModalOpen(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU').replaceAll('/', '.') : '-';

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{t('AllTeachers')}</Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', maxWidth: 600 }}>{t('TeachersDesc')} {t('TeachersDescFull')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}
          sx={{ backgroundColor: 'var(--primary)', textTransform: 'none', borderRadius: '10px', px: 2.5, fontWeight: 700, whiteSpace: 'nowrap', '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
          {t('AddTeacher')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {[
            { key: 'teachers', label: t('AllTeachers') },
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
                    checked={paginated.length > 0 && selectedIds.length === paginated.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < paginated.length}
                    sx={{ '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'var(--primary)' } }} />
                </TableCell>
                {[t('TeacherName') + ' ↓', t('TeacherGroup'), t('TeacherPhone'), t('Email'), t('Address'), t('TeacherCreated'), t('Actions')].map(col => (
                  <TableCell key={col} sx={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'var(--gray-400)' }}>{t('NoData')}</TableCell></TableRow>
              ) : paginated.map((teacher) => {
                const groups = teacher.teachersGroups?.map(g => g.group?.name).filter(Boolean) || [];
                return (
                  <TableRow key={teacher.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selectedIds.includes(teacher.id)}
                        onChange={() => handleToggleOne(teacher.id)} sx={{ '&.Mui-checked': { color: 'var(--primary)' } }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={teacher.photo ? `http://localhost:3000/file/${teacher.photo}` : undefined}
                          sx={{ width: 32, height: 32, backgroundColor: getColor(teacher.id), fontSize: '0.75rem', fontWeight: 700 }}>
                          {getInitials(teacher.full_name)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{teacher.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {groups.length > 0 ? groups.map((g, i) => (
                          <Chip key={i} label={g} size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }} />
                        )) : <Typography sx={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>—</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{teacher.phone}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{teacher.email}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{teacher.address || '—'}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(teacher.created_at)}</Typography></TableCell>
                    <TableCell>
                      {activeTab === 'archive' ? (
                        <Tooltip title={t('Restore')}>
                          <IconButton size="small" onClick={() => restoreTeacher(teacher.id)} sx={{ color: 'var(--success)', '&:hover': { color: 'var(--success-dark)' } }}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--primary)' } }}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--danger)' } }} onClick={() => triggerDelete(teacher.id)}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--success)' } }} onClick={() => openEditDrawer(teacher)}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
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
          <Button size="small" startIcon={<KeyboardArrowLeftIcon />} disabled={page === 1}
            onClick={() => setPage(p => p - 1)} sx={{ textTransform: 'none', color: 'var(--gray-700)' }}>{t('Previous')}</Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} size="small" onClick={() => setPage(p)}
                sx={{ minWidth: 32, height: 32, borderRadius: '8px', fontWeight: page === p ? 700 : 400,
                  backgroundColor: page === p ? 'var(--primary)' : 'transparent',
                  color: page === p ? '#fff' : 'var(--gray-700)',
                  '&:hover': { backgroundColor: page === p ? 'var(--primary)' : 'var(--gray-100)' } }}>
                {p}
              </Button>
            ))}
          </Box>
          <Button size="small" endIcon={<KeyboardArrowRightIcon />} disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)} sx={{ textTransform: 'none', color: 'var(--gray-700)' }}>{t('Next')}</Button>
        </Box>
      </Paper>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        sx={{ zIndex: 2000 }}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? t('EditTeacherDrawerTitle') : t('AddTeacherDrawerTitle')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {editingId ? t('EditTeacherDrawerDesc') : t('AddTeacherDrawerDesc')}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherPhoneLabel')}</Typography>
              <TextField fullWidth size="small" placeholder="+998"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherEmailLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('EmailPlaceholder')}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherFIOLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('NamePlaceholder')}
                value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherGroupLabel')}</Typography>
              <Box onClick={() => { setGroupSearch(''); getAllGroups(); setSelectedGroups(form.groups); setIsGroupModalOpen(true); }}
                sx={{ border: '1.5px dashed var(--border)', borderRadius: '8px', p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)' } }}>
                <AddIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {form.groups.length > 0 ? allGroups.filter(g => form.groups.includes(g.id)).map(g => g.name).join(', ') : t('AddTeacherBtn')}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherPhotoLabel')}</Typography>
              <Box component="label" sx={{ border: '1.5px dashed var(--border)', borderRadius: '10px', p: 3, textAlign: 'center', cursor: 'pointer', display: 'block', '&:hover': { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)' } }}>
                <input type="file" hidden accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files[0] })} />
                <CloudUploadIcon sx={{ fontSize: 28, color: 'var(--gray-400)', mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{form.photo ? form.photo.name : t('ClickToUpload')}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{t('PhotoHint')}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherAddressLabel')}</Typography>
              <TextField fullWidth size="small" placeholder={t('AddressPlaceholder')}
                value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('TeacherPasswordLabel')}</Typography>
              <TextField fullWidth size="small" type="password" placeholder={t('PasswordPlaceholder')}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setIsDrawerOpen(false)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)' }}>{t('Cancel')}</Button>
          <Button fullWidth variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>{t('Save')}</Button>
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
            {filteredGroups.length === 0
              ? <Typography sx={{ textAlign: 'center', color: 'var(--gray-400)', py: 3 }}>{t('GroupNotFound2')}</Typography>
              : filteredGroups.map((group) => (
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
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, flex: 1, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>{t('AddTeacherBtn')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '8px', width: '420px', maxWidth: '90vw', boxShadow: 'var(--shadow-lg)' } }}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <DeleteOutlineIcon sx={{ fontSize: 32, color: 'var(--danger)' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', mb: 1.5 }}>{t('TeacherArchiveTitle')}</Typography>
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