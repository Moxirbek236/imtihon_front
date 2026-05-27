import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper,
  Drawer, TextField, Stack, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import '../i18n';

export default function Rooms() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', capacity: '' });
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const initialized = useRef(false);

  async function getRooms() {
    const res = await api.get(`/api/v1/rooms?status=${activeTab}`);
    setRooms(res.data || []);
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getRooms();
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      getRooms();
    }
  }, [activeTab]);

  function openCreateDrawer() {
    setEditingId(null);
    setForm({ name: '', capacity: '' });
    setIsDrawerOpen(true);
  }

  function openEditDrawer(room) {
    setEditingId(room.id);
    setForm({ name: room.name, capacity: room.capacity });
    setIsDrawerOpen(true);
  }

  async function handleSubmit() {
    if (editingId) {
      await updateRoom(editingId);
    } else {
      await createRoom();
    }
  }

  async function createRoom() {
    await api.post("/api/v1/rooms", { name: form.name, capacity: Number(form.capacity) });
    setIsDrawerOpen(false);
    setForm({ name: '', capacity: '' });
    getRooms();
  }

  const triggerDelete = (id) => {
    setRoomToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      await api.delete(`/api/v1/rooms/${roomToDelete}`);
      getRooms();
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    } catch (e) {
      alert(t('ErrorOccurred') + ': ' + (e.response?.data?.message || t('Delete')));
    }
  };

  async function restoreRoom(id) {
    try {
      await api.put(`/api/v1/rooms/${id}`, { status: 'active' });
      getRooms();
    } catch (e) {
      alert(t('ErrorOccurred') + ': ' + (e.response?.data?.message || t('Restore')));
    }
  }

  async function updateRoom(id) {
    await api.put(`/api/v1/rooms/${id}`, { name: form.name, capacity: Number(form.capacity) });
    setIsDrawerOpen(false);
    setForm({ name: '', capacity: '' });
    setEditingId(null);
    getRooms();
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t('ManagementRooms')}</Typography>
            <IconButton size="small" onClick={getRooms}><RefreshIcon sx={{ fontSize: 18, color: 'var(--gray-500)' }} /></IconButton>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3, py: 1, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
            {t('AddRoomBtn')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
          {[
            { key: 'active', label: t('ManagementRooms') },
            { key: 'inactive', label: t('Archive'), icon: <CalendarMonthIcon sx={{ fontSize: 16 }} /> }
          ].map(tab => (
            <Button key={tab.key} startIcon={tab.icon}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 2,
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                '&:hover': { backgroundColor: 'transparent', color: 'var(--primary)' },
                whiteSpace: 'nowrap'
              }}>
              {tab.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: '20px' }}>
          {rooms.map(room => (
            <Box key={room.id}>
              <Paper elevation={0} sx={{ p: 3, border: '2px solid var(--surface-muted)', borderRadius: '8px', backgroundColor: 'var(--surface)', '&:hover': { borderColor: 'var(--primary-light)', boxShadow: 'var(--shadow-md)' }, transition: 'all 0.3s' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', mb: 0.5 }}>{room.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('RoomCapacity')}: {room.capacity}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {activeTab === 'inactive' ? (
                      <Tooltip title={t('Restore')}>
                        <IconButton size="small" onClick={() => restoreRoom(room.id)} sx={{ color: 'var(--success)', '&:hover': { color: 'var(--success-dark)' } }}>
                          <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <IconButton size="small" onClick={() => triggerDelete(room.id)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--danger)' } }}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => openEditDrawer(room)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--primary)' } }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Paper>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        sx={{ zIndex: 2000 }}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, borderRadius: { xs: 0, sm: '24px 0 0 24px' } } }}>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{editingId ? t('RoomEdit') : t('RoomAdd')}</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {editingId ? t('RoomEditDesc') : t('RoomAddDesc')}
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('RoomName')}</Typography>
              <TextField fullWidth placeholder={t('RoomExample')}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('RoomCapacity')}</Typography>
              <TextField fullWidth type="number" placeholder={t('RoomCapacityPlaceholder')}
                value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Button fullWidth variant="outlined" onClick={() => setIsDrawerOpen(false)}
                sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none', borderColor: 'var(--border)', color: 'var(--gray-700)' }}>
                {t('Cancel')}
              </Button>
              <Button fullWidth variant="contained" onClick={handleSubmit}
                sx={{ backgroundColor: 'var(--primary)', py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none', '&:hover': { backgroundColor: 'var(--primary-hover)' } }}>
                {t('Save')}
              </Button>
            </Stack>
          </Stack>
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