import { useState, useEffect } from 'react'
import TeamStatusPopup from './TeamStatusPopup'

function EmployeeDashboard({ user }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [loginTime, setLoginTime] = useState(null)
  const [workTime, setWorkTime] = useState(0)
  const [breakTime, setBreakTime] = useState(0)
  const [sessionHistory, setSessionHistory] = useState([])

  useEffect(() => {
    loadSessionState()
    loadSessionHistory()
  }, [user.username])

  useEffect(() => {
    let interval
    if (isLoggedIn && !isOnBreak) {
      interval = setInterval(() => setWorkTime(prev => prev + 1000), 1000)
    } else if (isLoggedIn && isOnBreak) {
      interval = setInterval(() => setBreakTime(prev => prev + 1000), 1000)
    }
    return () => clearInterval(interval)
  }, [isLoggedIn, isOnBreak])

  const loadSessionState = () => {
    const session = JSON.parse(localStorage.getItem(`activeSession_${user.username}`) || '{}')
    if (session.isLoggedIn) {
      setIsLoggedIn(true)
      setLoginTime(session.loginTime)
      setIsOnBreak(session.isOnBreak || false)
      const elapsed = Date.now() - session.loginTime
      setWorkTime(elapsed - (session.totalBreakMs || 0))
      setBreakTime(session.totalBreakMs || 0)
    }
  }

  const loadSessionHistory = () => {
    const history = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
    setSessionHistory(history.slice(0, 5))
  }

  const handleLogin = () => {
    const now = Date.now()
    setIsLoggedIn(true)
    setLoginTime(now)
    setWorkTime(0)
    setBreakTime(0)
    localStorage.setItem(`activeSession_${user.username}`, JSON.stringify({ isLoggedIn: true, loginTime: now, isOnBreak: false, totalBreakMs: 0 }))
  }

  const handleLogout = () => {
    const logoutTime = Date.now()
    const session = { id: Date.now(), date: new Date().toISOString().split('T')[0], loginTime, logoutTime, totalWorkedMs: workTime, totalBreakMs: breakTime, totalWorked: formatTime(workTime), totalBreak: formatTime(breakTime) }
    const history = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
    history.unshift(session)
    localStorage.setItem(`attendance_${user.username}`, JSON.stringify(history))
    localStorage.removeItem(`activeSession_${user.username}`)
    setIsLoggedIn(false)
    setLoginTime(null)
    setWorkTime(0)
    setBreakTime(0)
    loadSessionHistory()
  }

  const handleBreakToggle = () => {
    const session = JSON.parse(localStorage.getItem(`activeSession_${user.username}`) || '{}')
    if (isOnBreak) {
      session.isOnBreak = false
      session.totalBreakMs = breakTime
    } else {
      session.isOnBreak = true
      session.breakStartTime = Date.now()
    }
    setIsOnBreak(!isOnBreak)
    localStorage.setItem(`activeSession_${user.username}`, JSON.stringify(session))
  }

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const formatDateTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <TeamStatusPopup />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Welcome, {user.username}!</h1>
          <p className="text-gray-500">Track your work hours and manage your attendance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-teal mb-2">{formatTime(workTime)}</div>
            <div className="text-sm text-gray-500">Work Time</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-amber mb-2">{formatTime(breakTime)}</div>
            <div className="text-sm text-gray-500">Break Time</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className={`text-3xl font-bold mb-2 ${isLoggedIn ? (isOnBreak ? 'text-amber' : 'text-green') : 'text-gray-500'}`}>
              {isLoggedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Offline'}
            </div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold text-teal mb-4">Time Tracking</h2>
          <div className="flex flex-wrap gap-3">
            {!isLoggedIn ? (
              <button onClick={handleLogin} className="bg-green text-white px-6 py-3 rounded-md font-medium hover:bg-green/90 transition-colors">Login</button>
            ) : (
              <>
                <button onClick={handleBreakToggle} className={`px-6 py-3 rounded-md font-medium transition-colors ${isOnBreak ? 'bg-green text-white hover:bg-green/90' : 'bg-amber text-white hover:bg-amber/90'}`}>
                  {isOnBreak ? 'End Break' : 'Start Break'}
                </button>
                <button onClick={handleLogout} className="bg-red text-white px-6 py-3 rounded-md font-medium hover:bg-red/90 transition-colors">Logout</button>
              </>
            )}
          </div>
          {isLoggedIn && loginTime && (
            <div className="mt-4 text-sm text-gray-500">Logged in at: {formatDateTime(loginTime)}</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-teal">Recent Sessions</h2>
          </div>
          {sessionHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No sessions recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Date</th>
                    <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Login</th>
                    <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Logout</th>
                    <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Work Time</th>
                    <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Break</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 text-sm">{session.date}</td>
                      <td className="p-3 border-b border-gray-200 text-sm">{formatDateTime(session.loginTime)}</td>
                      <td className="p-3 border-b border-gray-200 text-sm">{formatDateTime(session.logoutTime)}</td>
                      <td className="p-3 border-b border-gray-200 text-sm font-medium text-teal">{session.totalWorked}</td>
                      <td className="p-3 border-b border-gray-200 text-sm">{session.totalBreak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
