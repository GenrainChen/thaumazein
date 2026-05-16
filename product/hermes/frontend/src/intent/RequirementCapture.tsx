import { useState } from 'react'
import {
  parseRequirement,
  saveGoals,
  listGoals,
  type GoalCreateItem,
  type Goal,
} from '../api/intent'

interface Props {
  projectId: string
}

export default function RequirementCapture({ projectId }: Props) {
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsedGoals, setParsedGoals] = useState<GoalCreateItem[]>([])
  const [savedGoals, setSavedGoals] = useState<Goal[]>([])
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!text.trim()) return
    setParsing(true)
    setError('')
    try {
      const result = await parseRequirement(projectId, text)
      setParsedGoals(result.goals)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse failed')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    try {
      const goals = await saveGoals(projectId, parsedGoals)
      setSavedGoals(goals)
      setParsedGoals([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleLoadGoals = async () => {
    try {
      const goals = await listGoals(projectId)
      setSavedGoals(goals)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-4">Requirement Capture</h2>

      <textarea
        className="w-full h-32 bg-gray-900 border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-gray-500 resize-none"
        placeholder="Describe your system requirements in natural language..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2 mt-3">
        <button
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          onClick={handleParse}
          disabled={parsing || !text.trim()}
        >
          {parsing ? 'Parsing...' : 'Parse with AI'}
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
          onClick={handleLoadGoals}
        >
          Load Goals
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      {parsedGoals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Parsed Goals</h3>
          <GoalTree items={parsedGoals} />
          <button
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-medium mt-4"
            onClick={handleSave}
          >
            Confirm & Save Goals
          </button>
        </div>
      )}

      {savedGoals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Saved Goals</h3>
          <ul className="space-y-1">
            {savedGoals.map((g) => (
              <li key={g.id} className="text-sm text-gray-300 pl-4 border-l-2 border-gray-700 py-1">
                {g.text}
                <span className="ml-2 text-xs text-gray-600">[{g.status}]</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function GoalTree({ items, depth = 0 }: { items: GoalCreateItem[]; depth?: number }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} style={{ paddingLeft: `${depth * 20}px` }}>
          <div className="flex items-center gap-2 py-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-sm">{item.text}</span>
          </div>
          {item.children.length > 0 && <GoalTree items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}
