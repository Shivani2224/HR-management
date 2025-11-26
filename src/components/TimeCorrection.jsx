import { useState, useEffect } from 'react'

function TimeCorrection({ username, userRole }) {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [correctionRequests, setCorrectionRequests] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [newLoginTime, setNewLoginTime] = useState('')
  const [newLogoutTime, setNewLogoutTime] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')

  useEffect(() => {
    loadAttendanceRecords()
    loadCorrectionRequests()
  }, [username])

  const loadAttendanceRecords = () => {
    const allRecords = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentRecords = allRecords.filter(record => new Date(record.date) >= sevenDaysAgo)
    setAttendanceRecords(recentRecords)
  }

  const loadCorrectionRequests = () => {
    const requests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    setCorrectionRequests(requests.filter(req => req.username === username))
  }

  const handleSelectRecord = (record) => {
    setSelectedRecord(record)
    setIsEditing(true)
    const loginDate = new Date(record.loginTime)
    const logoutDate = new Date(record.logoutTime)
    setNewLoginTime(formatDateTimeForInput(loginDate))
    setNewLogoutTime(formatDateTimeForInput(logoutDate))
    setCorrectionReason('')
  }

  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmitCorrection = () => {
    if (!correctionReason.trim()) {
      alert('Please provide a reason for the time correction')
      return
    }
    const newLoginDate = new Date(newLoginTime)
    const newLogoutDate = new Date(newLogoutTime)
    if (newLogoutDate <= newLoginDate) {
      alert('Logout time must be after login time')
      return
    }

    const correctionRequest = {
      id: Date.now(),
      username,
      userRole,
      originalRecord: selectedRecord,
      newLoginTime: newLoginDate.getTime(),
      newLogoutTime: newLogoutDate.getTime(),
      reason: correctionReason,
      status: 'pending',
      submittedDate: new Date().toISOString(),
    }

    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    allRequests.unshift(correctionRequest)
    localStorage.setItem('timeCorrectionRequests', JSON.stringify(allRequests))
    alert('Time correction request submitted successfully!')
    handleCancel()
    loadCorrectionRequests()
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedRecord(null)
    setNewLoginTime('')
    setNewLogoutTime('')
    setCorrectionReason('')
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green/10 text-green'
      case 'rejected': return 'bg-red/10 text-red'
      default: return 'bg-amber/10 text-amber'
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Time Correction</h1>
          <p className="text-gray-500">Request corrections to your attendance records</p>
        </div>

        {isEditing && selectedRecord && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-bold text-teal mb-4">Request Time Correction</h2>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Original Record</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(selectedRecord.date)}</span></div>
                <div><span className="text-gray-500">Login:</span> <span className="font-medium">{formatTime(selectedRecord.loginTime)}</span></div>
                <div><span className="text-gray-500">Logout:</span> <span className="font-medium">{formatTime(selectedRecord.logoutTime)}</span></div>
                <div><span className="text-gray-500">Work Time:</span> <span className="font-medium text-teal">{selectedRecord.totalWorked}</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">New Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">New Login Time</label>
                  <input type="datetime-local" value={newLoginTime} onChange={(e) => setNewLoginTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">New Logout Time</label>
                  <input type="datetime-local" value={newLogoutTime} onChange={(e) => setNewLogoutTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Reason for Correction</label>
                <textarea value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} rows="3" placeholder="Please explain why you need this correction..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmitCorrection} className="bg-teal text-white px-6 py-2.5 rounded-md font-medium hover:bg-teal-dark transition-colors">Submit Request</button>
                <button onClick={handleCancel} className="bg-gray-500 text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-500/90 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-teal">Recent Attendance (Last 7 Days)</h2>
            </div>
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No recent attendance records found</div>
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
                      <th className="bg-teal text-white p-3 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b border-gray-200 text-sm">{formatDate(record.date)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{formatTime(record.loginTime)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{formatTime(record.logoutTime)}</td>
                        <td className="p-3 border-b border-gray-200 text-sm font-medium text-teal">{record.totalWorked}</td>
                        <td className="p-3 border-b border-gray-200 text-sm">{record.totalBreak}</td>
                        <td className="p-3 border-b border-gray-200">
                          <button onClick={() => handleSelectRecord(record)} className="bg-teal text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-teal-dark transition-colors">Request Correction</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-teal">My Correction Requests</h2>
            </div>
            {correctionRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No correction requests submitted</div>
            ) : (
              <div className="p-4 space-y-4">
                {correctionRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-semibold text-gray-800">{formatDate(request.originalRecord.date)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(request.status)}`}>{request.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h4 className="font-medium text-gray-800 mb-1">Original</h4>
                        <p className="text-gray-500">Login: {formatTime(request.originalRecord.loginTime)}</p>
                        <p className="text-gray-500">Logout: {formatTime(request.originalRecord.logoutTime)}</p>
                      </div>
                      <div className="bg-teal/5 p-3 rounded">
                        <h4 className="font-medium text-teal mb-1">Requested</h4>
                        <p className="text-gray-800">Login: {formatTime(request.newLoginTime)}</p>
                        <p className="text-gray-800">Logout: {formatTime(request.newLogoutTime)}</p>
                      </div>
                    </div>
                    <div className="text-sm"><span className="text-gray-500">Reason:</span> <span className="text-gray-800">{request.reason}</span></div>
                    {request.rejectionReason && <div className="text-sm mt-2"><span className="text-red">Rejection:</span> <span className="text-gray-800">{request.rejectionReason}</span></div>}
                    <div className="text-xs text-gray-500 mt-2">Submitted: {formatDate(request.submittedDate)}{request.reviewedDate && ` • Reviewed: ${formatDate(request.reviewedDate)}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeCorrection
