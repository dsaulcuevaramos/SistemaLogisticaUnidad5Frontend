// src/types.ts
export interface NodeItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface FlowItem {
  source_id: string;
  target_id: string;
  amount: number;
}

export interface OptimizationSolution {
  status: string;
  total_cost: number;
  hubs: string[];
  assignments: Record<string, string>;
}