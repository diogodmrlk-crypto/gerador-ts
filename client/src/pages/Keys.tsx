interface KeysProps {
  onNavigate: (page: 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session') => void;
}

export default function Keys({ onNavigate }: KeysProps) {
  return (
    <div className="page active" id="page-keys">
      <div className="page-header">
        <button
          className="ph-btn"
          onClick={() => onNavigate('home')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="page-header-title">Keys</div>
        <div className="page-header-actions">
          <button className="ph-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
      <div className="search-bar">
        <input className="search-input" type="text" placeholder="Buscar keys..." />
      </div>
      <div className="scroll-area">
        <div id="keys-list" style={{ padding: '14px' }}>
          <div className="empty">
            <div className="empty-icon">🔑</div>
            <div className="empty-text">Nenhuma key encontrada</div>
          </div>
        </div>
      </div>
    </div>
  );
}
