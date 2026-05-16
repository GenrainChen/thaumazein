import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, createProject, type Project } from '../api/dashboard'

export default function Overview() {
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    const project = await createProject(name.trim())
    setProjects((prev) => [project, ...prev])
    setName('')
    nav(`/intent?project=${project.id}`)
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="flex gap-2 mb-8">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          placeholder="New project name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium"
          onClick={handleCreate}
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create one to get started.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 rounded p-4 cursor-pointer hover:border-gray-600"
              onClick={() => nav(`/intent?project=${p.id}`)}
            >
              <div className="font-medium">{p.name}</div>
              {p.description && <div className="text-sm text-gray-400 mt-1">{p.description}</div>}
              <div className="text-xs text-gray-600 mt-2">{new Date(p.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
