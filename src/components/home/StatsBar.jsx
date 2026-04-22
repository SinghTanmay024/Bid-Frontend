import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 1800, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnVisible) {
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          runCountUp();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();

    function runCountUp() {
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(step);
        else setCount(target);
      };
      requestAnimationFrame(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix, prefix, label, icon, delay }) {
  const { count, ref } = useCountUp(value);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 px-6 py-5"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg mr-1">{icon}</span>
        {prefix && <span className="text-2xl font-bold text-[#F59E0B]">{prefix}</span>}
        <span className="text-3xl font-bold text-white tabular-nums">
          {count.toLocaleString('en-IN')}
        </span>
        {suffix && <span className="text-xl font-bold text-[#9CA3AF] ml-0.5">{suffix}</span>}
      </div>
      <p className="text-sm text-[#9CA3AF] text-center">{label}</p>
    </div>
  );
}

const STATS = [
  { icon: '🏆', value: 2400, suffix: '+', label: 'Winners So Far' },
  { icon: '📦', value: 580, suffix: '+', label: 'Products Listed' },
  { icon: '👥', value: 18000, suffix: '+', label: 'Active Bidders' },
  { icon: '💰', prefix: '₹', value: 50, suffix: 'L+', label: 'Won So Far' },
];

export default function StatsBar() {
  return (
    <section className="border-y border-white/[0.06] bg-[#111827]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.label}
              {...stat}
              delay={`${i * 80}ms`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
