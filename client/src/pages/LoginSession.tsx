interface LoginSessionProps {
  onNavigate: (page: 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session') => void;
}

export default function LoginSession({ onNavigate }: LoginSessionProps) {
  return (
    <div className="page active" id="page-login-session">
      <div className="page-header">
        <button className="ph-btn" onClick={() => onNavigate('profile')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="page-header-title">Sessões</div>
        <div className="page-header-actions">
          <button className="ph-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
            </svg>
          </button>
        </div>
      </div>
      <div className="scroll-area">
        <div id="sessions-list" style={{ padding: '14px' }}>
          <div className="empty">
            <div className="empty-icon">📱</div>
            <div className="empty-text">Nenhuma sessão encontrada</div>
          </div>
        </div>
      </div>
    </div>
  );
}
