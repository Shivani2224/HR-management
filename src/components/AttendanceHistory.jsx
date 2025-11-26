import { useState, useEffect } from 'react'

function AttendanceHistory({ username }) {
  const [attendanceData, setAttendanceData] = useState([])
  const [filterMonth, setFilterMonth] = useState('all')
  const [stats, setStats] = useState({
    totalDays: 0,
    totalHours: 0,
    totalBreaks: 0,
    avgHours: 0
  })

  useEffect(() => {
    loadAttendanceData()
  }, [username])

  useEffect(() => {
    calculateStats()
  }, [attendanceData, filterMonth])

  const loadAttendanceData = () => {
    const data = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    setAttendanceData(data)
  }

  const calculateStats = () => {
    const filtered = getFilteredData()
    const totalDays = filtered.length
    const totalHours = filtered.reduce((sum, session) => sum + (session.totalWorkedMs / (1000 * 60 * 60)), 0)
    const totalBreaks = filtered.reduce((sum, session) => sum + (session.totalBreakMs / (1000 * 60 * 60)), 0)
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0

    setStats({
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalBreaks: totalBreaks.toFixed(1),
      avgHours: avgHours.toFixed(1)
    })
  }

  const getFilteredData = () => {
    if (filterMonth === 'all') return attendanceData
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return attendanceData.filter(session => {
      const sessionDate = new Date(session.date)
      if (filterMonth === 'current') {
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
      } else if (filterMonth === 'last') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return sessionDate.getMonth() === lastMonth && sessionDate.getFullYear() === lastMonthYear
      }
      return true
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const downloadCSV = () => {
    const filtered = getFilteredData()
    if (filtered.length === 0) {
      alert('No data to download')
      return
    }
    const headers = ['Date', 'Login Time', 'Logout Time', 'Work Hours', 'Break Time']
    const csvRows = [headers.join(',')]
    filtered.forEach(session => {
      const row = [
        session.date,
        formatTime(session.loginTime),
        formatTime(session.logoutTime),
        session.totalWorked,
        session.totalBreak
      ]
      csvRows.push(row.join(','))
    })
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${username}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredData = getFilteredData()

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Attendance History</h1>
          <p className="text-gray-500">View your work attendance records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-3xl">📅</div>
            <div>
              <div className="text-sm text-gray-500">Total Days</div>
              <div className="text-2xl font-bold text-teal">{stats.totalDays}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-3xl">⏰</div>
            <div>
              <div className="text-sm text-gray-500">Total Hours</div>
              <div className="text-2xl font-bold text-teal">{stats.totalHours}h</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-3xl">☕</div>
            <div>
              <div className="text-sm text-gray-500">Total Breaks</div>
              <div className="text-2xl font-bold text-teal">{stats.totalBreaks}h</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <div className="text-sm text-gray-500">Avg Hours/Day</div>
              <div className="text-2xl font-bold text-teal">{stats.avgHours}h</div>
            </div>
          </div>
        </div>

        {/* Filter and Download */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-800">Filter by:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal"
            >
              <option value="all">All Time</option>
              <option value="current">This Month</option>
              <option value="last">Last Month</option>
            </select>
          </div>

          <button
            onClick={downloadCSV}
            className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors"
          >
            📥 Download CSV
          </button>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No attendance records found</p>
              <p className="text-sm">Start tracking your time to see records here</p>
            </div>
          ) : (
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
                  {filteredData.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 text-sm">{formatDate(session.date)}</td>
                      <td className="p-3 border-b border-gray-200 text-sm">{formatTime(session.loginTime)}</td>
                      <td className="p-3 border-b border-gray-200 text-sm">{formatTime(session.logoutTime)}</td>
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

export default AttendanceHistory
