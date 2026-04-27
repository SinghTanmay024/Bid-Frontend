import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllContests } from '../api/contests';
import { useAuthStore } from '../store/authStore';

/* ── Countdown hook ─────────────────────────── */
function useCountdown(targetIso) {
  const calc = () => {
    const diff = new Date(targetIso) - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const s = Math.floor(diff / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: false };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    if (tick.done) return;
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [targetIso, tick.done]);
  return tick;
}

function pad(n) { return String(n).padStart(2, '0'); }

function Countdown({ endTime, status }) {
  const t = useCountdown(endTime);
  if (status === 'COMPLETED') return <span className="text-xs text-[#6B6B78]">Ended</span>;
  if (status === 'UPCOMING') return <span className="text-xs text-[#7477F5]">Starting soon</span>;
  if (t.done) return <span className="text-xs text-[#EF4444]">Closing…</span>;
  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      {t.d > 0 && <><span className="text-white font-bold">{t.d}</span><span className="text-[#6B6B78]">d</span></>}
      <span className="text-white font-bold">{pad(t.h)}</span><span className="text-[#6B6B78]">h</span>
      <span className="text-white font-bold">{pad(t.m)}</span><span className="text-[#6B6B78]">m</span>
      <span className="text-white font-bold">{pad(t.s)}</span><span className="text-[#6B6B78]">s</span>
    </div>
  );
}

const STATUS_COLORS = {
  OPEN:      { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#22C55E', dot: '#22C55E' },
  UPCOMING:  { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818CF8', dot: '#818CF8' },
  COMPLETED: { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', text: '#6B7280', dot: '#6B7280' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.COMPLETED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function ContestCard({ contest }) {
  const totalWinners = contest.tiers?.reduce((s, t) => s + (t.winnersCount || 1), 0) ?? 1;
  const fillPct = contest.maxParticipants > 0
    ? Math.min(100, Math.round((contest.participantCount / contest.maxParticipants) * 100))
    : 0;

  return (
    <Link to={`/contests/${contest.id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
      style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Image */}
      <div className="relative h-40 bg-[#111114] overflow-hidden">
        {contest.imageUrl ? (
          <img src={contest.imageUrl} alt={contest.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎯</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181C] to-transparent opacity-60" />
        <div className="absolute top-3 left-3"><StatusBadge status={contest.status} /></div>
        {contest.entryFee > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(245,166,35,0.9)' }}>₹{contest.entryFee.toLocaleString('en-IN')}</div>
        )}
        {contest.entryFee === 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}>FREE</div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{contest.title}</h3>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] text-[#6B6B78] mb-1.5">
            <span>{contest.participantCount ?? 0} participants</span>
            <span>{contest.maxParticipants} max</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? '#EF4444' : '#5B5FEF' }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="text-[11px] text-[#A0A0AB]">{totalWinners} winner{totalWinners > 1 ? 's' : ''}</span>
          </div>
          {contest.status === 'OPEN' && <Countdown endTime={contest.endTime} status={contest.status} />}
          {contest.status === 'UPCOMING' && <Countdown endTime={contest.startTime} status={contest.status} />}
          {contest.status === 'COMPLETED' && <span className="text-[11px] text-[#6B6B78]">Ended</span>}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-40 shimmer" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}

const FILTERS = ['ALL', 'OPEN', 'UPCOMING', 'COMPLETED'];

export default function ContestListPage() {
  const { userId, role } = useAuthStore();
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getAllContests()
      .then(({ data }) => setContests(Array.isArray(data) ? data : []))
      .catch(() => setContests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = filter === 'ALL' ? contests : contests.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen py-10 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-semibold text-[#5B5FEF] uppercase tracking-widest">Live Arena</span>
            <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Contests</h1>
            <p className="text-sm text-[#6B6B78] mt-1">Enter, win, and track all active contests.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {userId && (
              <Link to="/contests/create"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: '#5B5FEF' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Create Contest
              </Link>
            )}
            <Link to="/transparency"
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] transition-all">
              Transparency
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: filter === f ? 'rgba(91,95,239,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === f ? 'rgba(91,95,239,0.4)' : 'rgba(255,255,255,0.08)'}`, color: filter === f ? '#7477F5' : '#6B6B78' }}>
              {f} {f !== 'ALL' && <span className="opacity-60 ml-1">{contests.filter((c) => c.status === f).length}</span>}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-6xl">🎯</span>
            <h2 className="text-xl font-semibold text-white">No contests found</h2>
            <p className="text-sm text-[#6B6B78]">{filter === 'ALL' ? 'Be the first to create one!' : `No ${filter.toLowerCase()} contests right now.`}</p>
            {userId && <Link to="/contests/create" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>Create Contest</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((c) => <ContestCard key={c.id} contest={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
