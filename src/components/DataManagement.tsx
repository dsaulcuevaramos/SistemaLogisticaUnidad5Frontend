// src/components/DataManagement.tsx
import React, { useState, type Dispatch, type SetStateAction } from 'react';
import type{ NodeItem, FlowItem } from '../types';

interface DataManagementProps {
  nodes: NodeItem[];
  setNodes: Dispatch<SetStateAction<NodeItem[]>>;
  flows: FlowItem[];
  setFlows: Dispatch<SetStateAction<FlowItem[]>>;
}

export default function DataManagement({ nodes, setNodes, flows, setFlows }: DataManagementProps) {
  const [tab, setTab] = useState<'nodes' | 'flows'>('nodes');

  // Estado para nuevo flujo
  const [newFlowSrc, setNewFlowSrc] = useState('');
  const [newFlowDst, setNewFlowDst] = useState('');
  const [newFlowAmount, setNewFlowAmount] = useState('');

  const handleRemoveNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setFlows(prev => prev.filter(f => f.source_id !== id && f.target_id !== id));
  };

  const handleAddFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlowSrc || !newFlowDst || !newFlowAmount || newFlowSrc === newFlowDst) return;

    const newFlow: FlowItem = {
      source_id: newFlowSrc,
      target_id: newFlowDst,
      amount: parseFloat(newFlowAmount)
    };

    setFlows(prev => {
      const filtered = prev.filter(f => !(f.source_id === newFlowSrc && f.target_id === newFlowDst));
      return [...filtered, newFlow];
    });

    setNewFlowAmount('');
  };

  const handleRemoveFlow = (src: string, dst: string) => {
    setFlows(prev => prev.filter(f => !(f.source_id === src && f.target_id === dst)));
  };

  const getNodeName = (id: string) => nodes.find(n => n.id === id)?.name || id;

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      {/* Selector de pestañas */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setTab('nodes')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: tab === 'nodes' ? '#0f172a' : '#f1f5f9',
            color: tab === 'nodes' ? '#fff' : '#475569',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          Ciudades en el Mapa ({nodes.length})
        </button>
        <button
          onClick={() => setTab('flows')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: tab === 'flows' ? '#0f172a' : '#f1f5f9',
            color: tab === 'flows' ? '#fff' : '#475569',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          Matriz de Flujos / Demanda ({flows.length})
        </button>
      </div>

      {/* Pestaña: Nodos (Solo visualización y eliminación) */}
      {tab === 'nodes' && (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
            📍 Para agregar más ciudades, haz clic directamente sobre la zona deseada en el mapa superior.
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px' }}>Ciudad / Nodo</th>
                  <th style={{ padding: '10px 12px' }}>Coordenadas (Lat, Lng)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>{n.name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{n.lat}, {n.lng}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveNode(n.id)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {nodes.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                      No hay ciudades registradas. Haz clic en el mapa para marcar una.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña: Flujos */}
      {tab === 'flows' && (
        <div>
          <form onSubmit={handleAddFlow} style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={newFlowSrc}
              onChange={e => setNewFlowSrc(e.target.value)}
              style={{ flex: '1', minWidth: '140px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="">-- Ciudad Origen --</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <select
              value={newFlowDst}
              onChange={e => setNewFlowDst(e.target.value)}
              style={{ flex: '1', minWidth: '140px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="">-- Ciudad Destino --</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <input
              type="number"
              placeholder="Carga (ton / unidades)"
              value={newFlowAmount}
              onChange={e => setNewFlowAmount(e.target.value)}
              style={{ flex: '1', minWidth: '140px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
            />

            <button
              type="submit"
              style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
              + Asignar Demanda
            </button>
          </form>

          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px' }}>Origen</th>
                  <th style={{ padding: '10px 12px' }}>Destino</th>
                  <th style={{ padding: '10px 12px' }}>Volumen Transportado</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f, i) => (
                  <tr key={`${f.source_id}-${f.target_id}-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{getNodeName(f.source_id)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{getNodeName(f.target_id)}</td>
                    <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 'bold' }}>{f.amount} unidades</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveFlow(f.source_id, f.target_id)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {flows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                      No hay flujos de demanda registrados. Agrega al menos un par origen-destino.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}