
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

/**
 * --- アイコンコンポーネント ---
 */
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
);
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

/**
 * --- 定数定義 ---
 */
const SHIFT_DEFINITIONS = [
  { id: 'early', label: '早番', color: '#f59e0b' },
  { id: 'day', label: '日勤', color: '#fbbf24' },
  { id: 'late', label: '遅番', color: '#d97706' },
  { id: 'evening', label: '準夜', color: '#60a5fa' },
  { id: 'night', label: '深夜', color: '#818cf8' },
  { id: 'off', label: '休日', color: '#f87171' },
];

const DEFAULT_THEME = {
  primary: '#6366f1',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  subtext: '#64748b',
  border: '#e2e8f0',
  holiday: '#ef4444',
  sunday: '#ef4444',
  saturday: '#3b82f6',
};

const AD_HEIGHT = 60; // 広告エリアの高さ

/**
 * --- ヘルパー関数 ---
 */
const getJapaneseHolidays = (year) => {
  return [
    { date: `${year}-01-01`, name: "元日" },
    { date: `${year}-01-08`, name: "成人の日" },
    { date: `${year}-02-11`, name: "建国記念の日" },
    { date: `${year}-02-23`, name: "天皇誕生日" },
    { date: `${year}-03-20`, name: "春分の日" },
    { date: `${year}-04-29`, name: "昭和の日" },
    { date: `${year}-05-03`, name: "憲法記念日" },
    { date: `${year}-05-04`, name: "みどりの日" },
    { date: `${year}-05-05`, name: "こどもの日" },
    { date: `${year}-07-15`, name: "海の日" },
    { date: `${year}-08-11`, name: "山の日" },
    { date: `${year}-09-16`, name: "敬老の日" },
    { date: `${year}-09-22`, name: "秋分の日" },
    { date: `${year}-10-14`, name: "スポーツの日" },
    { date: `${year}-11-03`, name: "文化の日" },
    { date: `${year}-11-23`, name: "勤労感謝の日" },
  ];
};

/**
 * --- コンポーネント ---
 */
const TabButton = ({ active, Icon, label, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-90 ${
      active ? 'opacity-100' : 'opacity-40'
    }`}
    style={{ color: active ? theme.primary : theme.subtext }}
  >
    <Icon />
    <span className="text-[10px] mt-1 font-bold">{label}</span>
  </button>
);

const App = () => {
  // --- ステート管理 ---
  const [currentView, setCurrentView] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem('shifts_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem('memos_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme_data');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [selectedShiftType, setSelectedShiftType] = useState('early');
  const [isEditMode, setIsEditMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    localStorage.setItem('shifts_data', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('memos_data', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('theme_data', JSON.stringify(theme));
  }, [theme]);

  const holidays = useMemo(() => getJapaneseHolidays(currentMonth.getFullYear()), [currentMonth]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dashboardData = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const monthlyShifts = shifts.filter(s => s.date.startsWith(monthStr));
    
    const stats = SHIFT_DEFINITIONS.map(def => ({
      name: def.label,
      value: monthlyShifts.filter(s => s.shiftId === def.id).length,
      color: def.color
    }));
    
    return stats.filter(s => s.value > 0);
  }, [shifts, currentMonth]);

  const handleDayClick = useCallback((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDateStr(dateStr);
    
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(startOfMonth(date));
    }

    if (isEditMode) {
      setShifts(prev => {
        const existingIdx = prev.findIndex(s => s.date === dateStr);
        if (existingIdx > -1) {
          const newShifts = [...prev];
          if (newShifts[existingIdx].shiftId === selectedShiftType) {
            newShifts.splice(existingIdx, 1);
          } else {
            newShifts[existingIdx].shiftId = selectedShiftType;
          }
          return newShifts;
        }
        return [...prev, { date: dateStr, shiftId: selectedShiftType }];
      });
    }
  }, [isEditMode, selectedShiftType, currentMonth]);

  const updateMemo = (text) => {
    setMemos(prev => ({
      ...prev,
      [selectedDateStr]: text
    }));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleTouchStart = (e) => {
    if (!e.targetTouches[0]) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextMonth();
    if (isRightSwipe) prevMonth();
    setTouchStart(null);
  };

  const updateTheme = (key, color) => {
    setTheme(prev => ({ ...prev, [key]: color }));
  };

  const renderCalendar = () => (
    <div className="flex flex-col h-full select-none overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 py-3 border-b bg-white" 
        style={{ borderColor: theme.border }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={prevMonth} className="p-2 rounded-full active:bg-gray-100 transition-colors" style={{ color: theme.subtext }}>
          <ChevronLeft />
        </button>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: theme.text }}>
          {format(currentMonth, 'yyyy年 MM月', { locale: ja })}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full active:bg-gray-100 transition-colors" style={{ color: theme.subtext }}>
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center py-1.5 border-b text-[10px] font-bold" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={day} style={{ color: i === 0 ? theme.sunday : i === 6 ? theme.saturday : theme.subtext }}>
            {day}
          </div>
        ))}
      </div>

      <div 
        className="flex-1 grid grid-cols-7 grid-rows-6 bg-white overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {monthDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelectedMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = dateStr === selectedDateStr;
          const holiday = holidays.find(h => h.date === dateStr);
          const shift = shifts.find(s => s.date === dateStr);
          const shiftDef = shift ? SHIFT_DEFINITIONS.find(d => d.id === shift.shiftId) : null;
          const isToday = isSameDay(day, new Date());
          const hasMemo = !!memos[dateStr];

          let dayColor = theme.text;
          if (day.getDay() === 0 || holiday) dayColor = theme.holiday;
          if (day.getDay() === 6) dayColor = theme.saturday;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`relative flex flex-col items-center justify-start border-b border-r py-1 active:bg-opacity-50 transition-colors ${
                !isSelectedMonth ? 'opacity-25' : ''
              }`}
              style={{ 
                borderColor: theme.border,
                backgroundColor: isSelectedDay ? `${theme.primary}20` : (isToday ? `${theme.primary}08` : 'transparent')
              }}
            >
              {hasMemo && (
                <div 
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}

              <span 
                className={`text-[11px] font-semibold z-10 transition-all ${isToday ? 'rounded-full px-1.5' : ''}`}
                style={{ 
                  backgroundColor: isToday ? theme.primary : 'transparent',
                  color: isToday ? '#fff' : dayColor
                }}
              >
                {day.getDate()}
              </span>
              
              {holiday && (
                <div className="text-[7px] scale-75 truncate w-full text-center mt-[-2px] px-0.5" style={{ color: theme.holiday }}>
                  {holiday.name}
                </div>
              )}

              <div className="absolute bottom-1 flex flex-col items-center w-full px-0.5">
                {shiftDef && (
                  <div 
                    className="w-full text-center rounded py-0.5 text-[8px] font-bold shadow-sm"
                    style={{ backgroundColor: shiftDef.color, color: '#fff' }}
                  >
                    {shiftDef.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t bg-white flex flex-col min-h-[140px] shadow-lg" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b" style={{ borderColor: theme.border }}>
           <span className="text-[11px] font-bold tracking-tighter" style={{ color: theme.text }}>
             {format(parseISO(selectedDateStr), 'yyyy年MM月dd日(eee)', { locale: ja })}
           </span>
           <button 
             onClick={() => setIsEditMode(!isEditMode)}
             className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm active:scale-95 ${
               isEditMode ? 'text-white' : ''
             }`}
             style={{ 
               backgroundColor: isEditMode ? theme.primary : `${theme.subtext}15`,
               color: isEditMode ? '#fff' : theme.text
             }}
           >
             {isEditMode ? "スタンプ完了" : "スタンプ編集"}
           </button>
        </div>

        <div className="flex-1 p-2 overflow-hidden relative">
          {isEditMode ? (
            <div className="grid grid-cols-3 gap-2 h-full items-center">
              {SHIFT_DEFINITIONS.map(def => (
                <button
                  key={def.id}
                  onClick={() => {
                    setSelectedShiftType(def.id);
                    handleDayClick(parseISO(selectedDateStr));
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl transition-all h-[42px] active:scale-95 ${
                    selectedShiftType === def.id ? 'shadow-md ring-2' : 'opacity-60'
                  }`}
                  // Fix: Casting style object to any or React.CSSProperties to allow custom CSS properties like '--tw-ring-color'
                  style={{ 
                    backgroundColor: def.color,
                    '--tw-ring-color': theme.primary,
                    border: selectedShiftType === def.id ? `2px solid white` : 'none'
                  } as React.CSSProperties}
                >
                  <span className="text-[10px] font-bold text-white leading-none">{def.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full h-full p-2.5 text-sm rounded-xl border focus:outline-none bg-gray-50 resize-none transition-all focus:bg-white"
              placeholder="メモを入力..."
              value={memos[selectedDateStr] || ""}
              onChange={(e) => updateMemo(e.target.value)}
              style={{ borderColor: theme.border, color: theme.text }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-4" style={{ backgroundColor: theme.background }}>
      <div className="mb-6 p-5 rounded-3xl shadow-sm bg-white" style={{ backgroundColor: theme.card }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
          集計 <span className="opacity-50 text-[10px]">{format(currentMonth, 'yyyy年MM月')}</span>
        </h3>
        <div className="h-56">
          {dashboardData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {dashboardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs opacity-40 italic">
              データがありません
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-24">
        {SHIFT_DEFINITIONS.map(def => {
          const count = dashboardData.find(d => d.name === def.label)?.value || 0;
          return (
            <div 
              key={def.id} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white shadow-sm transition-all active:scale-95"
              style={{ backgroundColor: theme.card }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: def.color }} />
                <span className="text-[10px] font-bold" style={{ color: theme.text }}>{def.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold" style={{ color: theme.text }}>{count}</span>
                <span className="text-[8px] opacity-40">日</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-24" style={{ backgroundColor: theme.background }}>
      <div className="p-5 rounded-3xl bg-white shadow-sm space-y-4" style={{ backgroundColor: theme.card }}>
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: theme.text }}>
          カラー設定
        </h3>

        <div className="space-y-3">
          {Object.entries(theme).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-[11px] font-semibold" style={{ color: theme.subtext }}>
                {key === 'primary' ? 'メインカラー' :
                 key === 'background' ? 'アプリ背景' :
                 key === 'card' ? 'カード背景' :
                 key === 'text' ? '通常文字' :
                 key === 'subtext' ? '薄い文字' :
                 key === 'border' ? '境界線' :
                 key === 'holiday' ? '休日・祝日' :
                 key === 'sunday' ? '日曜日' :
                 key === 'saturday' ? '土曜日' : key}
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={String(value)}
                  onChange={(e) => updateTheme(key, e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-100 p-0 overflow-hidden shadow-sm"
                  style={{ backgroundColor: String(value) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button 
            onClick={() => {
              if (window.confirm('すべての設定を初期状態に戻しますか？')) setTheme(DEFAULT_THEME);
            }}
            className="w-full py-3 rounded-2xl text-[11px] font-bold active:scale-95 transition-all shadow-sm border"
            style={{ borderColor: `${theme.primary}40`, color: theme.primary, backgroundColor: `${theme.primary}08` }}
          >
            設定をリセット
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col h-screen overflow-hidden" style={{ backgroundColor: theme.background }}>
      <main className="flex-1 relative overflow-hidden">
        {currentView === 'calendar' && renderCalendar()}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'settings' && renderSettings()}
      </main>

      <nav 
        className="flex justify-around items-center border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.03)]" 
        style={{ borderColor: theme.border, height: '64px' }}
      >
        <TabButton 
          active={currentView === 'calendar'} 
          Icon={CalendarIcon} 
          label="カレンダー" 
          onClick={() => {
            setCurrentView('calendar');
            setIsEditMode(false);
          }} 
          theme={theme}
        />
        <TabButton 
          active={currentView === 'dashboard'} 
          Icon={ChartIcon} 
          label="統計" 
          onClick={() => {
            setCurrentView('dashboard');
            setIsEditMode(false);
          }} 
          theme={theme}
        />
        <TabButton 
          active={currentView === 'settings'} 
          Icon={SettingsIcon} 
          label="設定" 
          onClick={() => {
            setCurrentView('settings');
            setIsEditMode(false);
          }} 
          theme={theme}
        />
      </nav>

      {/* 広告表示エリア (Monacaでの広告表示を想定) */}
      <div 
        className="w-full bg-gray-200 border-t flex items-center justify-center z-50 shadow-inner"
        style={{ height: `${AD_HEIGHT}px`, borderColor: theme.border }}
      >
        <span className="text-[10px] text-gray-500 font-bold tracking-widest">広告表示エリア</span>
      </div>
      
      {/* セーフエリア対策 */}
      <div className="h-[env(safe-area-inset-bottom)] bg-gray-200" />
    </div>
  );
};

export default App;
