const COLOR = { ok: '#4caf50', warn: '#ff9800', danger: '#f44336' };

export default function FeedbackPanel({ warnings, angles }) {
  const severity = warnings.some(w => w.severity === 'danger')
    ? 'danger'
    : warnings.some(w => w.severity === 'warn')
    ? 'warn'
    : 'ok';

  return (
    <div style={{ background: '#1a1a1a', padding: '10px 14px', borderTop: `3px solid ${COLOR[severity]}` }}>
      <div style={{ color: COLOR[severity], fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        {severity === 'ok' ? '✓ 자세 양호' : severity === 'warn' ? '⚠ 주의' : '✗ 위험'}
      </div>

      {warnings.length === 0 && (
        <div style={{ color: '#888', fontSize: 13 }}>감지된 문제 없음</div>
      )}

      {warnings.map(w => (
        <div key={w.code} style={{ color: COLOR[w.severity], fontSize: 13, marginBottom: 4 }}>
          {w.message}
        </div>
      ))}

      {angles && Object.keys(angles).length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {Object.entries(angles).map(([k, v]) => (
            <span key={k} style={{ color: '#aaa', fontSize: 12 }}>
              {k}: {v.toFixed(0)}°
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
