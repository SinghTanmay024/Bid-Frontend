import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const STATS = [
  { value: 2400,  suffix: '+',  prefix: '',  label: 'Total Winners',    sub: 'and counting' },
  { value: 580,   suffix: '+',  prefix: '',  label: 'Products Listed',  sub: 'across all categories' },
  { value: 18000, suffix: '+',  prefix: '',  label: 'Active Bidders',   sub: 'registered users' },
  { value: 50,    suffix: 'L+', prefix: '₹', label: 'Total Value Won',  sub: 'by our community' },
];

function StatItem({ value, suffix, prefix, label, sub }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col gap-1 py-7 px-6">
      <div className="flex items-baseline gap-0.5 tabular-nums">
        {prefix && <span className="text-xl font-bold text-[#F5A623]">{prefix}</span>}
        <span className="text-3xl font-bold text-white">{count.toLocaleString('en-IN')}</span>
        {suffix && <span className="text-xl font-semibold text-[#6B6B78] ml-0.5">{suffix}</span>}
      </div>
      <p className="text-sm font-medium text-[#A0A0AB]">{label}</p>
      <p className="text-xs text-[#6B6B78]">{sub}</p>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#111114',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[rgba(255,255,255,0.06)]">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
