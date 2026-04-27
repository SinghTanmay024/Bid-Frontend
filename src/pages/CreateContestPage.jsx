import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createContest } from '../api/contests';

const INIT_TIER = { rank: '', winnersCount: 1, prize: '' };
const inputBase = 'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#6B6B78] focus:outline-none transition-all';
const iStyle = (e) => ({ background: '#111114', border: `1px solid ${e ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` });
const onFocus = (e) => { e.target.style.borderColor = 'rgba(91,95,239,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.12)'; };
const onBlur = (err) => (e) => { e.target.style.borderColor = err ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; };

function Field({ label, required, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#A0A0AB] flex items-center gap-1.5">
        {label}
        {required && <span className="text-[#EF4444]">*</span>}
        {optional && <span className="text-[#6B6B78] font-normal">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

export default function CreateContestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', productDetails: '', entryFee: '',
    maxParticipants: '', startTime: '', endTime: '', winnerType: 'single',
    imageUrl: '', singlePrize: '', visibility: 'public', accessCode: '',
  });
  const [tiers, setTiers] = useState([
    { rank: '1st', winnersCount: 1, prize: '' },
    { rank: '2nd', winnersCount: 5, prize: '' },
    { rank: '3rd', winnersCount: 20, prize: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (name, val) => { setForm((f) => ({ ...f, [name]: val })); if (errors[name]) setErrors((p) => ({ ...p, [name]: '' })); };
  const handleChange = (e) => set(e.target.name, e.target.value);
  const updTier = (i, f, v) => setTiers((p) => p.map((t, j) => (j === i ? { ...t, [f]: v } : t)));
  const addTier = () => setTiers((p) => [...p, { ...INIT_TIER }]);
  const rmTier = (i) => setTiers((p) => p.filter((_, j) => j !== i));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.maxParticipants || Number(form.maxParticipants) < 2) e.maxParticipants = 'At least 2 participants.';
    if (!form.startTime) e.startTime = 'Start time required.';
    if (!form.endTime) e.endTime = 'End time required.';
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) e.endTime = 'End must be after start.';
    if (form.winnerType === 'multiple') tiers.forEach((t, i) => { if (!t.prize.trim()) e[`t${i}`] = 'Prize required.'; });
    else if (!form.singlePrize?.trim()) e.singlePrize = 'Prize required.';
    if (form.visibility === 'private' && !form.accessCode.trim()) e.accessCode = 'Access code required for private contests.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createContest({
        title: form.title.trim(),
        description: form.description.trim() || null,
        productDetails: form.productDetails.trim() || null,
        entryFee: form.entryFee ? Number(form.entryFee) : 0,
        maxParticipants: Number(form.maxParticipants),
        startTime: form.startTime,
        endTime: form.endTime,
        imageUrl: form.imageUrl.trim() || null,
        winnerType: form.winnerType,
        visibility: form.visibility,
        accessCode: form.visibility === 'private' ? form.accessCode.trim() : null,
        tiers: form.winnerType === 'multiple' ? tiers : [{ rank: '1st', winnersCount: 1, prize: form.singlePrize }],
      });
      toast.success('Contest created! Pending admin approval.');
      navigate('/contests');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create contest.');
    } finally { setLoading(false); }
  };

  const divider = <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />;

  return (
    <div className="min-h-screen py-12 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-[#A0A0AB] transition-colors mb-5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Contest</h1>
          <p className="text-sm text-[#6B6B78] mt-1">Set up a new contest with prizes, entry fee, and winner tiers.</p>
        </div>

        <div className="rounded-2xl p-7 space-y-6" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* ── Basic Info ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-widest">Basic Info</h3>
              <Field label="Contest Title" required error={errors.title}>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Win an iPhone 15 Pro" className={inputBase} style={iStyle(!!errors.title)} onFocus={onFocus} onBlur={onBlur(!!errors.title)} />
              </Field>
              <Field label="Description" optional>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the contest, rules, eligibility…" rows={3} className={inputBase + ' resize-none'} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
              </Field>
              <Field label="Product Details" optional>
                <textarea name="productDetails" value={form.productDetails} onChange={handleChange} placeholder="Specs, condition, estimated value…" rows={2} className={inputBase + ' resize-none'} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
              </Field>
              <Field label="Image URL" optional>
                <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://…" className={inputBase} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
              </Field>
            </section>

            {divider}

            {/* ── Participation ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-widest">Participation</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Entry Fee (₹)" optional>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6B6B78]">₹</span>
                    <input type="number" name="entryFee" value={form.entryFee} onChange={handleChange} placeholder="0 = Free" min="0" className={inputBase + ' pl-7'} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
                  </div>
                </Field>
                <Field label="Max Participants" required error={errors.maxParticipants}>
                  <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} placeholder="e.g. 1000" min="2" className={inputBase} style={iStyle(!!errors.maxParticipants)} onFocus={onFocus} onBlur={onBlur(!!errors.maxParticipants)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Time" required error={errors.startTime}>
                  <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className={inputBase} style={{ ...iStyle(!!errors.startTime), colorScheme: 'dark' }} onFocus={onFocus} onBlur={onBlur(!!errors.startTime)} />
                </Field>
                <Field label="End Time" required error={errors.endTime}>
                  <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} className={inputBase} style={{ ...iStyle(!!errors.endTime), colorScheme: 'dark' }} onFocus={onFocus} onBlur={onBlur(!!errors.endTime)} />
                </Field>
              </div>
            </section>

            {divider}

            {/* ── Visibility ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-widest">Visibility</h3>
              <div className="flex gap-3">
                {[{ val: 'public', icon: '🌐', label: 'Public', desc: 'Anyone can find and join' }, { val: 'private', icon: '🔒', label: 'Private', desc: 'Join only via code or link' }].map((v) => (
                  <button key={v.val} type="button" onClick={() => set('visibility', v.val)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ background: form.visibility === v.val ? 'rgba(91,95,239,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.visibility === v.val ? 'rgba(91,95,239,0.5)' : 'rgba(255,255,255,0.08)'}`, color: form.visibility === v.val ? '#7477F5' : '#6B6B78' }}>
                    <span className="text-lg">{v.icon}</span>
                    <span className="font-semibold">{v.label}</span>
                    <span className="text-[10px] opacity-70">{v.desc}</span>
                  </button>
                ))}
              </div>
              {form.visibility === 'private' && (
                <Field label="Access Code" required error={errors.accessCode}>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6B78]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input name="accessCode" value={form.accessCode} onChange={handleChange} placeholder="e.g. SUMMER2024" className={inputBase + ' pl-9 uppercase'} style={iStyle(!!errors.accessCode)} onFocus={onFocus} onBlur={onBlur(!!errors.accessCode)} />
                  </div>
                  <p className="text-[11px] text-[#6B6B78]">Share this code or the contest link with invited participants.</p>
                </Field>
              )}
            </section>

            {divider}

            {/* ── Prize Config ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#5B5FEF] uppercase tracking-widest">Prize Configuration</h3>
              <div className="flex gap-3">
                {['single', 'multiple'].map((t) => (
                  <button key={t} type="button" onClick={() => set('winnerType', t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: form.winnerType === t ? 'rgba(91,95,239,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.winnerType === t ? 'rgba(91,95,239,0.5)' : 'rgba(255,255,255,0.08)'}`, color: form.winnerType === t ? '#7477F5' : '#6B6B78' }}>
                    {t === 'single' ? '🏆 Single Winner' : '🎖 Multiple Tiers'}
                  </button>
                ))}
              </div>

              {form.winnerType === 'single' ? (
                <Field label="Prize Description" required error={errors.singlePrize}>
                  <input name="singlePrize" value={form.singlePrize} onChange={handleChange} placeholder="e.g. iPhone 15 Pro (256GB)" className={inputBase} style={iStyle(!!errors.singlePrize)} onFocus={onFocus} onBlur={onBlur(!!errors.singlePrize)} />
                </Field>
              ) : (
                <div className="space-y-3">
                  {tiers.map((tier, idx) => (
                    <div key={idx} className="rounded-xl p-4 space-y-3" style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#F5A623]">Tier {idx + 1}</span>
                        {tiers.length > 1 && (
                          <button type="button" onClick={() => rmTier(idx)} className="text-xs text-[#EF4444] hover:text-red-400">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Rank">
                          <input value={tier.rank} onChange={(e) => updTier(idx, 'rank', e.target.value)} placeholder="1st" className={inputBase} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
                        </Field>
                        <Field label="Winners">
                          <input type="number" value={tier.winnersCount} onChange={(e) => updTier(idx, 'winnersCount', Number(e.target.value))} min="1" className={inputBase} style={iStyle(false)} onFocus={onFocus} onBlur={onBlur(false)} />
                        </Field>
                        <Field label="Prize" required error={errors[`t${idx}`]}>
                          <input value={tier.prize} onChange={(e) => updTier(idx, 'prize', e.target.value)} placeholder="₹10,000" className={inputBase} style={iStyle(!!errors[`t${idx}`])} onFocus={onFocus} onBlur={onBlur(!!errors[`t${idx}`])} />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addTier}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-[#5B5FEF] border border-dashed border-[rgba(91,95,239,0.3)] hover:border-[rgba(91,95,239,0.6)] hover:bg-[rgba(91,95,239,0.05)] transition-all">
                    + Add Tier
                  </button>
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity" style={{ background: '#5B5FEF' }}>
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</span> : 'Create Contest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
