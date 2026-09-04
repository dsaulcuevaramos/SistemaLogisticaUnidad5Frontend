// src/components/ControlPanel.jsx
import React from 'react';

export default function ControlPanel({ 
  pHubs, 
  setPHubs, 
  alpha, 
  setAlpha, 
  onOptimize, 
  loading,
  nodesCount 
}) {
  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Parámetros de Red</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
          Cantidad de Hubs (p):
        </label>
        <input 
          type="number" 
          min="1" 
          max={nodesCount || 5} 
          value={pHubs} 
          onChange={(e) => setPHubs(parseInt(e.target.value) || 1)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <small style={{ color: '#64748b' }}>Nodos a convertir en centros de consolidación.</small>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
          Factor de Descuento Troncal (α):
        </label>
        <input 
          type="number" 
          step="0.05" 
          min="0.1" 
          max="1.0" 
          value={alpha} 
          onChange={(e) => setAlpha(parseFloat(e.target.value) || 0.7)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <small style={{ color: '#64748b' }}>Ej: 0.70 significa un 30% de ahorro inter-hub.</small>
      </div>

      <button
        onClick={onOptimize}
        disabled={loading || nodesCount < pHubs}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: loading ? '#94a3b8' : '#0284c7',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: '0.2s'
        }}
      >
        {loading ? 'Optimizando Topología...' : 'Calcular Red Hub & Spoke'}
      </button>
    </div>
  );
}
