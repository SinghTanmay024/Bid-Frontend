import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCoinStore } from '../store/coinStore';
import BuyCoinModal from './BuyCoinModal';

export default function Navbar() {
  const { userId, email, logout } = useAuthStore();
  const { coins } = useCoinStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);

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
    <>
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
              {userId && (
                <Link
                  to="/favourites"
                  className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 fill-red-400" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favourites
                </Link>
              )}
              {userId && (
                <Link
                  to="/products/add"
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20"
                >
                  + Add Product
                </Link>
              )}
            </div>

            {/* ── Right side ── */}
            <div className="hidden md:flex items-center gap-3">
              {userId ? (
                <>
                  {/* ── Coin balance chip ── */}
                  <button
                    onClick={() => setCoinModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors group"
                    title="Buy more coins"
                  >
                    <span className="text-base leading-none">🪙</span>
                    <span className="text-sm font-bold text-yellow-400">{coins}</span>
                    <svg className="w-3 h-3 text-yellow-500/60 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* ── User dropdown ── */}
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
                      <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111827] border border-white/10 shadow-xl shadow-black/40 overflow-hidden">
                        {/* Coin balance row inside dropdown */}
                        <button
                          onClick={() => { setDropdownOpen(false); setCoinModalOpen(true); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors"
                        >
                          <span>🪙</span>
                          <span className="flex-1 text-left">Coins</span>
                          <span className="font-bold text-yellow-400">{coins}</span>
                          <span className="text-xs text-[#6366F1] font-semibold">+ Buy</span>
                        </button>
                        <div className="border-t border-white/[0.06]" />
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
                        <Link
                          to="/favourites"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>❤️</span> My Favourites
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
                </>
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
              {userId && (
                <Link to="/favourites" className="px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 fill-red-400" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favourites
                </Link>
              )}
              {userId && (
                <Link to="/products/add" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-center hover:opacity-90 transition-opacity">
                  + Add Product
                </Link>
              )}
              <div className="border-t border-white/[0.06] my-2" />
              {userId ? (
                <>
                  <div className="px-3 py-2 text-xs text-[#9CA3AF] truncate">{email}</div>

                  {/* Mobile coin balance */}
                  <button
                    onClick={() => { setMobileOpen(false); setCoinModalOpen(true); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#E5E7EB] hover:bg-white/5 transition-colors"
                  >
                    <span>🪙</span>
                    <span className="flex-1 text-left">My Coins</span>
                    <span className="font-bold text-yellow-400 mr-1">{coins}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#6366F1]/20 text-[#818CF8] font-semibold">+ Buy</span>
                  </button>

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

      {/* ── Buy Coin Modal ── */}
      {coinModalOpen && (
        <BuyCoinModal
          onClose={() => setCoinModalOpen(false)}
          userEmail={email}
        />
      )}
    </>
  );
}
