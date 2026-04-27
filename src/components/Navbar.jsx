import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCoinStore } from '../store/coinStore';
import BuyCoinModal from './BuyCoinModal';

export default function Navbar() {
  const { userId, email, role, logout } = useAuthStore();
  const { coins } = useCoinStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : '?';

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`text-sm font-medium transition-colors ${
        isActive(path)
          ? 'text-white'
          : 'text-[#6B6B78] hover:text-[#A0A0AB]'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          background: scrolled
            ? 'rgba(12,12,14,0.92)'
            : 'rgba(12,12,14,0)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-7 h-7 rounded-lg bg-[#5B5FEF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white">BidWin</span>
            </Link>

            {/* Center nav — desktop */}
            <div className="hidden md:flex items-center gap-7">
              {navLink('/', 'Home')}
              {navLink('/contests', 'Contests')}
              {navLink('/how-it-works', 'How It Works')}
              {navLink('/contact', 'Contact')}
              {userId && navLink('/my-bids', 'My Bids')}
              {userId && (
                <Link
                  to="/favourites"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/favourites') ? 'text-white' : 'text-[#6B6B78] hover:text-[#A0A0AB]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-[#EF4444]" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favourites
                </Link>
              )}
            </div>

            {/* Right side — desktop */}
            <div className="hidden md:flex items-center gap-2.5">
              {userId ? (
                <>
                  {/* Create Contest */}
                  <Link
                    to="/contests/create"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#5B5FEF] hover:bg-[#7477F5] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Contest
                  </Link>

                  {/* Coin chip */}
                  <button
                    onClick={() => setCoinModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.08)] hover:bg-[rgba(245,166,35,0.14)] transition-colors"
                    title="Buy more coins"
                  >
                    <span className="text-sm">🪙</span>
                    <span className="text-sm font-bold text-[#F5A623]">{coins}</span>
                  </button>

                  {/* User dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((o) => !o)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors ${
                        dropdownOpen
                          ? 'border-[rgba(91,95,239,0.4)] bg-[rgba(91,95,239,0.08)]'
                          : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-[#5B5FEF] flex items-center justify-center text-[11px] font-bold text-white">
                        {initials}
                      </div>
                      <span className="text-sm text-[#A0A0AB] max-w-[100px] truncate">
                        {email?.split('@')[0]}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 text-[#6B6B78] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#18181C] border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/50 overflow-hidden animate-scale-in">
                        <div className="px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                          <p className="text-xs text-[#6B6B78] truncate">{email}</p>
                        </div>

                        <button
                          onClick={() => { setDropdownOpen(false); setCoinModalOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#A0A0AB] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                        >
                          <span className="text-base leading-none">🪙</span>
                          <span className="flex-1 text-left">Coins</span>
                          <span className="font-bold text-[#F5A623]">{coins}</span>
                        </button>

                        <Link
                          to="/profile/edit"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#A0A0AB] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>

                        <Link
                          to="/my-bids"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#A0A0AB] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Bids
                        </Link>

                        <Link
                          to="/favourites"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#A0A0AB] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 fill-[#EF4444]" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Favourites
                        </Link>

                        {role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#F5A623] hover:bg-[rgba(245,166,35,0.06)] hover:text-white transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-[rgba(255,255,255,0.06)] mt-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#A0A0AB] hover:text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#5B5FEF] hover:bg-[#7477F5] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0AB] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[rgba(255,255,255,0.06)] bg-[rgba(12,12,14,0.98)] backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-0.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/contests', label: 'Contests' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2.5 rounded-lg text-sm text-[#A0A0AB] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  {label}
                </Link>
              ))}

              {userId && (
                <>
                  <Link to="/my-bids" className="px-3 py-2.5 rounded-lg text-sm text-[#A0A0AB] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    My Bids
                  </Link>
                  <Link to="/favourites" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#A0A0AB] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <svg className="w-3.5 h-3.5 fill-[#EF4444]" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favourites
                  </Link>
                </>
              )}

              <div className="my-2 h-px bg-[rgba(255,255,255,0.06)]" />

              {userId ? (
                <>
                  <div className="px-3 py-2 text-xs text-[#6B6B78] truncate">{email}</div>
                  <button
                    onClick={() => { setMobileOpen(false); setCoinModalOpen(true); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#A0A0AB] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    <span>🪙</span>
                    <span className="flex-1 text-left">My Coins</span>
                    <span className="font-bold text-[#F5A623]">{coins}</span>
                  </button>
                  <Link
                    to="/contests/create"
                    className="mx-3 mt-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#5B5FEF] text-center hover:bg-[#7477F5] transition-colors"
                  >
                    + New Contest
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-lg text-sm text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors text-left mt-1"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-3 pt-1 pb-2">
                  <Link
                    to="/login"
                    className="text-center py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-sm text-[#A0A0AB] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2.5 rounded-lg bg-[#5B5FEF] text-sm font-semibold text-white hover:bg-[#7477F5] transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {coinModalOpen && (
        <BuyCoinModal onClose={() => setCoinModalOpen(false)} userEmail={email} />
      )}
    </>
  );
}
