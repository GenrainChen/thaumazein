import { useState, useEffect } from 'react'
import { post, get } from '../api/client'

interface PackSummary {
  id: string
  version: string
  status: string
  created_at: string
}

interface AssembleResult {
  pack_id: string
  manifest: Record<string, unknown>
  signature: Record<string, unknown>
  verified: boolean
}

interface Props {
  projectId: string
}

export default function BehaviorPackView({ projectId }: Props) {
  const [packs, setPacks] = useState<PackSummary[]>([])
  const [result, setResult] = useState<AssembleResult | null>(null)
  const [assembling, setAssembling] = useState(false)
  const [bastionType, setBastionType] = useState('ground')

  useEffect(() => {
    get<PackSummary[]>(`/model/projects/${projectId}/packs`).then(setPacks).catch(() => {})
  }, [projectId])

  const handleAssemble = async () => {
    setAssembling(true)
    try {
      const res = await post<AssembleResult>(`/model/projects/${projectId}/assemble`, {
        version: '0.1.0',
        target_bastion_type: bastionType,
      })
      setResult(res)
      const updated = await get<PackSummary[]>(`/model/projects/${projectId}/packs`)
      setPacks(updated)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Assembly failed')
    } finally {
      setAssembling(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-4">Behavior Pack Assembly</h2>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-400">Target Bastion:</label>
        <select
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
          value={bastionType}
          onChange={(e) => setBastionType(e.target.value)}
        >
          <option value="ground">Ground</option>
          <option value="aerial">Aerial</option>
          <option value="submarine">Submarine</option>
          <option value="extreme">Extreme</option>
        </select>
        <button
          className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-sm font-medium disabled:opacity-50"
          onClick={handleAssemble}
          disabled={assembling}
        >
          {assembling ? 'Assembling...' : 'Assemble Pack'}
        </button>
      </div>

      {result && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${result.verified ? 'text-green-400' : 'text-red-400'}`}>
              {result.verified ? 'Signature Verified' : 'Signature FAILED'}
            </span>
            <span className="text-xs text-gray-500">Pack: {result.pack_id}</span>
          </div>
          <details className="bg-gray-900 border border-gray-800 rounded p-3">
            <summary className="text-sm text-gray-300 cursor-pointer">manifest.json</summary>
            <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-60">
              {JSON.stringify(result.manifest, null, 2)}
            </pre>
          </details>
          <details className="bg-gray-900 border border-gray-800 rounded p-3 mt-2">
            <summary className="text-sm text-gray-300 cursor-pointer">signature</summary>
            <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-40">
              {JSON.stringify(result.signature, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <h3 className="text-lg font-medium mb-3">Packs</h3>
      {packs.length === 0 ? (
        <p className="text-sm text-gray-500">No behavior packs yet.</p>
      ) : (
        <div className="space-y-2">
          {packs.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-sm font-mono">{p.id.slice(0, 8)}...</span>
                <span className="text-xs text-gray-500 ml-2">v{p.version}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
