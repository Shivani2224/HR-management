import { useState, useEffect } from 'react'

function TimeCorrectionApproval({ userRole }) {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => { loadRequests() }, [userRole])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    let filteredRequests = []
    if (userRole === 'manager') filteredRequests = allRequests.filter(req => req.userRole === 'employee')
    else if (userRole === 'admin') filteredRequests = allRequests.filter(req => req.userRole === 'employee' || req.userRole === 'manager')
    setRequests(filteredRequests)
  }

  const handleApprove = (request) => {
    if (!window.confirm('Are you sure you want to approve this time correction?')) return
    updateAttendanceRecord(request)
    updateRequestStatus(request.id, 'approved')
  }

  const handleReject = (request) => {
    const reason = window.prompt('Please provide a reason for rejection:')
    if (reason === null || !reason.trim()) { alert('Rejection reason is required'); return }
    updateRequestStatus(request.id, 'rejected', reason)
  }

  const updateAttendanceRecord = (request) => {
    const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${request.username}`) || '[]')
    const updatedHistory = attendanceHistory.map(record => {
      if (record.id === request.originalRecord.id) {
        const newTotalTime = request.newLogoutTime - request.newLoginTime
        const breakMs = record.totalBreakMs
        const newWorkMs = newTotalTime - breakMs
        const workHours = Math.floor(newWorkMs / (1000 * 60 * 60))
        const workMinutes = Math.floor((newWorkMs % (1000 * 60 * 60)) / (1000 * 60))
        const workSeconds = Math.floor((newWorkMs % (1000 * 60)) / 1000)
        return { ...record, loginTime: request.newLoginTime, logoutTime: request.newLogoutTime, totalWorkedMs: newWorkMs, totalWorked: `${workHours}h ${workMinutes}m ${workSeconds}s`, corrected: true, correctionDate: new Date().toISOString() }
      }
      return record
    })
    localStorage.setItem(`attendance_${request.username}`, JSON.stringify(updatedHistory))
  }

  const updateRequestStatus = (requestId, status, rejectionReason = '') => {
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const updatedRequests = allRequests.map(req => req.id === requestId ? { ...req, status, rejectionReason, reviewedDate: new Date().toISOString(), reviewedBy: userRole } : req)
    localStorage.setItem('timeCorrectionRequests', JSON.stringify(updatedRequests))
    loadRequests()
    alert(`Time correction ${status} successfully!`)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formatDateTime = (timestamp) => new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const getStatusClass = (status) => { switch (status) { case 'approved': return 'bg-green/10 text-green'; case 'rejected': return 'bg-red/10 text-red'; default: return 'bg-amber/10 text-amber' } }
  const filteredRequests = requests.filter(req => filter === 'all' ? true : req.status === filter)
  const pendingCount = requests.filter(req => req.status === 'pending').length
  const approvedCount = requests.filter(req => req.status === 'approved').length
  const rejectedCount = requests.filter(req => req.status === 'rejected').length

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Time Correction Approval</h1>
          <p className="text-gray-500">Review and approve time correction requests</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === f ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{f === 'pending' ? pendingCount : f === 'approved' ? approvedCount : f === 'rejected' ? rejectedCount : requests.length}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">No {filter !== 'all' ? filter : ''} time correction requests</div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold">{request.username.charAt(0).toUpperCase()}</div>
                    <div><span className="font-semibold text-gray-800 block">{request.username}</span><span className="text-xs text-gray-500 capitalize">{request.userRole}</span></div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(request.status)}`}>{request.status}</span>
                </div>

                <div className="text-sm mb-3"><span className="text-gray-500">Date:</span> <span className="text-gray-800 font-medium ml-2">{formatDate(request.originalRecord.date)}</span></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Original Times</h4>
                    <p className="text-xs text-gray-500">Login: <span className="text-gray-800">{formatDateTime(request.originalRecord.loginTime)}</span></p>
                    <p className="text-xs text-gray-500">Logout: <span className="text-gray-800">{formatDateTime(request.originalRecord.logoutTime)}</span></p>
                    <p className="text-xs text-gray-500">Work: <span className="text-gray-800">{request.originalRecord.totalWorked}</span></p>
                  </div>
                  <div className="bg-teal/5 p-3 rounded">
                    <h4 className="font-medium text-teal text-sm mb-2">Requested Times</h4>
                    <p className="text-xs text-gray-500">Login: <span className="text-gray-800">{formatDateTime(request.newLoginTime)}</span></p>
                    <p className="text-xs text-gray-500">Logout: <span className="text-gray-800">{formatDateTime(request.newLogoutTime)}</span></p>
                  </div>
                </div>

                <div className="text-sm mb-2"><span className="text-gray-500">Reason:</span> <span className="text-gray-800 ml-2">{request.reason}</span></div>
                {request.rejectionReason && <div className="text-sm mb-2"><span className="text-red">Rejection:</span> <span className="text-gray-800 ml-2">{request.rejectionReason}</span></div>}
                <div className="text-xs text-gray-500">Submitted: {formatDate(request.submittedDate)}{request.reviewedDate && ` • Reviewed: ${formatDate(request.reviewedDate)}`}</div>

                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                    <button onClick={() => handleApprove(request)} className="bg-green text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green/90 transition-colors">✓ Approve</button>
                    <button onClick={() => handleReject(request)} className="bg-red text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red/90 transition-colors">✗ Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TimeCorrectionApproval
