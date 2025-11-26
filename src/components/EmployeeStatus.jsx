import { useState, useEffect } from 'react'

function EmployeeStatus() {
  const [employees, setEmployees] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadEmployeeStatus()
    // Refresh every 30 seconds
    const interval = setInterval(loadEmployeeStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadEmployeeStatus = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employeeList = users.filter(u => u.role === 'employee' || u.role === 'manager')

    const statusList = employeeList.map(emp => {
      const session = JSON.parse(localStorage.getItem(`activeSession_${emp.name}`) || '{}')
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')
      const lastSession = attendance[0] || null

      let status = 'offline'
      let statusText = 'Not Logged In'
      let loginTime = null

      if (session.isLoggedIn) {
        if (session.isOnBreak) {
          status = 'break'
          statusText = 'On Break'
        } else {
          status = 'online'
          statusText = 'Working'
        }
        loginTime = session.loginTime
      }

      return {
        ...emp,
        status,
        statusText,
        loginTime,
        lastSession
      }
    })

    // Sort: online first, then break, then offline
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
      default: return 'bg-gray-500'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green/10 text-green'
      case 'break': return 'bg-amber/10 text-amber'
      default: return 'bg-gray-200 text-gray-500'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredEmployees = employees.filter(emp => {
    if (filter === 'all') return true
    return emp.status === filter
  })

  const onlineCount = employees.filter(e => e.status === 'online').length
  const breakCount = employees.filter(e => e.status === 'break').length
  const offlineCount = employees.filter(e => e.status === 'offline').length

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Employee Status</h1>
          <p className="text-gray-500">Real-time status of all employees</p>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-green">
            <div className="text-3xl font-bold text-green">{onlineCount}</div>
            <div className="text-sm text-gray-500">Online</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-amber">
            <div className="text-3xl font-bold text-amber">{breakCount}</div>
            <div className="text-sm text-gray-500">On Break</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-gray-500">
            <div className="text-3xl font-bold text-gray-500">{offlineCount}</div>
            <div className="text-sm text-gray-500">Offline</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: employees.length },
            { key: 'online', label: 'Online', count: onlineCount },
            { key: 'break', label: 'On Break', count: breakCount },
            { key: 'offline', label: 'Offline', count: offlineCount }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === f.key ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}
            >
              {f.label} <span className="ml-1 opacity-70">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_100px_100px_100px] gap-4 p-4 bg-teal text-white font-semibold text-sm">
            <div>Employee</div>
            <div>Status</div>
            <div>Role</div>
            <div>Login Time</div>
            <div>Last Active</div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No employees found</div>
          ) : (
            filteredEmployees.map((emp, index) => (
              <div key={index} className="grid grid-cols-[1fr_120px_100px_100px_100px] gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(emp.status)}`}></div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 block">{emp.name}</span>
                    <span className="text-xs text-gray-500">{emp.email}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgColor(emp.status)}`}>
                    {emp.statusText}
                  </span>
                </div>
                <div className="text-sm text-gray-500 capitalize">{emp.role}</div>
                <div className="text-sm text-gray-800">{formatTime(emp.loginTime)}</div>
                <div className="text-sm text-gray-500">
                  {emp.lastSession ? formatDate(emp.lastSession.date) : 'Never'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  )
}

export default EmployeeStatus
