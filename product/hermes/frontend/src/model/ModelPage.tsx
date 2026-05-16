import { useState, useEffect, useSearchParams } from 'react'
import MindMap from './MindMap'
import FlowChart from './FlowChart'
import BehaviorPackView from './BehaviorPackView'
import {
  saveMindMap, loadMindMap,
  saveFlowChart, loadFlowChart,
  type MindMapData, type FlowChartData,
} from '../api/model'

type Tab = 'mindmap' | 'flowchart' | 'packs'

const EMPTY_MINDMAP: MindMapData = { nodes: [], edges: [] }
const EMPTY_FLOWCHART: FlowChartData = { nodes: [], edges: [] }

export default function ModelPage() {
  const [params] = useSearchParams()
  const projectId = params.get('project')
  const [tab, setTab] = useState<Tab>('mindmap')
  const [mindmap, setMindmap] = useState<MindMapData>(EMPTY_MINDMAP)
  const [flowchart, setFlowchart] = useState<FlowChartData>(EMPTY_FLOWCHART)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!projectId) return
    loadMindMap(projectId).then((doc) => setMindmap(doc.data)).catch(() => {})
    loadFlowChart(projectId).then((doc) => setFlowchart(doc.data)).catch(() => {})
  }, [projectId])

  if (!projectId) {
    return <div className="p-6 text-gray-400">Select a project from the Dashboard first.</div>
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (tab === 'mindmap') {
        await saveMindMap(projectId, 'Mind Map', mindmap)
      } else if (tab === 'flowchart') {
        await saveFlowChart(projectId, 'Flow Chart', flowchart)
      }
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'mindmap', label: 'Mind Map' },
    { key: 'flowchart', label: 'Flow Chart' },
    { key: 'packs', label: 'Behavior Packs' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`px-3 py-1 rounded text-sm ${tab === t.key ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        {tab !== 'packs' && (
          <button
            className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm ml-auto disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'mindmap' && <MindMap data={mindmap} onChange={setMindmap} />}
        {tab === 'flowchart' && <FlowChart data={flowchart} onChange={setFlowchart} />}
        {tab === 'packs' && <BehaviorPackView projectId={projectId} />}
      </div>
    </div>
  )
}
