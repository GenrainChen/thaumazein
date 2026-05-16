import { useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { FlowChartData } from '../api/model'

const NODE_TYPE_COLORS: Record<string, string> = {
  process: '#3b82f6',
  decision: '#f59e0b',
  input: '#22c55e',
  output: '#ef4444',
}

function CustomNode({ data }: { data: { label: string; nodeType: string } }) {
  const color = NODE_TYPE_COLORS[data.nodeType] ?? '#6b7280'
  return (
    <div
      className="px-3 py-2 rounded text-xs text-white font-medium border border-gray-600"
      style={{ backgroundColor: color }}
    >
      {data.label}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  process: CustomNode,
  decision: CustomNode,
  input: CustomNode,
  output: CustomNode,
}

interface Props {
  data: FlowChartData
  onChange: (data: FlowChartData) => void
}

export default function FlowChart({ data, onChange }: Props) {
  const initialNodes: Node[] = data.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { label: n.data.label ?? n.type, nodeType: n.type },
  }))

  const initialEdges: Edge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    sourceHandle: e.source_handle,
    targetHandle: e.target_handle,
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const syncToParent = useCallback(() => {
    onChange({
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type ?? 'process',
        data: { label: (n.data as { label?: string })?.label ?? n.type ?? '' },
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label ?? '',
      })),
    })
  }, [nodes, edges, onChange])

  const addProcessNode = () => {
    const id = `fc-${Date.now()}`
    setNodes([
      ...nodes,
      { id, type: 'process', position: { x: 250 + Math.random() * 100, y: 100 + Math.random() * 100 }, data: { label: 'Process', nodeType: 'process' } },
    ])
  }

  const addDecisionNode = () => {
    const id = `fc-${Date.now()}`
    setNodes([
      ...nodes,
      { id, type: 'decision', position: { x: 250 + Math.random() * 100, y: 100 + Math.random() * 100 }, data: { label: 'Decision', nodeType: 'decision' } },
    ])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm" onClick={addProcessNode}>
          + Process
        </button>
        <button className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm" onClick={addDecisionNode}>
          + Decision
        </button>
        <button className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm" onClick={() => {
          setNodes([...nodes, { id: `fc-${Date.now()}`, type: 'input', position: { x: 250, y: 50 }, data: { label: 'Input', nodeType: 'input' } }])
        }}>
          + Input
        </button>
        <button className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm" onClick={() => {
          setNodes([...nodes, { id: `fc-${Date.now()}`, type: 'output', position: { x: 250, y: 50 }, data: { label: 'Output', nodeType: 'output' } }])
        }}>
          + Output
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm ml-auto" onClick={syncToParent}>
          Sync
        </button>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls className="!bg-gray-800 !border-gray-700 [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!fill-gray-300" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
        </ReactFlow>
      </div>
    </div>
  )
}
