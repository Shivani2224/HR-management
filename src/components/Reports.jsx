import { useState, useEffect } from 'react'

function Reports() {
  const [reportType, setReportType] = useState('attendance')
  const [attendanceData, setAttendanceData] = useState({})
  const [leaveData, setLeaveData] = useState({})
  const [summaryStats, setSummaryStats] = useState({})

  useEffect(() => { loadReportData() }, [reportType])

  const loadReportData = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employees = users.filter(u => u.role === 'employee' || u.role === 'manager')
    calculateSummaryStats(employees)
    if (reportType === 'attendance') loadAttendanceReport(employees)
    if (reportType === 'leave') loadLeaveReport(employees)
  }

  const calculateSummaryStats = (employees) => {
    let totalHours = 0, totalBreak = 0, totalSessions = 0, totalLeaves = 0, approvedLeaves = 0, pendingLeaves = 0
    employees.forEach(emp => {
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')
      totalSessions += attendance.length
      attendance.forEach(record => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60)
        totalBreak += record.totalBreakMs / (1000 * 60 * 60)
      })
      const leaves = JSON.parse(localStorage.getItem(`leaveRequests_${emp.name}`) || '[]')
      totalLeaves += leaves.length
      approvedLeaves += leaves.filter(l => l.status === 'approved').length
      pendingLeaves += leaves.filter(l => l.status === 'pending').length
    })
    setSummaryStats({
      totalEmployees: employees.length,
      totalHours: totalHours.toFixed(1),
      avgHoursPerEmployee: employees.length > 0 ? (totalHours / employees.length).toFixed(1) : '0',
      totalBreak: totalBreak.toFixed(1),
      totalSessions,
      avgSessionsPerEmployee: employees.length > 0 ? (totalSessions / employees.length).toFixed(1) : '0',
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      leaveApprovalRate: totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(1) : '0'
    })
  }

  const loadAttendanceReport = (employees) => {
    const data = []
    employees.forEach(emp => {
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')
      let totalHours = 0, totalBreak = 0
      attendance.forEach(record => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60)
        totalBreak += record.totalBreakMs / (1000 * 60 * 60)
      })
      if (attendance.length > 0) {
        data.push({ name: emp.name, role: emp.role, sessions: attendance.length, totalHours: totalHours.toFixed(1), avgHours: (totalHours / attendance.length).toFixed(1), totalBreak: totalBreak.toFixed(1), lastActivity: attendance[0].date })
      }
    })
    data.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours))
    setAttendanceData({ employees: data })
  }

  const loadLeaveReport = (employees) => {
    const data = []
    employees.forEach(emp => {
      const leaves = JSON.parse(localStorage.getItem(`leaveRequests_${emp.name}`) || '[]')
      const approved = leaves.filter(l => l.status === 'approved')
      let totalDays = 0
      approved.forEach(leave => { totalDays += leave.days })
      data.push({ name: emp.name, role: emp.role, totalRequests: leaves.length, approved: approved.length, pending: leaves.filter(l => l.status === 'pending').length, rejected: leaves.filter(l => l.status === 'rejected').length, totalDays })
    })
    data.sort((a, b) => b.totalRequests - a.totalRequests)
    setLeaveData({ employees: data })
  }

  const handleExportCSV = () => {
    let csvContent = '', filename = ''
    if (reportType === 'attendance') {
      csvContent = 'Name,Role,Sessions,Total Hours,Avg Hours,Total Break,Last Activity\n'
      attendanceData.employees?.forEach(emp => { csvContent += `${emp.name},${emp.role},${emp.sessions},${emp.totalHours},${emp.avgHours},${emp.totalBreak},${emp.lastActivity}\n` })
      filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
    } else if (reportType === 'leave') {
      csvContent = 'Name,Role,Total Requests,Approved,Pending,Rejected,Total Days\n'
      leaveData.employees?.forEach(emp => { csvContent += `${emp.name},${emp.role},${emp.totalRequests},${emp.approved},${emp.pending},${emp.rejected},${emp.totalDays}\n` })
      filename = `leave_report_${new Date().toISOString().split('T')[0]}.csv`
    }
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getRoleBadgeClass = (role) => role === 'manager' ? 'bg-amber/10 text-amber' : 'bg-green/10 text-green'

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal mb-1">Reports & Analytics</h1>
            <p className="text-gray-500">View comprehensive reports and statistics</p>
          </div>
          <button onClick={handleExportCSV} className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">Export CSV</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { value: summaryStats.totalEmployees, label: 'Total Employees' },
            { value: `${summaryStats.totalHours}h`, label: 'Total Hours Worked' },
            { value: `${summaryStats.avgHoursPerEmployee}h`, label: 'Avg Hours/Employee' },
            { value: summaryStats.totalLeaves, label: 'Total Leave Requests' },
            { value: `${summaryStats.leaveApprovalRate}%`, label: 'Approval Rate' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-teal">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setReportType('attendance')} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${reportType === 'attendance' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}>Attendance Report</button>
          <button onClick={() => setReportType('leave')} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${reportType === 'leave' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}>Leave Report</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {reportType === 'attendance' && (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-teal">Attendance Report</h2>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 p-4 bg-teal text-white font-semibold text-sm min-w-[700px]">
                  <div>Employee</div>
                  <div>Role</div>
                  <div>Sessions</div>
                  <div>Total Hours</div>
                  <div>Avg Hours</div>
                  <div>Total Break</div>
                  <div>Last Activity</div>
                </div>
                {attendanceData.employees?.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No attendance data available</div>
                ) : (
                  attendanceData.employees?.map((emp, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50 min-w-[700px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm">{emp.name.charAt(0).toUpperCase()}</div>
                        <span className="font-medium text-gray-800">{emp.name}</span>
                      </div>
                      <div><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeClass(emp.role)}`}>{emp.role}</span></div>
                      <div className="text-gray-800">{emp.sessions}</div>
                      <div className="text-teal font-medium">{emp.totalHours}h</div>
                      <div className="text-gray-800">{emp.avgHours}h</div>
                      <div className="text-gray-500">{emp.totalBreak}h</div>
                      <div className="text-gray-500 text-sm">{emp.lastActivity}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {reportType === 'leave' && (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-teal">Leave Report</h2>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 p-4 bg-teal text-white font-semibold text-sm min-w-[700px]">
                  <div>Employee</div>
                  <div>Role</div>
                  <div>Total Requests</div>
                  <div>Approved</div>
                  <div>Pending</div>
                  <div>Rejected</div>
                  <div>Total Days</div>
                </div>
                {leaveData.employees?.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No leave data available</div>
                ) : (
                  leaveData.employees?.map((emp, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50 min-w-[700px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm">{emp.name.charAt(0).toUpperCase()}</div>
                        <span className="font-medium text-gray-800">{emp.name}</span>
                      </div>
                      <div><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeClass(emp.role)}`}>{emp.role}</span></div>
                      <div className="text-gray-800">{emp.totalRequests}</div>
                      <div className="text-green font-medium">{emp.approved}</div>
                      <div className="text-amber font-medium">{emp.pending}</div>
                      <div className="text-red font-medium">{emp.rejected}</div>
                      <div className="text-teal font-medium">{emp.totalDays}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
