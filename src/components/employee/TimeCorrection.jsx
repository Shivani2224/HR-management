import { useState, useEffect } from 'react'

function TimeCorrection({ username, userRole }) {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [correctionRequests, setCorrectionRequests] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Form fields for correction
  const [newLoginTime, setNewLoginTime] = useState('')
  const [newLogoutTime, setNewLogoutTime] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')

  useEffect(() => {
    loadAttendanceRecords()
    loadCorrectionRequests()
  }, [username])

  const loadAttendanceRecords = () => {
    // Load recent attendance (last 7 days)
    const allRecords = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRecords = allRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= sevenDaysAgo
    })

    setAttendanceRecords(recentRecords)
  }

  const loadCorrectionRequests = () => {
    const requests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const myRequests = requests.filter(req => req.username === username)
    setCorrectionRequests(myRequests)
  }

  const handleSelectRecord = (record) => {
    setSelectedRecord(record)
    setIsEditing(true)

    // Set initial values
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

    // Create correction request
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

    // Save to global correction requests
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    allRequests.unshift(correctionRequest)
    localStorage.setItem('timeCorrectionRequests', JSON.stringify(allRequests))

    alert('Time correction request submitted successfully! Waiting for manager approval.')

    // Reset form
    setIsEditing(false)
    setSelectedRecord(null)
    setNewLoginTime('')
    setNewLogoutTime('')
    setCorrectionReason('')

    loadCorrectionRequests()
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedRecord(null)
    setNewLoginTime('')
    setNewLogoutTime('')
    setCorrectionReason('')
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
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    }
  }

  return (
    <div>
      <div>
        <h1>Time Correction</h1>
        <p>Request corrections to your attendance records</p>
      </div>

      {/* Edit Form */}
      {isEditing && selectedRecord && (
        <div>
          <h2>Request Time Correction</h2>
          <div>
            <h3>Original Record</h3>
            <div>
              <div>
                <span>Date:</span>
                <span>{formatDate(selectedRecord.date)}</span>
              </div>
              <div>
                <span>Login:</span>
                <span>{formatTime(selectedRecord.loginTime)}</span>
              </div>
              <div>
                <span>Logout:</span>
                <span>{formatTime(selectedRecord.logoutTime)}</span>
              </div>
              <div>
                <span>Work Time:</span>
                <span>{selectedRecord.totalWorked}</span>
              </div>
            </div>
          </div>

          <div>
            <h3>New Times</h3>
            <div>
              <div>
                <label>New Login Time</label>
                <input
                  type="datetime-local"
                  value={newLoginTime}
                  onChange={(e) => setNewLoginTime(e.target.value)}
                />
              </div>

              <div>
                <label>New Logout Time</label>
                <input
                  type="datetime-local"
                  value={newLogoutTime}
                  onChange={(e) => setNewLogoutTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label>Reason for Correction</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows="4"
                placeholder="Please explain why you need this correction..."
              />
            </div>

            <div>
              <button onClick={handleSubmitCorrection}>
                Submit Request
              </button>
              <button onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance Records */}
      {!isEditing && (
        <div>
          <h2>Recent Attendance (Last 7 Days)</h2>
          {attendanceRecords.length === 0 ? (
            <div>
              <p>No recent attendance records found</p>
            </div>
          ) : (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Work Time</th>
                    <th>Break Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{formatTime(record.loginTime)}</td>
                      <td>{formatTime(record.logoutTime)}</td>
                      <td>{record.totalWorked}</td>
                      <td>{record.totalBreak}</td>
                      <td>
                        <button
                          onClick={() => handleSelectRecord(record)}
                        >
                          Request Correction
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Correction Requests History */}
      {!isEditing && (
        <div>
          <h2>My Correction Requests</h2>
          {correctionRequests.length === 0 ? (
            <div>
              <p>No correction requests submitted</p>
            </div>
          ) : (
            <div>
              {correctionRequests.map((request) => (
                <div key={request.id}>
                  <div>
                    <span>
                      {formatDate(request.originalRecord.date)}
                    </span>
                    <span>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <div>
                      <h4>Original</h4>
                      <p>Login: {formatTime(request.originalRecord.loginTime)}</p>
                      <p>Logout: {formatTime(request.originalRecord.logoutTime)}</p>
                    </div>
                    <div>
                      <h4>Requested</h4>
                      <p>Login: {formatTime(request.newLoginTime)}</p>
                      <p>Logout: {formatTime(request.newLogoutTime)}</p>
                    </div>
                  </div>

                  <div>
                    <strong>Reason:</strong>
                    <span>{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div>
                      <strong>Rejection Reason:</strong>
                      <span>{request.rejectionReason}</span>
                    </div>
                  )}

                  <div>
                    <span>Submitted: {formatDate(request.submittedDate)}</span>
                    {request.reviewedDate && (
                      <span>Reviewed: {formatDate(request.reviewedDate)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeCorrection
