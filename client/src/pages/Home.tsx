import { useState, useEffect } from 'react';
import { useGeneratorStore } from '@/store/generatorStore';
import { showToast } from '@/lib/toast';
import CreateModal from '@/components/CreateModal';
import Chart from '@/components/Chart';

interface HomeProps {
  onNavigate: (page: 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    generatedKeys,
    apiKeys,
    limitCount,
    updateLimit,
    deletedIds,
  } = useGeneratorStore();

  const getMergedKeys = () => {
    const filteredApi = apiKeys.filter((k) => !deletedIds.has(k.id));
    const apiIdSet = new Set(filteredApi.map((k) => k.id));
    const localOnly = generatedKeys.filter(
      (k) => !apiIdSet.has(k.id) && !deletedIds.has(k.id)
    );
    return [...filteredApi, ...localOnly];
  };

  const allKeys = getMergedKeys();
  const totalKeys = allKeys.length;
  const pendingKeys = allKeys.filter((k) => !k.used).length;
  const activeDevices = allKeys.filter((k) => k.used).length;

  const handleRefresh = async () => {
    showToast('🔄 Atualizando...');
    try {
      const res = await fetch('https://teste-api-mcok.vercel.app/keys', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          useGeneratorStore.setState({
            apiKeys: data.filter((k) => !deletedIds.has(k.id)),
          });
        }
      }
    } catch (e) {
      console.warn('API fetch failed:', e);
    }
    showToast('✅ Dados atualizados!');
  };

  const pct = (limitCount / 5000) * 100;
  const barColor =
    pct > 90
      ? 'linear-gradient(90deg,#f87171,#ef4444)'
      : pct > 70
        ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
        : 'linear-gradient(90deg,#4ade80,#22c55e)';

  const homeKeys = allKeys.slice(0, 5);

  return (
    <div className="page active" id="page-home">
      {/* Header */}
      <div className="home-header">
        <div className="home-top">
          <div className="user-info">
            <div className="avatar">G</div>
            <div>
              <div className="user-name">GHOST DASH</div>
              <div className="user-plan">✦ Gold • Ativo</div>
            </div>
          </div>
          <div className="header-icons">
            <button onClick={handleRefresh}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
              </svg>
            </button>
            <button onClick={() => setShowCreateModal(true)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Limit Bar */}
        <div className="limit-bar-wrap">
          <div className="limit-row">
            <span className="limit-label" data-i18n="keys_generated">
              Keys Geradas
            </span>
            <span className="limit-count" id="limit-count-text">
              {limitCount.toLocaleString('pt-BR')} / 5.000
            </span>
          </div>
          <div className="limit-bar-bg">
            <div
              className="limit-bar-fill"
              id="limit-bar"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card" onClick={() => onNavigate('keys')}>
            <div className="stat-label">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6M15.5 7.5l3 3" />
              </svg>
              Keys
            </div>
            <div className="stat-num" id="stat-total">
              {totalKeys}
            </div>
            <div className="stat-footer">
              <div>
                <div className="stat-sub" data-i18n="pending">
                  Pendentes
                </div>
                <div className="stat-sub-val" id="stat-pending">
                  {pendingKeys}
                </div>
              </div>
              <div className="go-btn">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card" onClick={() => onNavigate('devices')}>
            <div className="stat-label">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              Devices
            </div>
            <div className="stat-num" id="stat-devices">
              {activeDevices}
            </div>
            <div className="stat-footer">
              <div>
                <div className="stat-sub" data-i18n="active">
                  Ativas
                </div>
                <div className="stat-sub-val" id="stat-active">
                  {activeDevices}
                </div>
              </div>
              <div className="go-btn">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="home-body">
        <div className="quick-actions">
          <div className="qa-btn" onClick={() => setShowCreateModal(true)}>
            <div className="qa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56e8"
                strokeWidth="2"
              >
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6M15.5 7.5l3 3" />
              </svg>
            </div>
            <div className="qa-label">Gerar</div>
          </div>

          <div className="qa-btn" onClick={() => onNavigate('keys')}>
            <div className="qa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56e8"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="qa-label">Keys</div>
          </div>

          <div className="qa-btn" onClick={() => onNavigate('devices')}>
            <div className="qa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56e8"
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="qa-label">Devices</div>
          </div>

          <div className="qa-btn" onClick={() => onNavigate('packages')}>
            <div className="qa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56e8"
                strokeWidth="2"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div className="qa-label">Packages</div>
          </div>
        </div>

        {/* Chart */}
        <div className="section-title">Últimos 7 dias</div>
        <div className="chart-card">
          <div className="chart-legend">
            <div className="chart-dot" />
            <div className="chart-legend-label">Keys geradas</div>
          </div>
          <Chart />
        </div>

        {/* Recent Keys */}
        <div className="section-header">
          <span className="section-title">Keys Recentes</span>
          <button
            className="section-btn"
            onClick={() => onNavigate('keys')}
          >
            Ver todas
          </button>
        </div>
        <div id="home-keys-list">
          {homeKeys.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#9ca3af',
                fontSize: '13px',
              }}
            >
              Nenhuma key ainda
            </div>
          ) : (
            homeKeys.map((k) => (
              <div
                key={k.id}
                className="list-item"
                style={{
                  borderRadius: '12px',
                  marginBottom: '5px',
                  boxShadow: 'var(--shadow)',
                  border: 'none',
                }}
              >
                <div className="item-body">
                  <div className="item-key" style={{ fontSize: '12.5px' }}>
                    {k.key}
                  </div>
                  <div className="item-meta">
                    {k.type === 'weekly'
                      ? '1 semana'
                      : k.type === 'monthly'
                        ? '1 mês'
                        : k.type === 'lifetime'
                          ? 'Lifetime'
                          : k.type}
                  </div>
                </div>
                <span
                  className={`badge ${k.used ? 'active' : 'pending'}`}
                >
                  {k.used ? 'Ativa' : 'Pendente'}
                </span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(k.key);
                    showToast('📋 Copiado!');
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
