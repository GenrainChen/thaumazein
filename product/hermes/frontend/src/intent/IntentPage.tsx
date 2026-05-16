import { useSearchParams } from 'react-router-dom'
import RequirementCapture from '../intent/RequirementCapture'

export default function IntentPage() {
  const [params] = useSearchParams()
  const projectId = params.get('project')

  if (!projectId) {
    return (
      <div className="p-6 text-gray-400">
        Select a project from the Dashboard first.
      </div>
    )
  }

  return <RequirementCapture projectId={projectId} />
}
