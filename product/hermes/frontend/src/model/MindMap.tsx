import { useState, useRef, useCallback } from 'react'
import type { MindMapNode, MindMapEdge, MindMapData } from '../api/model'

const NODE_TYPES = [
  { value: 'bastion', label: 'Bastion', color: '#3b82f6' },
  { value: 'terminal-sensor', label: 'Sensor', color: '#22c55e' },
  { value: 'terminal-operator', label: 'Operator', color: '#f59e0b' },
  { value: 'subsystem', label: 'Subsystem', color: '#8b5cf6' },
]

interface Props {
  data: MindMapData
  onChange: (data: MindMapData) => void
}

export default function MindMap({ data, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [newNodeType, setNewNodeType] = useState('bastion')

  const addNode = () => {
    const nodeType = NODE_TYPES.find((t) => t.value === newNodeType)!
    const id = `node-${Date.now()}`
    const node: MindMapNode = {
      id,
      label: nodeType.label,
      type: newNodeType,
      x: 200 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      properties: {},
    }
    onChange({ ...data, nodes: [...data.nodes, node] })
  }

  const deleteNode = (id: string) => {
    onChange({
      nodes: data.nodes.filter((n) => n.id !== id),
      edges: data.edges.filter((e) => e.source !== id && e.target !== id),
    })
  }

  const startDrag = (id: string) => setDragging(id)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!dragging || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      onChange({
        ...data,
        nodes: data.nodes.map((n) => (n.id === dragging ? { ...n, x, y } : n)),
      })
    },
    [dragging, data, onChange]
  )

  const endDrag = () => setDragging(null)

  const startConnect = (id: string) => {
    if (connecting) {
      if (connecting !== id) {
        const exists = data.edges.some((e) => e.source === connecting && e.target === id)
        if (!exists) {
          onChange({ ...data, edges: [...data.edges, { source: connecting, target: id }] })
        }
      }
      setConnecting(null)
    } else {
      setConnecting(id)
    }
  }

  const startEdit = (node: MindMapNode) => {
    setEditing(node.id)
    setEditText(node.label)
  }

  const finishEdit = () => {
    if (editing) {
      onChange({
        ...data,
        nodes: data.nodes.map((n) => (n.id === editing ? { ...n, label: editText } : n)),
      })
      setEditing(null)
    }
  }

  const getNodeColor = (type: string) => NODE_TYPES.find((t) => t.value === type)?.color ?? '#6b7280'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <select
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
          value={newNodeType}
          onChange={(e) => setNewNodeType(e.target.value)}
        >
          {NODE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm" onClick={addNode}>
          Add Node
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Click node to connect | Drag to move | Double-click to rename
        </span>
        {connecting && <span className="text-xs text-yellow-400">Click target node to connect...</span>}
      </div>

      <svg
        ref={svgRef}
        className="flex-1 w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
      >
        {/* Edges */}
        {data.edges.map((edge, i) => {
          const src = data.nodes.find((n) => n.id === edge.source)
          const tgt = data.nodes.find((n) => n.id === edge.target)
          if (!src || !tgt) return null
          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke="#4b5563"
              strokeWidth={2}
            />
          )
        })}

        {/* Nodes */}
        {data.nodes.map((node) => {
          const color = getNodeColor(node.type)
          return (
            <g key={node.id} onMouseDown={() => startDrag(node.id)}>
              <circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={color}
                opacity={0.8}
                stroke={connecting === node.id ? '#fbbf24' : '#1f2937'}
                strokeWidth={connecting === node.id ? 3 : 2}
                onClick={() => startConnect(node.id)}
                onDoubleClick={() => startEdit(node)}
                style={{ cursor: 'pointer' }}
              />
              {editing === node.id ? (
                <foreignObject x={node.x - 40} y={node.y + 28} width={80} height={24}>
                  <input
                    className="w-full bg-gray-900 border border-gray-600 rounded px-1 text-xs text-center text-white"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={finishEdit}
                    onKeyDown={(e) => e.key === 'Enter' && finishEdit()}
                    autoFocus
                  />
                </foreignObject>
              ) : (
                <text
                  x={node.x}
                  y={node.y + 40}
                  textAnchor="middle"
                  className="text-xs fill-gray-300 select-none"
                >
                  {node.label}
                </text>
              )}
              {/* Delete button */}
              <text
                x={node.x + 20}
                y={node.y - 20}
                className="text-xs fill-gray-500 cursor-pointer select-none"
                onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }}
              >
                x
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
