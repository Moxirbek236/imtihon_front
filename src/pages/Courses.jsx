import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  Box, Typography, Button, IconButton, Paper, Chip,
  Drawer, TextField, Stack, Select, MenuItem, FormControl, InputAdornment, Divider,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import '../i18n';

const colorOptions = [
  '#1e293b', '#6A50E8', '#ef4444', '#f97316', '#16a34a',
  '#0891b2', '#6366f1', '#ec4899'
];
const lessonDurations = ['60 min', '75 min', '90 min', '120 min', '240 min'];
const courseDurations = ['1 oy', '2 oy', '3 oy', '4 oy', '6 oy', '8 oy', '12 oy'];

export default function Courses() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    lessonDuration: '',
    courseDuration: '',
    price: '',
    description: '',
    color: '#6A50E8',
  });

  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const initialized = useRef(false);

  async function getCourses() {
    const res = await api.get(`/api/v1/courses/all?status=${activeTab}`);
    setCourses(res.data || []);
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getCourses();
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      getCourses();
    }
  }, [activeTab]);

  function openCreateDrawer() {
    setEditingId(null);
    setForm({
      name: '',
      lessonDuration: '',
      courseDuration: '',
      price: '',
      description: '',
      color: '#6A50E8',
    });
    setIsDrawerOpen(true);
  }

  function openEditDrawer(course) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      lessonDuration: `${course.duration_hours * 60} min`,
      courseDuration: `${course.duration_month} oy`,
      price: course.price,
      description: course.description,
      color: '#6A50E8',
    });
    setIsDrawerOpen(true);
  }

  async function handleSubmit() {
    if (editingId) {
      await updateCourse();
    } else {
      await addCourse();
    }
  }

  async function addCourse() {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_hours: (parseInt(form.lessonDuration) || 0) / 60,
        duration_month: parseInt(form.courseDuration) || 0,
      };
      await api.post("/api/v1/courses/courses", payload);
      getCourses();
      setIsDrawerOpen(false);
  }

  async function updateCourse() {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_hours: (parseInt(form.lessonDuration) || 0) / 60,
        duration_month: parseInt(form.courseDuration) || 0,
      };
      await api.put(`/api/v1/courses/${editingId}`, payload);
      getCourses();
      setIsDrawerOpen(false);
      setEditingId(null);
  }

  const triggerDelete = (id) => {
    setCourseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/api/v1/courses/${courseToDelete}`);
      getCourses();
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    } catch (e) {
      alert(t('ErrorOccurred') + ': ' + (e.response?.data?.message || t('Delete')));
    }
  };

  async function restoreCourse(id) {
    try {
      await api.put(`/api/v1/courses/${id}`, { status: 'active' });
      getCourses();
    } catch (e) {
      alert(t('ErrorOccurred') + ': ' + (e.response?.data?.message || t('Restore')));
    }
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t('ManagementCourses')}</Typography>
            <IconButton size="small" onClick={getCourses}><RefreshIcon sx={{ fontSize: 18, color: 'var(--gray-500)' }} /></IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDrawer}
            sx={{ backgroundColor: 'var(--primary)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3, py: 1, '&:hover': { backgroundColor: 'var(--primary-hover)' } }}
          >
            {t('AddCourseBtn')}
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
          {[
            { key: 'active', label: t('ManagementCourses') },
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
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Course cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: '20px'
        }}>
          {courses.map(course => (
            <Box key={course.id}>
              <Paper elevation={0} sx={{
                p: 2.5,
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: colorOptions[course.id % colorOptions.length] + '22',
                borderColor: colorOptions[course.id % colorOptions.length],
                '&:hover': { boxShadow: 'var(--shadow-md)' },
                transition: 'all 0.3s',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {course.name}
                  </Typography>
                  <Stack direction="row" spacing={0} sx={{ flexShrink: 0, ml: 1, mt: -0.5 }}>
                    {activeTab === 'inactive' ? (
                      <Tooltip title={t('Restore')}>
                        <IconButton size="small" onClick={() => restoreCourse(course.id)} sx={{ color: 'var(--success)', '&:hover': { color: 'var(--success-dark)' }, p: 0.5 }}>
                          <RefreshIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <IconButton size="small" onClick={() => triggerDelete(course.id)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--danger)' }, p: 0.5 }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => openEditDrawer(course)} sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--primary)' }, p: 0.5 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Box>

                <Typography variant="caption" sx={{
                  color: 'var(--text-secondary)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  mb: 1.5, display: 'block'
                }}>
                  {course.description}
                </Typography>

                <Stack direction="row" spacing={1}>
                  {[
                    `${course.duration_hours * 60} ${t('Minute')}`,
                    `${course.duration_month} ${t('Month')}`,
                    `${course.price} ${t('Million')}`
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ 
                      backgroundColor: 'var(--surface)', 
                      border: '1px solid', borderColor: 'inherit',
                      borderRadius: '10px', px: 1.2, py: 0.4,
                      display: 'flex', alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <Typography variant="caption" sx={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.7rem' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Drawer */}
      <Drawer 
        anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        sx={{ zIndex: 2000 }}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderRadius: { xs: 0, sm: '24px 0 0 24px' } } }}>
        <Box sx={{ p: { xs: 3, sm: 4 }, overflowY: 'auto', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{editingId ? t('CourseEdit') : t('CourseAdd')}</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {editingId ? t('CourseEditDesc') : t('CourseAddDesc')}
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('CourseNameLabel')}</Typography>
              <TextField fullWidth placeholder={t('CourseNamePlaceholder')}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('CourseDurationLabel')}</Typography>
              <FormControl fullWidth>
                <Select displayEmpty value={form.lessonDuration}
                  onChange={e => setForm(p => ({ ...p, lessonDuration: e.target.value }))}
                  sx={{ borderRadius: '8px' }}
                  MenuProps={{ sx: { zIndex: 3000 } }}
                  renderValue={v => v || <span style={{ color: 'var(--gray-400)' }}>{t('CourseDurationSelect')}</span>}>
                  {lessonDurations.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('CourseDurationMonthLabel')}</Typography>
              <FormControl fullWidth>
                <Select displayEmpty value={form.courseDuration}
                  onChange={e => setForm(p => ({ ...p, courseDuration: e.target.value }))}
                  sx={{ borderRadius: '8px' }}
                  MenuProps={{ sx: { zIndex: 3000 } }}
                  renderValue={v => v || <span style={{ color: 'var(--gray-400)' }}>{t('CourseDurationSelect')}</span>}>
                  {courseDurations.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('CoursePriceLabel')}</Typography>
              <TextField fullWidth placeholder={t('CoursePricePlaceholder')}
                value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: 'var(--gray-400)', fontSize: 20 }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'var(--gray-700)' }}>{t('CourseDescLabel')}</Typography>
              <TextField fullWidth multiline rows={3}
                placeholder={t('CourseDescPlaceholder')}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--gray-700)' }}>{t('CourseColorLabel')}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--gray-400)', display: 'block', mb: 1.5 }}>{t('CourseColorHint')}</Typography>
              <Stack direction="row" spacing={1.5}>
                {colorOptions.map(color => (
                  <Box key={color} onClick={() => setForm(p => ({ ...p, color }))}
                    sx={{
                      width: 32, height: 32, borderRadius: '50%', backgroundColor: color,
                      cursor: 'pointer',
                      border: form.color === color ? '3px solid var(--primary)' : '3px solid transparent',
                      outline: form.color === color ? '2px solid var(--surface)' : 'none',
                      outlineOffset: '-4px',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.15)' }
                    }} />
                ))}
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" spacing={2}>
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

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '8px', width: '420px', maxWidth: '90vw', boxShadow: 'var(--shadow-lg)' } }}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <DeleteOutlineIcon sx={{ fontSize: 32, color: 'var(--danger)' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', mb: 1.5 }}>
              {t('ConfirmArchive')}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, mb: 4 }}>
              {t('ArchiveConfirmMessage')}
            </Typography>
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