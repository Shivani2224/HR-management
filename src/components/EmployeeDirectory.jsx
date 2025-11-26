import { useState, useEffect } from 'react'

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [employeeStats, setEmployeeStats] = useState({})

  useEffect(() => { loadEmployees() }, [])
  useEffect(() => { filterEmployees() }, [employees, searchTerm, roleFilter])

  const loadEmployees = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    setEmployees(users.filter(u => u.role === 'employee' || u.role === 'manager'))
  }

  const filterEmployees = () => {
    let filtered = [...employees]
    if (searchTerm) filtered = filtered.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
    if (roleFilter !== 'all') filtered = filtered.filter(emp => emp.role === roleFilter)
    setFilteredEmployees(filtered)
  }

  const loadEmployeeStats = (employee) => {
    const attendance = JSON.parse(localStorage.getItem(`attendance_${employee.name}`) || '[]')
    let totalHours = 0, totalBreak = 0
    attendance.forEach(record => {
      totalHours += record.totalWorkedMs / (1000 * 60 * 60)
      totalBreak += record.totalBreakMs / (1000 * 60 * 60)
    })
    const leaveRequests = JSON.parse(localStorage.getItem(`leaveRequests_${employee.name}`) || '[]')
    const timeCorrections = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]').filter(req => req.username === employee.name)
    const profile = JSON.parse(localStorage.getItem(`profile_${employee.name}`) || '{}')
    const activeSession = JSON.parse(localStorage.getItem(`activeSession_${employee.name}`) || '{}')

    return {
      totalSessions: attendance.length,
      totalHours: totalHours.toFixed(1),
      totalBreak: totalBreak.toFixed(1),
      avgHours: attendance.length > 0 ? (totalHours / attendance.length).toFixed(1) : '0',
      totalLeaves: leaveRequests.length,
      approvedLeaves: leaveRequests.filter(req => req.status === 'approved').length,
      pendingLeaves: leaveRequests.filter(req => req.status === 'pending').length,
      totalCorrections: timeCorrections.length,
      profile,
      isActive: activeSession.isLoggedIn || false,
      lastLogin: attendance.length > 0 ? attendance[0].loginTime : null
    }
  }

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    setEmployeeStats(loadEmployeeStats(employee))
    setShowDetailsModal(true)
  }

  const formatDate = (timestamp) => timestamp ? new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'
  const getRoleBadgeClass = (role) => role === 'manager' ? 'bg-amber/10 text-amber' : 'bg-green/10 text-green'

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Employee Directory</h1>
          <p className="text-gray-500">View all employees and their information</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Filter by Role:</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal">
                <option value="all">All Employees</option>
                <option value="manager">Managers</option>
                <option value="employee">Employees</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">Showing {filteredEmployees.length} of {employees.length} employees</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">No employees found</div>
          ) : (
            filteredEmployees.map((employee, index) => {
              const stats = loadEmployeeStats(employee)
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg">{employee.name.charAt(0).toUpperCase()}</div>
                      {stats.isActive && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getRoleBadgeClass(employee.role)}`}>{employee.role}</span>
                      <p className="text-xs text-gray-500 mt-1 truncate">{employee.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-teal">{stats.totalHours}h</div>
                      <div className="text-xs text-gray-500">Total Hours</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-teal">{stats.totalSessions}</div>
                      <div className="text-xs text-gray-500">Sessions</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-teal">{stats.approvedLeaves}</div>
                      <div className="text-xs text-gray-500">Leaves</div>
                    </div>
                  </div>
                  <button onClick={() => handleViewDetails(employee)} className="w-full bg-teal text-white py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">View Details</button>
                </div>
              )
            })
          )}
        </div>

        {showDetailsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg font-bold text-teal">Employee Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal text-white flex items-center justify-center font-bold text-2xl">{selectedEmployee.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedEmployee.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeClass(selectedEmployee.role)}`}>{selectedEmployee.role}</span>
                    <p className="text-sm text-gray-500 mt-1">{selectedEmployee.email}</p>
                    {employeeStats.isActive && <span className="inline-block mt-2 px-2 py-1 bg-green/10 text-green text-xs rounded-full font-medium">Currently Active</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="text-gray-800">{employeeStats.profile.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Department:</span><span className="text-gray-800">{employeeStats.profile.department || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Join Date:</span><span className="text-gray-800">{employeeStats.profile.joinDate ? new Date(employeeStats.profile.joinDate).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Last Login:</span><span className="text-gray-800">{formatDate(employeeStats.lastLogin)}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Attendance Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Total Sessions:</span><span className="text-gray-800 font-medium">{employeeStats.totalSessions}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Total Hours Worked:</span><span className="text-gray-800 font-medium">{employeeStats.totalHours}h</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Average Hours/Day:</span><span className="text-gray-800 font-medium">{employeeStats.avgHours}h</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Total Break Time:</span><span className="text-gray-800 font-medium">{employeeStats.totalBreak}h</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Leave Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Total Requests:</span><span className="text-gray-800 font-medium">{employeeStats.totalLeaves}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Approved Leaves:</span><span className="text-green font-medium">{employeeStats.approvedLeaves}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pending Requests:</span><span className="text-amber font-medium">{employeeStats.pendingLeaves}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Other Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Time Corrections:</span><span className="text-gray-800 font-medium">{employeeStats.totalCorrections}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Emergency Contact:</span><span className="text-gray-800">{employeeStats.profile.emergencyContact || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Emergency Phone:</span><span className="text-gray-800">{employeeStats.profile.emergencyPhone || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeDirectory
