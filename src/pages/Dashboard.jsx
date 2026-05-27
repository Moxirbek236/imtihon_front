import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../i18n';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 2;
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

const CSS = `
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes barFill { from { width: 0%; } to { width: var(--bar-w); } }
  @keyframes spin { to { transform:rotate(360deg); } }

  .dash-root { font-family: 'Inter', sans-serif; color: var(--text-primary); }
  .dash-cards { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
  .dash-card {
    flex: 1 1 150px;
    min-width: 140px;
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 20px 18px;
    border: 1px solid var(--border);
    animation: fadeIn .4s ease both;
  }
  .dash-card-icon {
    width: 40px; height: 40px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    margin-bottom: 12px;
    background: var(--primary-light);
    color: var(--primary);
  }
  .dash-card-label {
    font-size: .72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .5px;
    color: var(--gray-400); margin-bottom: 4px;
  }
  .dash-card-value {
    font-size: 1.75rem; font-weight: 700;
    color: var(--text-primary); line-height: 1;
  }
  .dash-bottom { display:flex; gap:16px; flex-wrap:wrap; }
  .dash-panel {
    flex: 1 1 280px;
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    overflow: hidden;
    animation: fadeIn .5s ease both;
  }
  .dash-panel-header {
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--surface-muted);
    display: flex; align-items: center; justify-content: space-between;
  }
  .dash-panel-title { font-size: .875rem; font-weight: 600; color: var(--text-primary); }
  .dash-panel-body { padding: 12px 16px; }
  .dash-actions { display:flex; flex-wrap:wrap; gap:8px; padding:14px; }
  .dash-action-btn {
    flex: 1 1 110px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px;
    padding: 14px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    transition: border-color .15s, background .15s;
    font-size: .78rem; font-weight: 500; color: var(--gray-700);
    font-family: 'Inter', sans-serif;
    text-align: center;
  }
  .dash-action-btn:hover { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
  .dash-action-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    background: var(--gray-100);
    color: var(--gray-500);
  }
  .dash-action-btn:hover .dash-action-icon { color: var(--primary); }
  .bar-row { margin-bottom: 14px; }
  .bar-label-row { display:flex; justify-content:space-between; margin-bottom:5px; }
  .bar-label { font-size: .78rem; font-weight: 500; color: var(--gray-700); }
  .bar-pct { font-size: .78rem; font-weight: 600; color: var(--primary); }
  .bar-track { height: 6px; border-radius: 99px; background: var(--gray-100); overflow:hidden; }
  .bar-fill {
    height: 100%; border-radius: 99px;
    width: var(--bar-w);
    background: var(--primary);
    animation: barFill .8s ease both;
  }
  .activity-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--gray-50);
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; background: var(--primary); }
  .activity-text { font-size: .82rem; color: var(--gray-700); font-weight: 500; line-height: 1.4; }
  .activity-time { font-size: .72rem; color: var(--gray-400); margin-top: 2px; }
  .dash-spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation: spin .7s linear infinite; }
  .dash-badge {
    display: inline-flex; align-items:center; justify-content:center;
    height: 20px; padding: 0 8px;
    border-radius: 4px;
    font-size: .68rem; font-weight: 600;
    background: var(--primary-light); color: var(--primary);
  }
`;

function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString('uz-UZ');
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { key: 'GoodNight', emoji: '🌙' };
  if (h < 12) return { key: 'GoodMorning', emoji: '☀️' };
  if (h < 17) return { key: 'GoodAfternoon', emoji: '👋' };
  return { key: 'GoodEvening', emoji: '🌇' };
}

function getUserName() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.firstName || u.first_name || u.name || 'Admin';
    }
  } catch { }
  return 'Admin';
}

function StatCard({ icon, label, value, delay = 0 }) {
  const animated = useCountUp(Number(value) || 0);
  return (
    <div className="dash-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="dash-card-icon">{icon}</div>
      <div className="dash-card-label">{label}</div>
      <div className="dash-card-value">{fmtNum(animated)}</div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button className="dash-action-btn" onClick={onClick}>
      <div className="dash-action-icon">{icon}</div>
      {label}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { key: greetingKey, emoji } = getGreeting();
  const userName = getUserName();
  const initialized = useRef(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        const res = await api.get('/api/v1/dashboard/stats');
        setStats(res.data?.data || res.data);
      } catch {
        setStats({ groups: 0, courses: 0, students: 0, teachers: 0, rooms: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = stats ? [
    { icon: <SchoolIcon sx={{ fontSize: 20 }} />, label: t('StatStudents'), value: stats.students ?? 0, delay: 0 },
    { icon: <PeopleIcon sx={{ fontSize: 20 }} />, label: t('StatTeachers'), value: stats.teachers ?? 0, delay: 50 },
    { icon: <GroupIcon sx={{ fontSize: 20 }} />, label: t('StatGroups'), value: stats.groups ?? 0, delay: 100 },
    { icon: <LibraryBooksIcon sx={{ fontSize: 20 }} />, label: t('StatCourses'), value: stats.courses ?? 0, delay: 150 },
    { icon: <MeetingRoomIcon sx={{ fontSize: 20 }} />, label: t('StatRooms'), value: stats.rooms ?? 0, delay: 200 },
  ] : [];

  const bars = [
    { label: t('ActiveStudentsRate'), pct: stats?.activeStudentsRate ?? 0 },
    { label: t('AttendanceRate'), pct: stats?.attendanceRate ?? 0 },
    { label: t('HomeworkCompletionRate'), pct: stats?.homeworkCompletionRate ?? 0 },
    { label: t('CourseOccupancyRate'), pct: stats?.courseOccupancyRate ?? 0 },
  ];

  const getFmtAgo = (dateStr) => {
    if (!dateStr) return '—';
    const minAgo = Math.max(1, Math.round((new Date() - new Date(dateStr)) / 60000));
    if (minAgo < 60) return `${minAgo} ${t('MinutesAgo')}`;
    const h = Math.round(minAgo / 60);
    if (h < 24) return `${h} ${t('HoursAgo')}`;
    return `${Math.round(h / 24)} ${t('DaysAgo')}`;
  };

  const activities = stats?.recentActivity?.length > 0
    ? stats.recentActivity.map(a => ({ text: a.text, time: getFmtAgo(a.date) }))
    : [{ text: t('NoRecentActivity'), time: '—' }];

  const actions = [
    { icon: <PersonAddIcon />, label: t('AddStudent'), path: '/students' },
    { icon: <GroupAddIcon />, label: t('AddGroup'), path: '/groups' },
    { icon: <PersonIcon />, label: t('AddTeacher'), path: '/teachers' },
    { icon: <LibraryBooksIcon />, label: t('AddCourse'), path: '/management' },
  ];

  return (
    <div className="dash-root">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t(greetingKey)}, {userName}! {emoji}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 3 }}>
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <div className="dash-spinner" /> {t('Loading')}
        </div>
      ) : (
        <div className="dash-cards">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Panels */}
      <div className="dash-bottom">
        <div className="dash-panel" style={{ flex: '0 1 300px' }}>
          <div className="dash-panel-header">
            <span className="dash-panel-title">{t('DashboardQuickActions')}</span>
          </div>
          <div className="dash-actions">
            {actions.map(a => (
              <ActionBtn key={a.label} icon={a.icon} label={a.label} onClick={() => navigate(a.path)} />
            ))}
          </div>
        </div>

        <div className="dash-panel" style={{ flex: '1 1 260px' }}>
          <div className="dash-panel-header">
            <span className="dash-panel-title">{t('DashboardStats')}</span>
            <span className="dash-badge">{new Date().toLocaleString('uz-UZ', { month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="dash-panel-body">
            {bars.map(b => (
              <div className="bar-row" key={b.label}>
                <div className="bar-label-row">
                  <span className="bar-label">{b.label}</span>
                  <span className="bar-pct">{b.pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ '--bar-w': `${b.pct}%`, animationDelay: '200ms' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel" style={{ flex: '1 1 260px' }}>
          <div className="dash-panel-header">
            <span className="dash-panel-title">{t('DashboardRecentActivity')}</span>
            <span className="dash-badge">{t('DashboardToday')}</span>
          </div>
          <div className="dash-panel-body">
            {activities.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}