import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { userId, email, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Get initials from email
  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : '?';

  const navBase =
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
  const navBg = scrolled || !isHome
    ? 'bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.06] shadow-lg shadow-black/30'
    : 'bg-transparent border-b border-transparent';

  return (
    <nav className={`${navBase} ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold tracking-tight gradient-text">BidWin</span>
          </Link>

          {/* ── Center nav (desktop) ── */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
            >
              Contact
            </Link>
            {userId && (
              <Link
                to="/my-bids"
                className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
              >
                My Bids
              </Link>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-3">
            {userId ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#6366F1]/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm text-[#E5E7EB] max-w-[120px] truncate">
                    {email?.split('@')[0]}
                  </span>
                  <svg className={`w-4 h-4 text-[#9CA3AF] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-white/10 shadow-xl shadow-black/40 overflow-hidden">
                    <Link
                      to="/profile/edit"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>👤</span> My Profile
                    </Link>
                    <Link
                      to="/my-bids"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>🎯</span> My Bids
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-white/15 text-[#E5E7EB] hover:border-[#6366F1]/60 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0E1A]/95 backdrop-blur-md border-t border-white/[0.06] px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <Link to="/" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors">
              How It Works
            </Link>
            <Link to="/contact" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors">
              Contact
            </Link>
            {userId && (
              <Link to="/my-bids" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors">
                My Bids
              </Link>
            )}
            <div className="border-t border-white/[0.06] my-2" />
            {userId ? (
              <>
                <div className="px-3 py-2 text-xs text-[#9CA3AF] truncate">{email}</div>
                <Link to="/profile/edit" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors">
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-lg border border-white/15 text-sm text-[#E5E7EB] hover:border-[#6366F1]/60 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
