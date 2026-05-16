import { get, post } from './client'

export interface MindMapNode {
  id: string
  label: string
  type: string
  x: number
  y: number
  properties: Record<string, unknown>
}

export interface MindMapEdge {
  source: string
  target: string
  label?: string
}

export interface MindMapData {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
}

export interface MindMapDoc {
  id: string
  project_id: string
  name: string
  data: MindMapData
  updated_at: string
}

export const saveMindMap = (projectId: string, name: string, data: MindMapData) =>
  post<MindMapDoc>(`/model/projects/${projectId}/mindmap`, { name, data })

export const loadMindMap = (projectId: string) =>
  get<MindMapDoc>(`/model/projects/${projectId}/mindmap`)

export interface FlowChartNodeData {
  id: string
  type: string
  data: Record<string, unknown>
  position: { x: number; y: number }
}

export interface FlowChartEdgeData {
  id: string
  source: string
  target: string
  label?: string
  source_handle?: string
  target_handle?: string
}

export interface FlowChartData {
  nodes: FlowChartNodeData[]
  edges: FlowChartEdgeData[]
}

export interface FlowChartDoc {
  id: string
  project_id: string
  name: string
  data: FlowChartData
  updated_at: string
}

export const saveFlowChart = (projectId: string, name: string, data: FlowChartData) =>
  post<FlowChartDoc>(`/model/projects/${projectId}/flowchart`, { name, data })

export const loadFlowChart = (projectId: string) =>
  get<FlowChartDoc>(`/model/projects/${projectId}/flowchart`)
