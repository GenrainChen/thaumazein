import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './shared/Layout'
import Overview from './dashboard/Overview'
import IntentPage from './intent/IntentPage'
import ModelPage from './model/ModelPage'
import AgentPage from './agent/AgentPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="intent" element={<IntentPage />} />
          <Route path="model" element={<ModelPage />} />
          <Route path="agent" element={<AgentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
