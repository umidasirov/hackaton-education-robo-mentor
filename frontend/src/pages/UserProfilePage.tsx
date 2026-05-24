import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserProjects, type ProjectResponse } from '../services/projectService';
import { useAuthStore } from '../store/useAuthStore';
import { AppHeader } from '../components/layout/AppHeader';
import { useSEO } from '../utils/useSEO';
import './UserProfilePage.css';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  useSEO({
    title: `${username ?? 'Foydalanuvchi'} — vexio profili`,
    description: `${username ?? 'Ushbu foydalanuvchi'} tomonidan yaratilgan Arduino va ESP32 loyihalarini vexio platformasida ko‘ring.`,
    url: `https://simulyator.adxamov.uz/${username ?? ''}`,
    noindex: true,
  });

  const user = useAuthStore((s) => s.user);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isOwn = user?.username === username;

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError('');

    getUserProjects(username)
      .then(setProjects)
      .catch(() => setError('Foydalanuvchi topilmadi.'))
      .finally(() => setLoading(false));
  }, [username]);

  const openDeleteModal = (project: ProjectResponse) => {
    setSelectedProject(project);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setSelectedProject(null);
    setDeleteError('');
  };

  const deleteProject = async () => {
    if (!selectedProject) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      closeDeleteModal();
    } catch {
      setDeleteError('Loyihani o‘chirishda xatolik yuz berdi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = useCallback((e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/project/${projectId}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  return (
    <div className="profile-page">
      <AppHeader />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {username?.[0]?.toUpperCase()}
          </div>

          <h1 className="profile-username">{username}</h1>

          {isOwn && (
            <Link to="/editor" className="profile-new-btn">
              + Yangi loyiha
            </Link>
          )}
        </div>

        {loading && <p className="profile-muted">Yuklanmoqda…</p>}

        {error && <p className="profile-error">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p className="profile-muted">Hozircha ochiq loyihalar mavjud emas.</p>
        )}

        <div className="profile-grid">
          {deleteModalOpen && selectedProject && (
            <div className="delete-modal-overlay" onClick={closeDeleteModal}>
              <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal-icon">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </div>

                <h3>Loyihani o‘chirish</h3>

                <p>
                  <b>{selectedProject.name}</b> loyihasini rostdan ham
                  o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.
                </p>

                {deleteError && (
                  <div className="delete-modal-error">
                    {deleteError}
                  </div>
                )}

                <div className="delete-modal-actions">
                  <button
                    className="delete-modal-cancel"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Bekor qilish
                  </button>

                  <button
                    className="delete-modal-confirm"
                    onClick={deleteProject}
                    disabled={deleting}
                  >
                    {deleting ? 'O‘chirilmoqda...' : 'O‘chirish'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/${username}/${p.slug}`}
              className="profile-card"
            >
              <div className="profile-card-title">{p.name}</div>

              {p.description && (
                <div className="profile-card-desc">{p.description}</div>
              )}

              <div className="profile-card-meta">
                <span className="profile-badge">{p.board_type}</span>

                {!p.is_public && (
                  <span className="profile-badge profile-badge-private">
                    Shaxsiy
                  </span>
                )}

                <span className="profile-date">
                  {new Date(p.updated_at).toLocaleDateString('uz-UZ')}
                </span>

                {isOwn && (
                  <button
                    className="profile-delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(p);
                    }}
                    title="Loyihani o‘chirish"
                    aria-label="Loyihani o‘chirish"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                )}

                {p.is_public && (
                  <button
                    className="profile-share-btn"
                    onClick={(e) => handleCopyLink(e, p.id)}
                    title="Ulashish havolasini nusxalash"
                    aria-label="Ulashish havolasini nusxalash"
                  >
                    {copiedId === p.id ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};