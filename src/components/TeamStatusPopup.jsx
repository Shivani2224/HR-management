import { useState, useEffect } from 'react'

function TeamStatusPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    loadEmployeeStatus()
    const interval = setInterval(loadEmployeeStatus, 10)
    return () => clearInterval(interval)
  }, [])

  const loadEmployeeStatus = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employeeList = users.filter(u => u.role === 'employee' || u.role === 'manager')

    const statusList = employeeList.map(emp => {
      const session = JSON.parse(localStorage.getItem(`activeSession_${emp.name}`) || '{}')

      let status = 'offline'
      let statusText = 'Offline'

      if (session.isLoggedIn) {
        if (session.isOnBreak) {
          status = 'break'
          statusText = 'On Break'
        } else {
          status = 'online'
          statusText = 'Working'
        }
      }

      return { ...emp, status, statusText }
    })

    statusList.sort((a, b) => {
      const order = { online: 0, break: 1, offline: 2 }
      return order[a.status] - order[b.status]
    })

    setEmployees(statusList)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green'
      case 'break': return 'bg-amber'
      default: return 'bg-gray-400'
    }
  }

  const onlineCount = employees.filter(e => e.status === 'online').length
  const breakCount = employees.filter(e => e.status === 'break').length
  const offlineCount = employees.filter(e => e.status === 'offline').length

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Popup Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-2">
          <div className="bg-teal text-white p-3 font-semibold text-sm flex justify-between items-center">
            <span>Team Status</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1 transition-colors">
              ✕
            </button>
          </div>

          {/* Summary */}
          <div className="flex justify-around p-3 border-b border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-lg font-bold text-green">{onlineCount}</div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber">{breakCount}</div>
              <div className="text-xs text-gray-500">Break</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-500">{offlineCount}</div>
              <div className="text-xs text-gray-500">Offline</div>
            </div>
          </div>

          {/* Employee List */}
          <div className="max-h-64 overflow-y-auto">
            {employees.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No employees found</div>
            ) : (
              employees.map((emp, index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(emp.status)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{emp.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{emp.role}</div>
                  </div>
                  <div className={`text-xs font-medium ${emp.status === 'online' ? 'text-green' : emp.status === 'break' ? 'text-amber' : 'text-gray-400'}`}>
                    {emp.statusText}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-gray-50 text-center text-xs text-gray-400">
            Auto-refreshes every 30s
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-teal text-white shadow-lg hover:bg-teal-dark transition-all hover:scale-105 flex items-center justify-center relative"
      >
        <span className="text-xl">👥</span>
        {onlineCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green text-white rounded-full flex items-center justify-center text-xs font-bold">
            {onlineCount}
          </div>
        )}
      </button>
    </div>
  )
}

export default TeamStatusPopup
