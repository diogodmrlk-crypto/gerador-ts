import { useState } from 'react';
import { useGeneratorStore } from '@/store/generatorStore';
import { showToast } from '@/lib/toast';

interface CreateModalProps {
  onClose: () => void;
}

export default function CreateModal({ onClose }: CreateModalProps) {
  const [qty, setQty] = useState(1);
  const [type, setType] = useState('weekly');
  const [duration, setDuration] = useState(1);
  const [pkgId, setPkgId] = useState('');
  const [autoClean, setAutoClean] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { packages, limitCount, addGeneratedKey, updateLimit, chartData, setChartData } =
    useGeneratorStore();

  const KEY_LIMIT = 5000;

  const generateKeyString = (keyType: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    return `GHOST-${keyType}-${rand}${Math.floor(Math.random() * 99999)
      .toString()
      .padStart(5, '0')}`;
  };

  const sendKeyToApi = async (pkgUrl: string, keyData: any) => {
    try {
      const res = await fetch(pkgUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(keyData),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const handleCreateKeys = async () => {
    const realQty = Math.min(qty, 100);

    if (!pkgId) {
      showToast('⚠️ Selecione um Package!');
      return;
    }

    if (limitCount >= KEY_LIMIT) {
      showToast('❌ Limite atingido!');
      return;
    }

    const maxQty = Math.min(realQty, KEY_LIMIT - limitCount);
    if (maxQty <= 0) {
      showToast('❌ Limite atingido!');
      return;
    }

    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) {
      showToast('⚠️ Package não encontrado');
      return;
    }

    setIsLoading(true);

    const today = new Date().toISOString().slice(0, 10);
    const newKeys = [];
    const sentOk = [];

    for (let i = 0; i < maxQty; i++) {
      const key = generateKeyString(type);
      const keyObj = {
        id: `local-${Date.now()}-${i}`,
        key,
        type,
        expire: duration,
        used: false,
        device: '',
        createdAt: Math.floor(Date.now() / 1000),
        activatedAt: 0,
        expiresAt: 0,
        _pkg: pkg.name,
        _pkgId: pkgId,
      };
      newKeys.push(keyObj);
      sentOk.push(await sendKeyToApi(pkg.url, keyObj));
    }

    // Add keys to store
    newKeys.forEach((k) => addGeneratedKey(k));

    // Update limit
    updateLimit(maxQty);

    // Update chart
    const newChartData = { ...chartData };
    newChartData[today] = (newChartData[today] || 0) + maxQty;
    setChartData(newChartData);

    setGeneratedResults(newKeys.map((k) => k.key));
    setIsLoading(false);

    const okCount = sentOk.filter(Boolean).length;
    showToast(
      `✅ ${maxQty} key(s)! ${
        okCount === maxQty
          ? '📡 Enviadas!'
          : okCount > 0
            ? `⚠️ ${okCount}/${maxQty}`
            : '💾 Local'
      }`
    );
  };

  const handleCopyAll = () => {
    if (generatedResults.length === 0) return;
    navigator.clipboard.writeText(generatedResults.join('\n'));
    showToast(`📋 ${generatedResults.length} keys copiadas!`);
  };

  const preview = `GHOST-${type}-${'X'.repeat(10)}${Math.floor(Math.random() * 99999)}`;

  return (
    <div className="modal-overlay open" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">🔑 Criar Keys</span>
          <button className="modal-close-btn" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">
            Quantidade <span className="req">*</span>
          </label>
          <input
            className="form-input"
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Duração <span className="req">*</span>
          </label>
          <div className="form-row">
            <input
              className="form-input"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              min="1"
            />
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="weekly">Week</option>
              <option value="monthly">Month</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Package / Destino API <span className="req">*</span>
          </label>
          <select
            className="form-select"
            value={pkgId}
            onChange={(e) => setPkgId(e.target.value)}
          >
            <option value="">— Selecionar package —</option>
            {packages
              .filter((p) => p.enabled)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div className="toggle-row">
          <div className="toggle-row-txt">
            <div className="tl">Auto clean key</div>
            <div className="ts">Remove keys não usadas/expiradas</div>
          </div>
          <div
            className={`toggle ${autoClean ? '' : 'off'}`}
            onClick={() => setAutoClean(!autoClean)}
          >
            <div className="toggle-knob" />
          </div>
        </div>

        <div className="preview-label">Preview da key</div>
        <div className="preview-box">{preview}</div>

        {generatedResults.length > 0 && (
          <div id="generated-results">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                ✅ Keys Geradas
              </span>
              <button
                onClick={handleCopyAll}
                style={{
                  background: 'var(--blue)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                }}
              >
                Copiar Todas
              </button>
            </div>
            <div id="generated-keys-list">
              {generatedResults.map((key, idx) => (
                <div key={idx} className="result-key-item">
                  <div className="result-key-text">{key}</div>
                  <button
                    className="result-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(key);
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
              ))}
            </div>
          </div>
        )}

        <button
          className="create-btn"
          onClick={handleCreateKeys}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Gerando...' : '✦ Gerar Keys'}
        </button>
      </div>
    </div>
  );
}
