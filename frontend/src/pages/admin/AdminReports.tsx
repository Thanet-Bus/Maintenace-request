import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './AdminReports.module.css';
import { useAdminRequests } from '../../hooks/admin/useAdminRequests';
import { useTechnicians } from '../../hooks/admin/useTechnicians';

interface DailyRequestData {
  date: string;
  label: string;
  count: number;
}

interface TechnicianScoreData {
  id: number;
  name: string;
  initials: string;
  score: number;
  activeJobsCount: number;
}

interface RequestsPerDayChartProps {
  data: DailyRequestData[];
}

interface TechnicianScoreGraphProps {
  technicians: TechnicianScoreData[];
}

const rangeOptions = [
  { value: 7, label: '7 วันล่าสุด' },
  { value: 14, label: '14 วันล่าสุด' },
  { value: 30, label: '30 วันล่าสุด' },
  { value: 90, label: '90 วันล่าสุด' },
];

const statusLabels: Record<string, string> = {
  PENDING: 'รอดำเนินการ',
  ASSIGNED: 'มอบหมายแล้ว',
  IN_PROGRESS: 'กำลังซ่อม',
  ON_HOLD: 'พักงาน',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
};

const getDateKey = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const getShortDateLabel = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Bangkok'
});

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const getScoreColor = (score: number) => {
  if (score >= 4.5) return 'var(--color-status-success)';
  if (score >= 3.5) return 'var(--color-primary)';
  if (score >= 2.5) return '#f59e0b';
  return 'var(--color-status-cancelled)';
};

const RequestsPerDayChart: React.FC<RequestsPerDayChartProps> = ({ data }) => {
  const chartWidth = 760;
  const chartHeight = 260;
  const chartLeft = 48;
  const chartRight = 24;
  const chartTop = 24;
  const chartBottom = 48;
  const innerWidth = chartWidth - chartLeft - chartRight;
  const innerHeight = chartHeight - chartTop - chartBottom;
  const maxCount = Math.max(...data.map(item => item.count), 1);
  const step = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.max(12, step - 10);
  const labelStep = data.length > 10 ? 2 : 1;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className="material-symbols-outlined">inbox</span>
        ยังไม่มีข้อมูลใบแจ้งซ่อมในช่วงที่เลือก
      </div>
    );
  }

  return (
    <div className={styles.chartFrame}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="กราฟจำนวนใบแจ้งซ่อมรายวัน">
        {gridLines.map((ratio) => {
          const y = chartTop + innerHeight - innerHeight * ratio;
          const value = Math.round(maxCount * ratio);

          return (
            <g key={ratio}>
              <line className={styles.gridLine} x1={chartLeft} y1={y} x2={chartWidth - chartRight} y2={y} />
              <text className={styles.axisLabel} x={chartLeft - 12} y={y + 4} textAnchor="end">{value}</text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const x = chartLeft + index * step + (step - barWidth) / 2;
          const barHeight = (item.count / maxCount) * innerHeight;
          const y = chartTop + innerHeight - barHeight;

          return (
            <g key={item.date}>
              <rect className={styles.chartBar} x={x} y={y} width={barWidth} height={barHeight} rx="6" />
              {item.count > 0 && (
                <text className={styles.barValue} x={x + barWidth / 2} y={y - 8} textAnchor="middle">{item.count}</text>
              )}
              {index % labelStep === 0 && (
                <text className={styles.axisLabel} x={x + barWidth / 2} y={chartTop + innerHeight + 26} textAnchor="middle">{item.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const TechnicianScoreGraph: React.FC<TechnicianScoreGraphProps> = ({ technicians }) => {
  const sortedTechnicians = [...technicians].sort((a, b) => b.score - a.score || b.activeJobsCount - a.activeJobsCount);

  if (sortedTechnicians.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className="material-symbols-outlined">engineering</span>
        ยังไม่มีข้อมูลคะแนนช่าง
      </div>
    );
  }

  return (
    <div className={styles.techScoreList}>
      {sortedTechnicians.map((tech) => {
        const scoreLabel = tech.score > 0 ? tech.score.toFixed(1) : '-';
        const scoreFillWidth = tech.score > 0 ? `${Math.max((tech.score / 5) * 100, 8)}%` : '0%';
        const scoreColor = getScoreColor(tech.score);

        return (
          <div className={styles.techScoreItem} key={tech.id}>
            <div className={styles.techAvatar}>{tech.initials}</div>
            <div className={styles.techInfo}>
              <div className={styles.techName}>{tech.name}</div>
              <div className={styles.techMeta}>{tech.activeJobsCount} งานที่รับผิดชอบ</div>
              <div className={styles.scoreBar} role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={tech.score}>
                <div className={styles.scoreFill} style={{ width: scoreFillWidth, backgroundColor: scoreColor }} />
              </div>
            </div>
            <div className={styles.scoreMeta}>
              <span className={styles.scoreDot} style={{ backgroundColor: scoreColor }} />
              <span className={styles.scoreValue}>{scoreLabel}</span>
              <span className={styles.scoreMax}>/ 5</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminReports: React.FC = () => {
  const { requests, loading: requestsLoading } = useAdminRequests();
  const { technicians: technicianStats, loading: techniciansLoading } = useTechnicians();
  const [rangeDays, setRangeDays] = useState(14);

  const requestsPerDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (rangeDays - 1 - index));
      return getDateKey(date);
    });

    const counts = requests.reduce<Record<string, number>>((acc, request) => {
      const dateKey = getDateKey(new Date(request.created_at));
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return days.map((date) => ({
      date,
      label: getShortDateLabel(date),
      count: counts[date] || 0,
    }));
  }, [requests, rangeDays]);

  const technicianScores = useMemo<TechnicianScoreData[]>(() => technicianStats.map((tech) => ({
    id: tech.id,
    name: tech.name || `ช่าง ${tech.id}`,
    initials: getInitials(tech.name || `ช่าง ${tech.id}`),
    score: tech.avgRating || 0,
    activeJobsCount: tech.activeJobsCount || 0,
  })), [technicianStats]);

  const ratedTechnicians = technicianScores.filter(tech => tech.score > 0);
  const averageScore = ratedTechnicians.length > 0
    ? ratedTechnicians.reduce((sum, tech) => sum + tech.score, 0) / ratedTechnicians.length
    : 0;

  const completedRequests = requests.filter(request => request.status === 'COMPLETED').length;
  const activeRequests = requests.filter(request => ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(request.status)).length;
  const cancelledRequests = requests.filter(request => request.status === 'CANCELLED').length;

  const summaryCards = [
    {
      label: 'ใบแจ้งซ่อมทั้งหมด',
      value: requests.length,
      hint: 'รวมทุกรายการในระบบ',
      icon: 'analytics',
    },
    {
      label: 'งานที่กำลังดำเนินการ',
      value: activeRequests,
      hint: 'รอดำเนินการ, มอบหมายแล้ว, กำลังซ่อม, พักงาน',
      icon: 'pending_actions',
    },
    {
      label: 'งานเสร็จสิ้น',
      value: completedRequests,
      hint: 'สถานะเสร็จสิ้นทั้งหมด',
      icon: 'check_circle',
    },
    {
      label: 'งานยกเลิก',
      value: cancelledRequests,
      hint: 'สถานะยกเลิกทั้งหมด',
      icon: 'cancel',
    },
    {
      label: 'คะแนนช่างเฉลี่ย',
      value: averageScore > 0 ? averageScore.toFixed(1) : '-',
      hint: ratedTechnicians.length > 0 ? `จาก ${ratedTechnicians.length} ช่างที่มีการประเมิน` : 'ยังไม่มีคะแนนประเมิน',
      icon: 'star',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (requestsLoading || techniciansLoading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div className={styles.loadingState}>กำลังโหลดข้อมูลรายงาน...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>รายงานสถิติ</h1>
            <p className={styles.pageSubtitle}>ติดตามจำนวนใบแจ้งซ่อมรายวันและคะแนนการประเมินของช่าง</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.headerControls}>
              <span className="material-symbols-outlined">calendar_month</span>
              <select className={styles.rangeSelect} value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <button className={styles.printButton} type="button" onClick={handlePrint}>
              <span className="material-symbols-outlined">print</span>
              พิมพ์รายงาน
            </button>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <div className={styles.summaryCard} key={card.label}>
              <div className={styles.summaryIcon}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <div>
                <div className={styles.summaryLabel}>{card.label}</div>
                <div className={styles.summaryValue}>{card.value}</div>
                <div className={styles.summaryHint}>{card.hint}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>จำนวนใบแจ้งซ่อมรายวัน</h2>
                <p className={styles.cardSubtitle}>จำนวนใบแจ้งซ่อมที่สร้างในแต่ละวัน</p>
              </div>
              <span className={styles.periodBadge}>{rangeDays} วัน</span>
            </div>
            <RequestsPerDayChart data={requestsPerDay} />
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>คะแนนช่าง</h2>
                <p className={styles.cardSubtitle}>คะแนนเฉลี่ยจากการประเมินของผู้ใช้งาน</p>
              </div>
              <span className={styles.periodBadge}>คะแนน 5 เต็ม</span>
            </div>
            <TechnicianScoreGraph technicians={technicianScores} />
          </div>
        </div>

        <div className={styles.statusCard}>
          <h2 className={styles.cardTitle}>สรุปตามสถานะ</h2>
          <div className={styles.statusGrid}>
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = requests.filter(request => request.status === status).length;

              return (
                <div className={styles.statusItem} key={status}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
