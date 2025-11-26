import { useState, useEffect } from 'react'

function EmployeeDashboard({ user }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginTime, setLoginTime] = useState(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState(null)
  const [totalBreakTime, setTotalBreakTime] = useState(0)
  const [sessionSummary, setSessionSummary] = useState(null)
  const [loginHistory, setLoginHistory] = useState([])

  useEffect(() => {
    const savedSession = localStorage.getItem(`activeSession_${user.username}`)
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setIsLoggedIn(session.isLoggedIn)
      setLoginTime(session.loginTime)
      setIsOnBreak(session.isOnBreak)
      setBreakStartTime(session.breakStartTime)
      setTotalBreakTime(session.totalBreakTime)
    }
    loadLoginHistory()
  }, [user.username])

  const loadLoginHistory = () => {
    const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
    setLoginHistory(attendanceHistory.slice(0, 10))
  }

  useEffect(() => {
    if (isLoggedIn) {
      const sessionData = {
        isLoggedIn,
        loginTime,
        isOnBreak,
        breakStartTime,
        totalBreakTime
      }
      localStorage.setItem(`activeSession_${user.username}`, JSON.stringify(sessionData))
    } else {
      localStorage.removeItem(`activeSession_${user.username}`)
    }
  }, [isLoggedIn, loginTime, isOnBreak, breakStartTime, totalBreakTime, user.username])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    const checkEndOfDay = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      if (hours === 23 && minutes === 59) {
        alert('End of day reached. Automatically logging you out.')
        handleLogout()
      }
    }, 30000)
    return () => clearInterval(checkEndOfDay)
  }, [isLoggedIn])

  const handleLogin = () => {
    setIsLoggedIn(true)
    setLoginTime(Date.now())
    setTotalBreakTime(0)
    setSessionSummary(null)
  }

  const handleLogout = () => {
    if (isLoggedIn) {
      let finalBreakTime = totalBreakTime
      if (isOnBreak && breakStartTime) {
        const currentBreakDuration = Date.now() - breakStartTime
        finalBreakTime = totalBreakTime + currentBreakDuration
        alert('You were still on break. Automatically ending your break before logout.')
      }

      const logoutTime = Date.now()
      const totalWorkedMs = logoutTime - loginTime - finalBreakTime
      const totalWorkedHours = Math.floor(totalWorkedMs / (1000 * 60 * 60))
      const totalWorkedMinutes = Math.floor((totalWorkedMs % (1000 * 60 * 60)) / (1000 * 60))
      const totalWorkedSeconds = Math.floor((totalWorkedMs % (1000 * 60)) / 1000)

      const totalBreakHours = Math.floor(finalBreakTime / (1000 * 60 * 60))
      const totalBreakMinutes = Math.floor((finalBreakTime % (1000 * 60 * 60)) / (1000 * 60))
      const totalBreakSeconds = Math.floor((finalBreakTime % (1000 * 60)) / 1000)

      const sessionData = {
        id: Date.now(),
        username: user.username,
        userRole: user.role,
        loginTime: loginTime,
        logoutTime: logoutTime,
        totalWorkedMs: totalWorkedMs,
        totalBreakMs: finalBreakTime,
        totalWorked: `${totalWorkedHours}h ${totalWorkedMinutes}m ${totalWorkedSeconds}s`,
        totalBreak: `${totalBreakHours}h ${totalBreakMinutes}m ${totalBreakSeconds}s`,
        date: new Date(loginTime).toISOString().split('T')[0]
      }

      const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
      attendanceHistory.unshift(sessionData)
      localStorage.setItem(`attendance_${user.username}`, JSON.stringify(attendanceHistory))

      setSessionSummary({
        totalWorked: sessionData.totalWorked,
        totalBreak: sessionData.totalBreak
      })

      setIsLoggedIn(false)
      setLoginTime(null)
      setIsOnBreak(false)
      setBreakStartTime(null)
      loadLoginHistory()
    }
  }

  const handleBreakIn = () => {
    setIsOnBreak(true)
    setBreakStartTime(Date.now())
  }

  const handleBreakOut = () => {
    if (isOnBreak && breakStartTime) {
      const breakDuration = Date.now() - breakStartTime
      setTotalBreakTime(prev => prev + breakDuration)
      setIsOnBreak(false)
      setBreakStartTime(null)
    }
  }

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const getElapsedTime = () => {
    if (!loginTime) return '0h 0m 0s'
    return formatTime(currentTime - loginTime)
  }

  const getCurrentBreakTime = () => {
    if (!isOnBreak || !breakStartTime) return '0h 0m 0s'
    return formatTime(currentTime - breakStartTime)
  }

  const getTotalBreakTime = () => {
    let total = totalBreakTime
    if (isOnBreak && breakStartTime) {
      total += (currentTime - breakStartTime)
    }
    return formatTime(total)
  }

  const getWorkTime = () => {
    if (!loginTime) return '0h 0m 0s'
    let totalBreak = totalBreakTime
    if (isOnBreak && breakStartTime) {
      totalBreak += (currentTime - breakStartTime)
    }
    return formatTime(currentTime - loginTime - totalBreak)
  }

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-teal mb-1">Employee Dashboard</h2>
          <p className="text-gray-500">Welcome, {user.username}!</p>
        </div>

        <div className="flex flex-col gap-5">
          {!isLoggedIn && !sessionSummary && (
            <div className="flex justify-center py-10">
              <button onClick={handleLogin} className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-dark transition-colors">
                Login
              </button>
            </div>
          )}

          {isLoggedIn && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-teal">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Time Since Login</h3>
                  <p className="text-2xl font-bold text-teal">{getElapsedTime()}</p>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-teal">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Work Time</h3>
                  <p className="text-2xl font-bold text-teal">{getWorkTime()}</p>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-teal">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Total Break Time</h3>
                  <p className="text-2xl font-bold text-teal">{getTotalBreakTime()}</p>
                </div>

                {isOnBreak && (
                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-amber">
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Current Break</h3>
                    <p className="text-2xl font-bold text-amber">{getCurrentBreakTime()}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                {!isOnBreak ? (
                  <button onClick={handleBreakIn} className="bg-amber text-white px-6 py-3 rounded-md font-semibold hover:bg-amber/90 transition-colors">
                    Break In
                  </button>
                ) : (
                  <button onClick={handleBreakOut} className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-dark transition-colors">
                    Break Out
                  </button>
                )}

                <button onClick={handleLogout} className="bg-red text-white px-6 py-3 rounded-md font-semibold hover:bg-red/90 transition-colors">
                  Logout
                </button>
              </div>

              {isOnBreak && (
                <div className="bg-amber/10 text-amber border-2 border-amber rounded-md p-3 text-center font-semibold">
                  Currently on Break
                </div>
              )}
            </>
          )}

          {sessionSummary && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-teal mb-5">Session Summary</h3>
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span>Total Work Time:</span>
                  <span className="font-bold text-teal">{sessionSummary.totalWorked}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span>Total Break Time:</span>
                  <span className="font-bold text-teal">{sessionSummary.totalBreak}</span>
                </div>
              </div>
              <button onClick={handleLogin} className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-dark transition-colors">
                Start New Session
              </button>
            </div>
          )}

          {loginHistory.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-teal mb-5">Recent Login History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Date</th>
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Login Time</th>
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Logout Time</th>
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Work Hours</th>
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Break Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b border-gray-200 text-sm">{formatDate(session.date)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{formatDateTime(session.loginTime)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{formatDateTime(session.logoutTime)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{session.totalWorked}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{session.totalBreak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
