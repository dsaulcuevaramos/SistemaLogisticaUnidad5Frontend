// src/App.tsx
import { useState, useEffect } from 'react';
import MapNetwork from './components/MapNetwork';
import ControlPanel from './components/ControlPanel';
import DataManagement from './components/DataManagement';
import type{ NodeItem, FlowItem, OptimizationSolution } from './types';
import Swal from 'sweetalert2';
import './App.css';

const INITIAL_NODES: NodeItem[] = [
  { id: '1', name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { id: '2', name: 'Pucallpa', lat: -8.3791, lng: -74.5539 },
];

export default function App() {
  const [nodes, setNodes] = useState<NodeItem[]>(() => {
    const saved = localStorage.getItem('hubspoke_nodes');
    return saved ? JSON.parse(saved) : INITIAL_NODES;
  });

  const [flows, setFlows] = useState<FlowItem[]>(() => {
    const saved = localStorage.getItem('hubspoke_flows');
    return saved ? JSON.parse(saved) : [];
  });

  const [pHubs, setPHubs] = useState<number>(1);
  const [alpha, setAlpha] = useState<number>(0.70);
  const [solution, setSolution] = useState<OptimizationSolution | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('hubspoke_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('hubspoke_flows', JSON.stringify(flows));
  }, [flows]);

  const handleMapClick = async (lat: number, lng: number) => {
    const { value: cityName } = await Swal.fire({
      title: 'Agregar Nueva Ciudad',
      html: `Estás marcando las coordenadas:<br><b>Lat:</b> ${lat.toFixed(4)} | <b>Lng:</b> ${lng.toFixed(4)}`,
      input: 'text',
      inputPlaceholder: 'Ej. Tarapoto, Iquitos...',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Guardar Ciudad',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir un nombre para la ciudad!';
        }
      }
    });

    if (cityName) {
      const newNode: NodeItem = {
        id: String(Date.now()),
        name: cityName.trim(),
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4))
      };
      setNodes(prev => [...prev, newNode]);
      
      // Opcional: Pequeña notificación de éxito
      Swal.fire({
        title: 'Agregada',
        text: `${cityName} se añadió al mapa.`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sistemalogisticaunidad5backend.onrender.com/api/optimize-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, flows, p_hubs: pHubs, alpha })
      });
      if (!response.ok) throw new Error('Error al procesar los datos');
      const data = await response.json();
      setSolution(data);
    } catch (error: any) {
      alert('Error al conectar con el backend: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar Fijo Corporativo */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Central Hub & Spoke</h2>
        </div>
        <nav>
          <button className="active">Panel de Operaciones</button>
        </nav>
      </aside>

      {/* Panel Principal Unificado */}
      <main className="main-content panel-scroll">
        <div className="header-section">
          <h3>Topología y Gestión de Red</h3>
          <p>Planificación estratégica, asignación de flujos y consolidación de carga.</p>
        </div>

        {/* Zona Superior: Controles y Mapa */}
        <div className="dashboard-grid">
          <div>
            <ControlPanel 
              pHubs={pHubs} setPHubs={setPHubs} alpha={alpha} setAlpha={setAlpha}
              onOptimize={handleOptimize} loading={loading} nodesCount={nodes.length}
            />
            {solution && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#065f46' }}>Optimización Completada</h4>
                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Costo Total:</strong> {solution.total_cost.toLocaleString()} unid.</p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Hubs:</strong> {solution.hubs.map(h => nodes.find(n => n.id === h)?.name || h).join(', ')}</p>
              </div>
            )}
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#64748b', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              💡 <strong>Tip:</strong> Haz clic en cualquier parte del mapa para agregar una nueva ciudad automáticamente. Verás cómo aparece inmediatamente en la tabla inferior.
            </div>
          </div>

          <div>
            {/* Pasamos los flows al mapa */}
            <MapNetwork nodes={nodes} flows={flows} solution={solution} onAddNodeFromMap={handleMapClick} />
          </div>
        </div>

        {/* Zona Inferior: Tablas de Gestión (ahora siempre visibles) */}
        <div style={{ marginTop: '32px' }}>
          <DataManagement nodes={nodes} setNodes={setNodes} flows={flows} setFlows={setFlows} />
        </div>
      </main>
    </div>
  );
}