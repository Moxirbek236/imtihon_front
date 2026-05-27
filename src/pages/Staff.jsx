import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, InputAdornment, Checkbox, Stack, Divider, Drawer, Dialog,
  DialogContent, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

export default function Staff() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [editingId, setEditingId] = useState(null);

  async function getStaff() {
    try {
      const statusParam = activeTab === 'active' ? 'active' : 'inactive';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      let url = `/api/v1/users/all?status=${statusParam}&page=${page}&limit=${ITEMS_PER_PAGE}&sort_by=${sortBy}&sort_order=${sortOrder}${searchParam}`;
      const res = await api.get(url);
      const responseData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setStaffList(responseData);
      const pag = res.data?.pagination;
      if (pag) {
        setTotalPages(pag.totalPages || 1);
        setTotalItems(pag.total || responseData.length);
      } else {
        setTotalPages(1);
        setTotalItems(responseData.length);
      }
    } catch (err) {
      console.error("Xodimlarni yuklashda xatolik:", err);
    }
  }

  function openCreateDrawer() {
    setEditingId(null);
    resetForm();
    setIsDrawerOpen(true);
  }

  function openEditDrawer(user) {
    setEditingId(user.id);
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setIsDrawerOpen(true);
  }

  async function handleSubmit() {
    if (editingId) {
      await updateStaff();
    } else {
      await saveStaff();
    }
  }

  async function saveStaff() {
    try {
      if (!form.full_name || !form.email || !form.password || !form.phone) {
        return alert(t('StaffRequiredFields'));
      }
      const res = await api.post('/api/v1/users/admin', {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      if (res.data?.success || res.status === 201) {
        getStaff();
        setIsDrawerOpen(false);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('ManageStaffAdd')));
    }
  }

  async function updateStaff() {
    try {
      if (!form.full_name || !form.email || !form.phone) {
        return alert(t('StaffRequiredFields'));
      }
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      if (form.password) payload.password = form.password.trim();
      const res = await api.put(`/api/v1/users/${editingId}`, payload);
      if (res.data?.success || res.status === 200) {
        getStaff();
        setIsDrawerOpen(false);
        setEditingId(null);
        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(t('ErrorOccurred') + ': ' + (Array.isArray(msg) ? msg.join(', ') : msg || t('ManageStaffEdit')));
    }
  }

  const triggerDelete = (id) => {
    setUserToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/v1/users/${userToDelete}`);
      getStaff();
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('Delete')));
    }
  };

  async function restoreStaff(id) {
    try {
      await api.put(`/api/v1/users/${id}`, { status: 'active' });
      getStaff();
    } catch (err) {
      alert(t('ErrorOccurred') + ': ' + (err.response?.data?.message || t('Restore')));
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', phone: '', address: '' });
  }

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

  const thSortSx = (field) => ({
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': { color: 'var(--primary)' },
  });

  // Bitta useEffect: activeTab, page, sortBy, sortOrder o'zgarganda chaqiriladi
  useEffect(() => {
    getStaff();
  }, [activeTab, page, sortBy, sortOrder]);

  // Search o'zgarganda: page=1 set qiladi, useEffect triggerni o'zi ishlaydi
  useEffect(() => {
    if (searchQuery !== undefined) {
      setPage(1);
    }
  }, [searchQuery]);

  const handleToggleAll = (e) => setSelectedIds(e.target.checked ? staffList.map(u => u.id) : []);
  const handleToggleOne = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU').replaceAll('/', '.') : '-';

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{t('StaffTitle')}</Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', maxWidth: 600 }}>{t('StaffDesc')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}
          sx={{ backgroundColor: 'var(--primary)', textTransform: 'none', borderRadius: '10px', px: 2.5, fontWeight: 700, whiteSpace: 'nowrap', '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
          {t('ManageStaffAdd')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: { xs: 1, sm: 0 } }}>
          {[
            { key: 'active', label: t('StaffActive') },
            { key: 'archive', label: t('Archive'), icon: <CalendarMonthIcon sx={{ fontSize: 16 }} /> }
          ].map(tab => (
            <Button key={tab.key} startIcon={tab.icon}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 2,
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                '&:hover': { backgroundColor: 'transparent', color: 'var(--primary)' } }}>
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
                    checked={staffList.length > 0 && selectedIds.length === staffList.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < staffList.length}
                    sx={{ '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'var(--primary)' } }} />
                </TableCell>
                {[t('StaffName'), t('StaffRole'), t('StaffPhone'), t('StaffEmail'), t('StaffAddress'), t('StaffCreated'), t('Actions')].map(col => (
                  <TableCell key={col} sx={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'var(--gray-400)' }}>{t('NoData')}</TableCell></TableRow>
              ) : staffList.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selectedIds.includes(user.id)}
                      onChange={() => handleToggleOne(user.id)} sx={{ '&.Mui-checked': { color: 'var(--primary)' } }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, backgroundColor: getColor(user.id), fontSize: '0.75rem', fontWeight: 700 }}>
                        {getInitials(user.full_name)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: user.role === 'SUPERADMIN' ? 'var(--warning)' : 'var(--primary)' }}>{user.role}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user.phone}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user.email}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user.address || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(user.created_at)}</Typography></TableCell>
                  <TableCell>
                    {activeTab === 'archive' ? (
                      <Tooltip title={t('Restore')}>
                        <IconButton size="small" onClick={() => restoreStaff(user.id)} sx={{ color: 'var(--success)', '&:hover': { color: 'var(--success-dark)' } }}>
                          <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--primary)' } }} onClick={() => openEditDrawer(user)}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        {user.role !== 'SUPERADMIN' && (
                          <IconButton size="small" sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--danger)' } }} onClick={() => triggerDelete(user.id)}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <Button size="small" startIcon={<KeyboardArrowLeftIcon />} disabled={page === 1}
            onClick={() => setPage(p => p - 1)} sx={{ textTransform: 'none', color: 'var(--gray-700)' }}>{t('Previous')}</Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? t('ManageStaffEdit') : t('ManageStaffAdd')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {editingId ? t('ManageStaffEditDesc') : t('ManageStaffAddDesc')}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StaffFullName')} *</Typography>
              <TextField fullWidth size="small" placeholder={t('StaffFullNamePlaceholder')}
                value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StaffPhone')} *</Typography>
              <TextField fullWidth size="small" placeholder={t('StaffPhonePlaceholder')}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StaffEmail')} *</Typography>
              <TextField fullWidth size="small" placeholder={t('StaffEmailPlaceholder')}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>{t('StaffAddress')}</Typography>
              <TextField fullWidth size="small" placeholder={t('StaffAddressPlaceholder')}
                value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-700)' }}>
                {editingId ? t('StaffPasswordOptional') : t('StaffPasswordRequired')} *
              </Typography>
              <TextField fullWidth size="small" type="password" placeholder={t('StaffPasswordPlaceholder')}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setIsDrawerOpen(false)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--gray-700)' }}>
            {t('Cancel')}
          </Button>
          <Button fullWidth variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
            {t('Save')}
          </Button>
        </Box>
      </Drawer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '8px', width: '420px', maxWidth: '90vw', boxShadow: 'var(--shadow-lg)' } }}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <DeleteOutlineIcon sx={{ fontSize: 32, color: 'var(--danger)' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', mb: 1.5 }}>{t('ConfirmArchive')}</Typography>
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