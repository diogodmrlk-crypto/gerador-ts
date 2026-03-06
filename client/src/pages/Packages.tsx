interface PackagesProps {
  onNavigate: (page: 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session') => void;
}

export default function Packages({ onNavigate }: PackagesProps) {
  return (
    <div className="page active" id="page-packages">
      <div className="page-header">
        <button className="ph-btn" onClick={() => onNavigate('home')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="page-header-title">Packages</div>
        <div className="page-header-actions">
          <button className="ph-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="scroll-area">
        <div id="packages-list" style={{ padding: '14px' }}>
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">Nenhum package ainda</div>
          </div>
        </div>
      </div>
    </div>
  );
}
