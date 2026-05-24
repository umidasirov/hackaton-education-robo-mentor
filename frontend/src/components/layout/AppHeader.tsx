import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import { ShareModal } from './ShareModal';
import './app.css';
// Hujjatlar dropdown uchun qo'shimcha bo'limlar
const DOCS_LINKS = [
  { key: 'getting-started', label: 'Boshlash' },
  { key: 'components', label: 'Komponentlar' },
  { key: 'architecture', label: 'Arxitektura' },
  { key: 'wokwi-libs', label: 'Kutubxonalar' },
  { key: 'mcp', label: 'MCP Server' },
  { key: 'roadmap', label: "Yo'l xaritasi" },
];

interface AppHeaderProps {}

export const AppHeader: React.FC<AppHeaderProps> = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const currentProject = useProjectStore((s) => s.currentProject);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [docsMenuOpen, setDocsMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  // "Loyihalar" — umumiy darslar va loyihalar sahifasi
  const handleProjectsClick = () => {
    setMenuOpen(false);
    navigate('/projects');
  };

  const isActive = (path: string) =>
    location.pathname === path ? ' header-nav-link-active' : '';

  return (
     <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          {/* Brand */}
          <div className="header-brand">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0071e3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
            </svg>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="header-title">RoboMentor</span>
            </Link>
          </div>

          {/* Main nav links (desktop) */}
          <nav className={'header-nav-links' + (menuOpen ? ' header-nav-open' : '')}>
            <Link to="/" className={'header-nav-link' + isActive('/')}>
              Bosh sahifa
            </Link>
            <button
              type="button"
              onClick={handleProjectsClick}
              className={
                'header-nav-link' +
                (user && location.pathname === `/${user.username}` ? ' header-nav-link-active' : '')
              }
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Loyihalar
            </button>

            {/* Hujjatlar - qo'shimcha bo'limlar bilan dropdown */}
            <div
              className="header-docs-wrapper"
              onMouseEnter={() => setDocsMenuOpen(true)}
              onMouseLeave={() => setDocsMenuOpen(false)}
            >
              <Link
                to="/docs"
                className={'header-nav-link' + isActive('/docs')}
                onClick={() => setMenuOpen(false)}
              >
                Hujjatlar
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginLeft: 3, opacity: 0.6 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </Link>
              {docsMenuOpen && (
                <div className="header-docs-menu">
                  {DOCS_LINKS.map((d) => (
                    <Link
                      key={d.key}
                      to={`/docs/${d.key}`}
                      className="header-docs-item"
                      onClick={() => {
                        setDocsMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: share + auth + mobile hamburger */}
        <div className="header-right">
          {/* Auto-save status — only when a project is loaded and the editor
              page mounted the hook */}
          {/* {autoSave && currentProject && <AutoSaveIndicator state={autoSave} />} */}

          {/* Share button — visible when a project is loaded */}
          {currentProject && location.pathname === '/editor' && (
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                borderRadius: 4,
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#ccc',
                fontSize: 13,
              }}
              title="Loyihani ulashish"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Ulashish
            </button>
          )}

          {/* Auth UI */}
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  background: 'transparent',
                  border: '1px solid #555',
                  borderRadius: 20,
                  padding: '3px 10px 3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ccc',
                  fontSize: 13,
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    style={{ width: 22, height: 22, borderRadius: '50%' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#0e639c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <span className="header-username-text">{user.username}</span>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    background: '#252526',
                    border: '1px solid #3c3c3c',
                    borderRadius: 6,
                    minWidth: 150,
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,.4)',
                  }}
                >
                  <Link
                    to={`/${user.username}`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '9px 14px',
                      color: '#ccc',
                      textDecoration: 'none',
                      fontSize: 13,
                    }}
                  >
                    Mening loyihalarim
                  </Link>
                  <div style={{ borderTop: '1px solid #3c3c3c' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '9px 14px',
                      color: '#ccc',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/login"
                style={{
                  color: '#ccc',
                  padding: '4px 10px',
                  fontSize: 13,
                  textDecoration: 'none',
                  border: '1px solid #555',
                  borderRadius: 4,
                }}
              >
                Kirish
              </Link>
              <Link
                to="/register"
                style={{
                  color: '#fff',
                  padding: '4px 10px',
                  fontSize: 13,
                  textDecoration: 'none',
                  background: '#0e639c',
                  borderRadius: 4,
                }}
              >
                Ro'yxatdan o'tish
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="header-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </header>
  );
};
