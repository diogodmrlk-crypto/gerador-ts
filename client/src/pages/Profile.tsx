interface ProfileProps {
  onNavigate: (page: 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session') => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  return (
    <div className="page active" id="page-profile">
      <div className="profile-top-bar">
        <div className="profile-top-avatar">G</div>
        <div className="profile-top-info">
          <div className="profile-top-name">GHOST DASH</div>
          <div className="profile-top-balance">✦ Gold • Ativo</div>
        </div>
        <button className="profile-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
      <div className="profile-body">
        <div className="profile-group">
          <div className="profile-row">
            <div className="profile-row-left">
              <div className="pr-icon-wrap blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <div className="pr-label">Home</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pr-chevron">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <div className="profile-version">v1.0.0</div>
      </div>
    </div>
  );
}
