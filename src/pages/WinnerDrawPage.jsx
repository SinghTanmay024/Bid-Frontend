import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getContest, triggerDraw, getContestWinners, getDrawLog } from '../api/contests';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const TIER_COLORS = ['#F5A623', '#A0A0AB', '#CD7F32', '#5B5FEF', '#22C55E'];
const TIER_LABELS = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place', '🎖 4th Place', '⭐ 5th Place'];

/* ── Rolling drum animation ──────────────────── */
function Drum({ items, revealed, revealIdx }) {
  const [displayIdx, setDisplayIdx] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!revealed) {
      intervalRef.current = setInterval(() => {
        setDisplayIdx((i) => (i + 1) % items.length);
      }, 80);
    } else {
      clearInterval(intervalRef.current);
      setDisplayIdx(revealIdx % items.length);
    }
    return () => clearInterval(intervalRef.current);
  }, [revealed, revealIdx, items.length]);

  return (
    <div className="h-12 overflow-hidden flex items-center justify-center">
      <span className="text-lg font-mono font-bold text-white transition-all" style={{ filter: revealed ? 'none' : 'blur(2px)', opacity: revealed ? 1 : 0.7 }}>
        {items[displayIdx] ?? '…'}
      </span>
    </div>
  );
}

/* ── Single winner reveal card ───────────────── */
function WinnerRevealCard({ winner, tierIdx, revealed, onReveal, tierInfo }) {
  const color = TIER_COLORS[tierIdx] ?? '#5B5FEF';
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{ background: '#18181C', border: `1px solid ${revealed ? color + '50' : 'rgba(255,255,255,0.06)'}`, boxShadow: revealed ? `0 0 24px ${color}20` : 'none' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-sm font-semibold" style={{ color }}>{TIER_LABELS[tierIdx] ?? `Tier ${tierIdx + 1}`}</span>
        <span className="text-xs text-[#6B6B78] ml-2">— {tierInfo?.prize}</span>
      </div>
      <div className="p-5 space-y-4">
        {!revealed ? (
          <>
            <div className="h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Drum items={['????????', 'user_***', '****@*.*', '???.???']} revealed={false} revealIdx={0} />
            </div>
            <button onClick={onReveal} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: color }}>
              Reveal Winner
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${color}18`, color }}>
              {winner?.userId?.split('@')[0]?.slice(0, 2)?.toUpperCase() ?? 'W'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{winner?.userId ?? 'Winner'}</p>
              <p className="text-xs text-[#6B6B78]">{tierInfo?.prize}</p>
            </div>
            <span className="ml-auto text-2xl">🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WinnerDrawPage() {
  const { id } = useParams();
  const { role } = useAuthStore();
  const [contest, setContest] = useState(null);
  const [winners, setWinners] = useState([]);
  const [drawLog, setDrawLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawDone, setDrawDone] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [allRevealed, setAllRevealed] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getContest(id),
      getContestWinners(id).catch(() => ({ data: [] })),
      getDrawLog(id).catch(() => ({ data: null })),
    ]).then(([{ data: c }, { data: w }, { data: l }]) => {
      setContest(c);
      if (w?.length) { setWinners(w); setDrawDone(true); }
      if (l) setDrawLog(l);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDraw = async () => {
    setDrawing(true);
    try {
      const { data } = await triggerDraw(id);
      setWinners(data?.winners ?? []);
      setDrawLog(data?.log ?? null);
      setDrawDone(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Draw failed.';
      alert(msg);
    } finally { setDrawing(false); }
  };

  const revealOne = (idx) => {
    setRevealed((r) => ({ ...r, [idx]: true }));
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: [TIER_COLORS[idx] ?? '#5B5FEF', '#ffffff'] });
  };

  const revealAll = () => {
    const all = {};
    winners.forEach((_, i) => { all[i] = true; });
    setRevealed(all);
    setAllRevealed(true);
    confetti({ particleCount: 300, spread: 100, origin: { y: 0.4 }, colors: ['#F5A623', '#5B5FEF', '#22C55E', '#EF4444'] });
  };

  if (loading) return <LoadingSpinner message="Loading draw…" />;
  if (!contest) return null;

  const isAdmin = role === 'ADMIN';
  const tiersMap = {};
  (contest.tiers ?? []).forEach((t, i) => { tiersMap[i] = t; });

  return (
    <div className="min-h-screen py-12 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-2xl mx-auto">
        <Link to={`/contests/${id}`} className="inline-flex items-center gap-1 text-sm text-[#6B6B78] hover:text-[#A0A0AB] mb-6 transition-colors">← Back to Contest</Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4" style={{ background: 'rgba(91,95,239,0.12)', border: '1px solid rgba(91,95,239,0.2)' }}>🎲</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{drawDone ? 'Winner Draw' : 'Live Draw'}</h1>
          <p className="text-sm text-[#6B6B78] mt-1">{contest.title}</p>
        </div>

        {/* Draw info panel */}
        {drawLog && (
          <div className="rounded-2xl p-5 mb-8 space-y-3 font-mono text-xs" style={{ background: '#18181C', border: '1px solid rgba(91,95,239,0.15)' }}>
            <p className="text-[#5B5FEF] font-semibold not-italic font-sans text-xs uppercase tracking-widest mb-1">Draw Log</p>
            <div className="space-y-1.5 text-[#A0A0AB]">
              <div className="flex gap-3"><span className="text-[#6B6B78] w-24">Seed</span><span className="break-all">{drawLog.seed ?? '—'}</span></div>
              <div className="flex gap-3"><span className="text-[#6B6B78] w-24">Algorithm</span><span>{drawLog.algorithm ?? 'Mulberry32 PRNG'}</span></div>
              <div className="flex gap-3"><span className="text-[#6B6B78] w-24">Total Pool</span><span>{drawLog.totalParticipants ?? '—'}</span></div>
              <div className="flex gap-3"><span className="text-[#6B6B78] w-24">Drawn At</span><span>{drawLog.drawnAt ? new Date(drawLog.drawnAt).toLocaleString('en-IN') : '—'}</span></div>
            </div>
          </div>
        )}

        {/* Admin draw trigger */}
        {isAdmin && !drawDone && contest.status === 'COMPLETED' && (
          <div className="rounded-2xl p-6 mb-8 text-center space-y-4" style={{ background: '#18181C', border: '1px solid rgba(245,166,35,0.2)' }}>
            <p className="text-sm text-[#A0A0AB]">The contest has ended. Trigger the live draw to select winners.</p>
            <button onClick={handleDraw} disabled={drawing}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: '#F5A623' }}>
              {drawing ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Drawing…</span> : '🎲 Start Live Draw'}
            </button>
          </div>
        )}

        {/* Winner cards */}
        {drawDone && winners.length > 0 && (
          <div className="space-y-4">
            {!allRevealed && (
              <div className="flex justify-end">
                <button onClick={revealAll} className="px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>Reveal All at Once</button>
              </div>
            )}
            {winners.map((winner, idx) => (
              <WinnerRevealCard
                key={idx}
                winner={winner}
                tierIdx={idx}
                tierInfo={tiersMap[idx] ?? winner.tier}
                revealed={!!revealed[idx]}
                onReveal={() => revealOne(idx)}
              />
            ))}

            {/* Links */}
            <div className="flex gap-3 pt-4">
              <Link to={`/transparency/${id}`} className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-[#5B5FEF] hover:bg-[rgba(91,95,239,0.06)] transition-colors" style={{ border: '1px solid rgba(91,95,239,0.2)' }}>View Proof</Link>
              <Link to="/contests" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>All Contests</Link>
            </div>
          </div>
        )}

        {drawDone && winners.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <span className="text-5xl">🎲</span>
            <p className="text-white font-semibold">No winners yet or draw is processing.</p>
          </div>
        )}

        {!drawDone && !isAdmin && (
          <div className="text-center py-16 space-y-3">
            <span className="text-5xl">⏳</span>
            <p className="text-white font-semibold">Draw hasn't happened yet.</p>
            <p className="text-sm text-[#6B6B78]">Check back after the contest ends.</p>
          </div>
        )}
      </div>
    </div>
  );
}
