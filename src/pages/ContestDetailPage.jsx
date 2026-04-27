import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  getContest, enterContest, checkUserEntry, generateReferralLink,
  getReferralStats, getContestParticipants, getContestWinners,
} from '../api/contests';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Countdown ─────────────────────────────── */
function useCountdown(iso) {
  const calc = () => {
    const d = new Date(iso) - Date.now();
    if (d <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 };
    const s = Math.floor(d / 1000);
    return { done: false, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (t.done) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

function pad(n) { return String(n).padStart(2, '0'); }

function CountdownBlock({ label, val }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white font-mono" style={{ background: 'rgba(91,95,239,0.12)', border: '1px solid rgba(91,95,239,0.2)' }}>{pad(val)}</div>
      <span className="text-[10px] text-[#6B6B78] uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ── Referral section ──────────────────────── */
function ReferralSection({ contestId, userId, accessCode }) {
  const [link, setLink] = useState('');
  const [stats, setStats] = useState(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const codeParam = accessCode ? `&code=${encodeURIComponent(accessCode)}` : '';
    const ref = `${window.location.origin}/contests/${contestId}?ref=${encodeURIComponent(userId)}${codeParam}`;
    setLink(ref);
    getReferralStats(contestId, userId)
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, [contestId, userId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopying(true);
      toast.success('Link copied!');
      setTimeout(() => setCopying(false), 2000);
    } catch { toast.error('Could not copy link.'); }
  };

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[#5B5FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        <h3 className="text-sm font-semibold text-white">Referral Link</h3>
        {stats?.bonusEntries > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-[#22C55E]" style={{ background: 'rgba(34,197,94,0.12)' }}>+{stats.bonusEntries} bonus entries</span>
        )}
      </div>
      <div className="flex gap-2">
        <input readOnly value={link} className="flex-1 px-3 py-2 rounded-xl text-xs text-[#A0A0AB] truncate focus:outline-none" style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)' }} />
        <button onClick={copy} className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: copying ? '#22C55E' : '#5B5FEF' }}>
          {copying ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {stats && <p className="text-xs text-[#6B6B78]">{stats.referrals ?? 0} friend{stats.referrals !== 1 ? 's' : ''} joined via your link</p>}
    </div>
  );
}

/* ── Tier badge ────────────────────────────── */
const TIER_COLORS = ['#F5A623', '#A0A0AB', '#CD7F32'];
function TierCard({ tier, idx }) {
  const color = TIER_COLORS[idx] ?? '#5B5FEF';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${color}18`, color }}>{tier.rank || `#${idx + 1}`}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{tier.prize}</p>
        <p className="text-xs text-[#6B6B78]">{tier.winnersCount} winner{tier.winnersCount > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default function ContestDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const urlCode = searchParams.get('code'); // ?code=XYZ from private invite link
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [contest, setContest] = useState(null);
  const [entered, setEntered] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [accessInput, setAccessInput] = useState(urlCode || '');
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessError, setAccessError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data: c } = await getContest(id);
      setContest(c);
      const [pRes, wRes] = await Promise.allSettled([
        getContestParticipants(id),
        getContestWinners(id),
      ]);
      if (pRes.status === 'fulfilled') setParticipants(pRes.value.data ?? []);
      if (wRes.status === 'fulfilled') setWinners(wRes.value.data ?? []);
      if (userId) {
        checkUserEntry(id, userId).then(({ data }) => setEntered(!!data?.entered)).catch(() => {});
      }
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
    }
  }, [id, userId]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const handleEnter = async () => {
    if (!userId) { toast.error('Log in to enter the contest.'); navigate('/login'); return; }
    setEntering(true);
    try {
      await enterContest(id, { userId, referredBy: refCode || null });
      setEntered(true);
      setContest((c) => ({ ...c, participantCount: (c.participantCount ?? 0) + 1 }));
      toast.success('You are in! Good luck!');
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#5B5FEF', '#F5A623', '#22C55E'] });
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      if (typeof msg === 'string' && (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate'))) {
        setEntered(true); toast.error('You have already entered this contest.');
      } else { toast.error(msg || 'Failed to enter. Please try again.'); }
    } finally { setEntering(false); }
  };

  const isPrivate = contest?.visibility === 'private';
  const codeUnlocked = !isPrivate || accessGranted ||
    (urlCode && contest && urlCode.toUpperCase() === (contest.accessCode ?? '').toUpperCase());

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessInput.trim().toUpperCase() === (contest?.accessCode ?? '').toUpperCase()) {
      setAccessGranted(true);
      setAccessError('');
    } else {
      setAccessError('Incorrect code. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading contest…" />;
  if (notFound) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="text-6xl">🔍</span>
      <h2 className="text-xl font-semibold text-white">Contest not found</h2>
      <Link to="/contests" className="px-6 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#5B5FEF' }}>Browse Contests</Link>
    </div>
  );
  if (!contest) return null;

  // Private gate — show access code form if locked
  if (isPrivate && !codeUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#0C0C0E' }}>
        <div className="w-full max-w-sm rounded-2xl p-8 space-y-6" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: 'rgba(91,95,239,0.12)', border: '1px solid rgba(91,95,239,0.2)' }}>🔒</div>
            <h2 className="text-xl font-bold text-white">Private Contest</h2>
            <p className="text-sm text-[#6B6B78]">Enter the access code to view and join this contest.</p>
          </div>
          <form onSubmit={handleAccessSubmit} className="space-y-3">
            <input
              type="text"
              value={accessInput}
              onChange={(e) => { setAccessInput(e.target.value.toUpperCase()); setAccessError(''); }}
              placeholder="ACCESS CODE"
              className="w-full px-4 py-3 rounded-xl text-center text-lg font-bold tracking-widest text-white placeholder-[#6B6B78] focus:outline-none uppercase"
              style={{ background: '#111114', border: `1px solid ${accessError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
              maxLength={20}
            />
            {accessError && <p className="text-xs text-[#EF4444] text-center">{accessError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>Unlock Contest</button>
          </form>
          <Link to="/contests" className="block text-center text-xs text-[#6B6B78] hover:text-[#A0A0AB] transition-colors">← Back to Contests</Link>
        </div>
      </div>
    );
  }

  const isOpen = contest.status === 'OPEN';
  const isCompleted = contest.status === 'COMPLETED';
  const fillPct = contest.maxParticipants > 0 ? Math.min(100, Math.round(((contest.participantCount ?? 0) / contest.maxParticipants) * 100)) : 0;

  const tabs = [
    { key: 'info', label: 'Info' },
    { key: 'participants', label: `Participants (${participants.length})` },
    ...(isCompleted ? [{ key: 'winners', label: `Winners (${winners.length})` }] : []),
  ];

  return (
    <div className="min-h-screen py-10 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-5xl mx-auto">
        <Link to="/contests" className="inline-flex items-center gap-1 text-sm text-[#6B6B78] hover:text-[#A0A0AB] mb-6 transition-colors">← Back to Contests</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {contest.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-64" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <img src={contest.imageUrl} alt={contest.title} className="w-full h-full object-cover" onError={(e) => { e.target.parentNode.style.display = 'none'; }} />
              </div>
            )}

            {/* Title + status */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white flex-1">{contest.title}</h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: isOpen ? 'rgba(34,197,94,0.12)' : isCompleted ? 'rgba(107,114,128,0.1)' : 'rgba(99,102,241,0.12)', color: isOpen ? '#22C55E' : isCompleted ? '#6B7280' : '#818CF8', border: `1px solid ${isOpen ? 'rgba(34,197,94,0.25)' : isCompleted ? 'rgba(107,114,128,0.2)' : 'rgba(99,102,241,0.25)'}` }}>{contest.status}</span>
              </div>
              {contest.description && <p className="text-sm text-[#A0A0AB] mt-3 leading-relaxed">{contest.description}</p>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className="px-4 py-2.5 text-sm font-medium transition-colors relative"
                  style={{ color: activeTab === t.key ? '#fff' : '#6B6B78' }}>
                  {t.label}
                  {activeTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-[#5B5FEF]" />}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div className="space-y-6">
                {contest.productDetails && (
                  <div className="rounded-xl p-4 space-y-1" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-wider mb-2">Product Details</p>
                    <p className="text-sm text-[#A0A0AB] leading-relaxed">{contest.productDetails}</p>
                  </div>
                )}

                {/* Progress */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-between text-xs text-[#6B6B78]">
                    <span><span className="text-white font-semibold">{contest.participantCount ?? 0}</span> entered</span>
                    <span><span className="text-white font-semibold">{contest.maxParticipants - (contest.participantCount ?? 0)}</span> spots left</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? '#EF4444' : '#5B5FEF' }} />
                  </div>
                  <p className="text-xs text-[#6B6B78]">{fillPct}% full</p>
                </div>

                {/* Prizes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-wider">Prizes</p>
                  {(contest.tiers ?? []).map((tier, i) => <TierCard key={i} tier={tier} idx={i} />)}
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {participants.length === 0 ? (
                  <p className="text-sm text-[#6B6B78] py-8 text-center">No participants yet.</p>
                ) : participants.map((p, i) => (
                  <div key={p.userId ?? i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg bg-[#5B5FEF] flex items-center justify-center text-xs font-bold text-white shrink-0">{(p.userId ?? '?').split('@')[0].slice(0, 2).toUpperCase()}</div>
                    <span className="text-sm text-[#A0A0AB] flex-1 truncate">{p.userId ?? 'Anonymous'}</span>
                    {p.bonusEntries > 0 && <span className="text-xs font-medium text-[#22C55E]">+{p.bonusEntries} bonus</span>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'winners' && (
              <div className="space-y-3">
                {winners.length === 0 ? (
                  <p className="text-sm text-[#6B6B78] py-8 text-center">Winners not announced yet.</p>
                ) : winners.map((w, i) => (
                  <div key={w.userId ?? i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#18181C', border: '1px solid rgba(245,166,35,0.15)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${TIER_COLORS[i] ?? '#5B5FEF'}18`, color: TIER_COLORS[i] ?? '#5B5FEF' }}>#{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{w.userId}</p>
                      <p className="text-xs text-[#6B6B78]">{w.tier?.rank ?? `Tier ${i + 1}`} — {w.tier?.prize}</p>
                    </div>
                    <span className="text-lg">🏆</span>
                  </div>
                ))}
                <Link to={`/transparency/${id}`} className="block text-center text-xs text-[#5B5FEF] hover:underline mt-2">View full draw proof →</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Live countdown */}
            {isOpen && (
              <div className="rounded-2xl p-5" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-4">Ends In</p>
                <CountdownWidget endTime={contest.endTime} />
              </div>
            )}

            {/* Entry panel */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Entry Fee</span>
                <span className="text-xl font-bold" style={{ color: contest.entryFee > 0 ? '#F5A623' : '#22C55E' }}>
                  {contest.entryFee > 0 ? `🪙 ${contest.entryFee} coins` : 'FREE'}
                </span>
              </div>
              {/* Private badge + share link */}
              {isPrivate && codeUnlocked && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(91,95,239,0.08)', border: '1px solid rgba(91,95,239,0.15)' }}>
                  <span className="text-xs">🔒</span>
                  <span className="text-xs text-[#7477F5] font-medium flex-1">Private contest</span>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/contests/${id}?code=${contest.accessCode}`;
                      navigator.clipboard.writeText(link).then(() => toast.success('Invite link copied!'));
                    }}
                    className="text-xs text-[#5B5FEF] hover:underline"
                  >Copy invite link</button>
                </div>
              )}

              {isOpen && !entered && (
                <button onClick={handleEnter} disabled={entering}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#5B5FEF' }}>
                  {entering ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Entering…</span> : 'Enter Contest'}
                </button>
              )}
              {entered && (
                <div className="w-full py-3 rounded-xl text-sm font-medium text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>✓ You're In!</div>
              )}
              {isCompleted && (
                <div className="w-full py-3 rounded-xl text-sm font-medium text-center" style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', color: '#6B7280' }}>Contest Ended</div>
              )}
              {!userId && isOpen && (
                <Link to="/login" className="block w-full py-3 rounded-xl text-sm font-semibold text-white text-center hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>Log in to Enter</Link>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[['Start', contest.startTime], ['End', contest.endTime]].map(([lbl, iso]) => (
                <div key={lbl} className="flex justify-between text-sm">
                  <span className="text-[#6B6B78]">{lbl}</span>
                  <span className="text-[#A0A0AB] text-xs">{iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                </div>
              ))}
            </div>

            {/* Referral */}
            {userId && entered && <ReferralSection contestId={id} userId={userId} accessCode={isPrivate ? contest.accessCode : null} />}

            {/* Transparency */}
            <Link to={`/transparency/${id}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#5B5FEF] hover:bg-[rgba(91,95,239,0.06)] transition-colors"
              style={{ border: '1px solid rgba(91,95,239,0.2)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              View Fairness Proof
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountdownWidget({ endTime }) {
  const t = useCountdown(endTime);
  if (t.done) return <p className="text-center text-sm text-[#EF4444]">Draw in progress…</p>;
  return (
    <div className="flex justify-center gap-3">
      {t.d > 0 && <CountdownBlock label="days" val={t.d} />}
      <CountdownBlock label="hrs" val={t.h} />
      <CountdownBlock label="min" val={t.m} />
      <CountdownBlock label="sec" val={t.s} />
    </div>
  );
}
