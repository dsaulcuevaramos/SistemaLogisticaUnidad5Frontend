// src/components/MapNetwork.tsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type{ LatLngExpression, LeafletMouseEvent } from 'leaflet';
import type{ NodeItem, FlowItem, OptimizationSolution } from '../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const hubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [28, 45], iconAnchor: [14, 45], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const spokeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [22, 35], iconAnchor: [11, 35], popupAnchor: [1, -30], shadowSize: [35, 35]
});

interface NetworkLine {
  id: string;
  positions: [LatLngExpression, LatLngExpression];
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

interface MapNetworkProps {
  nodes: NodeItem[];
  flows: FlowItem[]; // <-- Agregamos los flujos aquí
  solution: OptimizationSolution | null;
  onAddNodeFromMap: (lat: number, lng: number) => void;
}

export default function MapNetwork({ nodes, flows, solution, onAddNodeFromMap }: MapNetworkProps) {
  const defaultCenter: LatLngExpression = [-9.38, -75.0];

  const getNodeCoords = (id: string): [number, number] | null => {
    const node = nodes.find(n => n.id === id);
    return node ? [node.lat, node.lng] : null;
  };

  const getNodeName = (id: string) => nodes.find(n => n.id === id)?.name || id;

  const feederLines: NetworkLine[] = [];
  if (solution?.assignments) {
    Object.entries(solution.assignments).forEach(([spokeId, hubId]) => {
      if (spokeId !== hubId) {
        const from = getNodeCoords(spokeId);
        const to = getNodeCoords(hubId);
        if (from && to) {
          feederLines.push({
            id: `${spokeId}-${hubId}`,
            positions: [from as LatLngExpression, to as LatLngExpression]
          });
        }
      }
    });
  }

  const trunkLines: NetworkLine[] = [];
  if (solution?.hubs && solution.hubs.length > 1) {
    for (let i = 0; i < solution.hubs.length; i++) {
      for (let j = i + 1; j < solution.hubs.length; j++) {
        const from = getNodeCoords(solution.hubs[i]);
        const to = getNodeCoords(solution.hubs[j]);
        if (from && to) {
          trunkLines.push({
            id: `trunk-${solution.hubs[i]}-${solution.hubs[j]}`,
            positions: [from as LatLngExpression, to as LatLngExpression]
          });
        }
      }
    }
  }

  return (
    <div style={{ height: '550px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={onAddNodeFromMap} />

        {nodes.map(node => {
          const isHub = solution?.hubs?.includes(node.id);
          const position: LatLngExpression = [node.lat, node.lng];
          
          // Filtramos las demandas de este nodo específico
          const outgoingFlows = flows.filter(f => f.source_id === node.id);
          const incomingFlows = flows.filter(f => f.target_id === node.id);

          return (
            <Marker key={node.id} position={position} icon={isHub ? hubIcon : spokeIcon}>
              <Popup>
                <div style={{ minWidth: '220px', fontFamily: 'system-ui' }}>
                  <h4 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', fontSize: '15px' }}>
                    {node.name}
                  </h4>
                  <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                    <strong>Rol:</strong> <span style={{ color: isHub ? '#dc2626' : '#2563eb' }}>
                      {isHub ? 'HUB (Concentrador)' : 'SPOKE (Periférico)'}
                    </span>
                    {solution?.assignments && !isHub && (
                      <div style={{ marginTop: '4px' }}>
                        Asignado al Hub: <strong>{getNodeName(solution.assignments[node.id])}</strong>
                      </div>
                    )}
                  </div>
                  
                  {/* Sección de Demandas */}
                  <div style={{ fontSize: '12px', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Envíos (Demanda hacia otros):</strong>
                    {outgoingFlows.length > 0 ? (
                      <ul style={{ margin: '4px 0', paddingLeft: '16px', color: '#475569' }}>
                        {outgoingFlows.map((f, i) => (
                          <li key={i}>A {getNodeName(f.target_id)}: <b>{f.amount}</b> unid.</li>
                        ))}
                      </ul>
                    ) : <div style={{ color: '#94a3b8', margin: '2px 0 8px 0' }}>Ninguno</div>}
                    
                    <strong style={{ color: '#0f172a', display: 'block', marginTop: '8px' }}>Recepciones (Demanda desde otros):</strong>
                    {incomingFlows.length > 0 ? (
                      <ul style={{ margin: '4px 0', paddingLeft: '16px', color: '#475569' }}>
                        {incomingFlows.map((f, i) => (
                          <li key={i}>De {getNodeName(f.source_id)}: <b>{f.amount}</b> unid.</li>
                        ))}
                      </ul>
                    ) : <div style={{ color: '#94a3b8', marginTop: '2px' }}>Ninguna</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {feederLines.map(line => (
          <Polyline key={line.id} positions={line.positions} pathOptions={{ color: '#2563eb', dashArray: '4, 6', weight: 2, opacity: 0.7 }} />
        ))}

        {trunkLines.map(line => (
          <Polyline key={line.id} positions={line.positions} pathOptions={{ color: '#dc2626', weight: 5, opacity: 0.9 }} />
        ))}
      </MapContainer>
    </div>
  );
}