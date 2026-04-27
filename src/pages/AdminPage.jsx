import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllContests, approveContest, rejectContest, getAdminStats, getFraudAlerts, flagUser } from '../api/contests';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Stat card ─────────────────────────────── */
function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${color}18` }}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-[#6B6B78] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Contest row ────────────────────────────── */
function ContestRow({ contest, onApprove, onReject }) {
  const [acting, setActing] = useState(false);

  const act = async (fn, label) => {
    setActing(true);
    try { await fn(); toast.success(`Contest ${label}.`); }
    catch (err) { toast.error(err?.response?.data?.message || `Failed to ${label}.`); }
    finally { setActing(false); }
  };

  const statusColor = {
    PENDING: '#F5A623', OPEN: '#22C55E', COMPLETED: '#6B7280', REJECTED: '#EF4444', UPCOMING: '#818CF8',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-xl" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-white truncate">{contest.title}</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${statusColor[contest.status] ?? '#6B7280'}18`, color: statusColor[contest.status] ?? '#6B7280', border: `1px solid ${statusColor[contest.status] ?? '#6B7280'}30` }}>{contest.status}</span>
        </div>
        <p className="text-xs text-[#6B6B78] mt-0.5">
          {contest.participantCount ?? 0}/{contest.maxParticipants} participants · Entry: {contest.entryFee > 0 ? `₹${contest.entryFee}` : 'Free'}
          {contest.createdBy && ` · by ${contest.createdBy}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link to={`/contests/${contest.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A0A0AB] hover:text-white border border-[rgba(255,255,255,0.08)] transition-colors">View</Link>
        {contest.status === 'PENDING' && (
          <>
            <button disabled={acting} onClick={() => act(onApprove, 'approved')} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: '#22C55E' }}>Approve</button>
            <button disabled={acting} onClick={() => act(onReject, 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: '#EF4444' }}>Reject</button>
          </>
        )}
        {contest.status === 'COMPLETED' && (
          <Link to={`/contests/${contest.id}/draw`} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>Draw</Link>
        )}
      </div>
    </div>
  );
}

/* ── Fraud alert row ─────────────────────────── */
function FraudRow({ alert, onFlag }) {
  const [flagging, setFlagging] = useState(false);
  const doFlag = async () => {
    setFlagging(true);
    try { await onFlag(alert.userId, alert.reason); toast.success('User flagged.'); }
    catch { toast.error('Failed to flag user.'); }
    finally { setFlagging(false); }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-3 rounded-xl" style={{ background: '#18181C', border: '1px solid rgba(239,68,68,0.15)' }}>
      <div className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-sm shrink-0">⚠️</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{alert.userId}</p>
        <p className="text-xs text-[#6B6B78]">{alert.reason} · {alert.count} flagged actions</p>
      </div>
      <button disabled={flagging} onClick={doFlag} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#EF4444] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.08)] transition-colors disabled:opacity-50">
        {flagging ? '…' : 'Block'}
      </button>
    </div>
  );
}

const TABS = ['overview', 'contests', 'fraud'];

export default function AdminPage() {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [contests, setContests] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [contestFilter, setContestFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'ADMIN') { navigate('/'); return; }
  }, [role]);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      getAdminStats(),
      getAllContests(),
      getFraudAlerts(),
    ]).then(([sR, cR, fR]) => {
      if (sR.status === 'fulfilled') setStats(sR.value.data);
      if (cR.status === 'fulfilled') setContests(Array.isArray(cR.value.data) ? cR.value.data : []);
      if (fR.status === 'fulfilled') setFraudAlerts(Array.isArray(fR.value.data) ? fR.value.data : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleApprove = async (id) => {
    await approveContest(id);
    setContests((p) => p.map((c) => (c.id === id ? { ...c, status: 'UPCOMING' } : c)));
  };
  const handleReject = async (id) => {
    await rejectContest(id, 'Admin rejection');
    setContests((p) => p.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c)));
  };
  const handleFlag = async (userId, reason) => {
    await flagUser(userId, reason);
    setFraudAlerts((p) => p.filter((a) => a.userId !== userId));
  };

  if (role !== 'ADMIN') return null;
  if (loading) return <LoadingSpinner message="Loading admin panel…" />;

  const pendingCount = contests.filter((c) => c.status === 'PENDING').length;
  const filteredContests = contestFilter === 'ALL' ? contests : contests.filter((c) => c.status === contestFilter);

  return (
    <div className="min-h-screen py-10 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="text-[11px] font-semibold text-[#EF4444] uppercase tracking-widest">Admin Panel</span>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b mb-8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-medium capitalize transition-colors relative"
              style={{ color: tab === t ? '#fff' : '#6B6B78' }}>
              {t}
              {t === 'contests' && pendingCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5A623] text-black">{pendingCount}</span>}
              {t === 'fraud' && fraudAlerts.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">{fraudAlerts.length}</span>}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-[#5B5FEF]" />}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" color="#5B5FEF" />
              <StatCard label="Active Contests" value={stats?.activeContests} icon="🎯" color="#22C55E" />
              <StatCard label="Pending Approval" value={pendingCount} icon="⏳" color="#F5A623" />
              <StatCard label="Total Revenue" value={stats?.totalRevenue ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : '—'} icon="💰" color="#A855F7" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Review Pending Contests', count: pendingCount, color: '#F5A623', action: () => { setTab('contests'); setContestFilter('PENDING'); } },
                { label: 'Review Fraud Alerts', count: fraudAlerts.length, color: '#EF4444', action: () => setTab('fraud') },
                { label: 'View Transparency', count: null, color: '#5B5FEF', action: () => navigate('/transparency') },
              ].map(({ label, count, color, action }) => (
                <button key={label} onClick={action}
                  className="p-5 rounded-2xl text-left hover:opacity-90 transition-opacity"
                  style={{ background: '#18181C', border: `1px solid ${color}25` }}>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  {count !== null && <p className="text-2xl font-bold mt-1" style={{ color }}>{count}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contests tab */}
        {tab === 'contests' && (
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'OPEN', 'UPCOMING', 'COMPLETED', 'REJECTED'].map((f) => (
                <button key={f} onClick={() => setContestFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ background: contestFilter === f ? 'rgba(91,95,239,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${contestFilter === f ? 'rgba(91,95,239,0.4)' : 'rgba(255,255,255,0.08)'}`, color: contestFilter === f ? '#7477F5' : '#6B6B78' }}>
                  {f}
                </button>
              ))}
            </div>
            {filteredContests.length === 0 ? (
              <p className="text-sm text-[#6B6B78] py-10 text-center">No contests in this category.</p>
            ) : (
              <div className="space-y-3">
                {filteredContests.map((c) => (
                  <ContestRow key={c.id} contest={c} onApprove={() => handleApprove(c.id)} onReject={() => handleReject(c.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fraud tab */}
        {tab === 'fraud' && (
          <div className="space-y-4">
            {fraudAlerts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <span className="text-5xl">✅</span>
                <p className="text-white font-semibold">No fraud alerts</p>
                <p className="text-sm text-[#6B6B78]">All activity looks clean.</p>
              </div>
            ) : fraudAlerts.map((a, i) => (
              <FraudRow key={a.userId ?? i} alert={a} onFlag={handleFlag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
