import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '', label: 'Dashboard' },
  { to: 'intent', label: 'Intent' },
  { to: 'model', label: 'Model' },
  { to: 'agent', label: 'Agent' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <aside className="w-56 border-r border-gray-800 flex flex-col">
        <div className="p-4 text-lg font-bold text-white">Hermes</div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to || '.'}
              end={item.to === ''}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
