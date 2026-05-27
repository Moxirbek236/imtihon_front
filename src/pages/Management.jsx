import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Tab, Tabs } from '@mui/material';
import Courses from './Courses';
import Rooms from './Rooms';
import Staff from './Staff';
import '../i18n';

const tabs = [
  'Kurslar', 'Xonalar', 'Filiallar', 'Xodimlar', 'Sabablar',
  'Rollar', 'Coin', 'Xabar yuborish', 'Tekshiruv'
];

const PATH_TO_TAB = {
  '/management': 0,
  '/management/courses': 0,
  '/management/rooms': 1,
  '/management/branches': 2,
  '/management/staff': 3,
  '/management/reasons': 4,
  '/management/roles': 5,
  '/management/coin': 6,
  '/management/messages': 7,
  '/management/check': 8,
};

const TAB_TO_PATH = [
  '/management',
  '/management/rooms',
  '/management/branches',
  '/management/staff',
  '/management/reasons',
  '/management/roles',
  '/management/coin',
  '/management/messages',
  '/management/check',
];

export default function Management() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const activeTab = PATH_TO_TAB[location.pathname] ?? 0;

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <Courses />;
      case 1: return <Rooms />;
      case 3: return <Staff />;
      default:
        return (
          <Box sx={{ p: 10, textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('ManagementEmpty')} "{t(tabs[activeTab])}"
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>{t('ManagementTitle')}</Typography>

      {/* Horizontal Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => navigate(TAB_TO_PATH[v])}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { textTransform: 'none', minWidth: 0, px: 2, fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-400)', mr: 2 },
            '& .Mui-selected': { color: 'var(--primary) !important' }
          }}
        >
          {tabs.map(tab => <Tab key={tab} label={t(tab)} />)}
        </Tabs>
      </Box>

      {renderContent()}
    </Box>
  );
}