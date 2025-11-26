import { useState, useEffect } from 'react'

function LeaveRequest({ username, userRole }) {
  const [leaveType, setLeaveType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [requests, setRequests] = useState([])

  useEffect(() => { loadRequests() }, [username])

  const loadRequests = () => {
    const userRequests = JSON.parse(localStorage.getItem(`leaveRequests_${username}`) || '[]')
    setRequests(userRequests)
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) { alert('Please fill all fields'); return }
    if (new Date(endDate) < new Date(startDate)) { alert('End date must be after start date'); return }

    const newRequest = {
      id: Date.now(),
      username,
      userRole,
      type: leaveType,
      startDate,
      endDate,
      days: calculateDays(),
      reason,
      status: 'pending',
      submittedDate: new Date().toISOString()
    }

    const userRequests = JSON.parse(localStorage.getItem(`leaveRequests_${username}`) || '[]')
    userRequests.unshift(newRequest)
    localStorage.setItem(`leaveRequests_${username}`, JSON.stringify(userRequests))

    const allRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    allRequests.unshift(newRequest)
    localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests))

    alert('Leave request submitted successfully!')
    setStartDate('')
    setEndDate('')
    setReason('')
    loadRequests()
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green/10 text-green'
      case 'rejected': return 'bg-red/10 text-red'
      default: return 'bg-amber/10 text-amber'
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Leave Request</h1>
          <p className="text-gray-500">Submit and track your leave requests</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold text-teal mb-4">New Leave Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Leave Type</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal">
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
            </div>
            {calculateDays() > 0 && (
              <div className="text-sm text-teal font-medium">Duration: {calculateDays()} day{calculateDays() > 1 ? 's' : ''}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" placeholder="Please provide a reason for your leave..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal resize-none" />
            </div>
            <button type="submit" className="bg-teal text-white px-6 py-2.5 rounded-md font-medium hover:bg-teal-dark transition-colors">Submit Request</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-teal">My Leave Requests</h2>
          </div>
          {requests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No leave requests submitted</div>
          ) : (
            <div className="p-4 space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-gray-800 capitalize">{request.type} Leave</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(request.status)}`}>{request.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div><span className="text-gray-500">From:</span> <span className="text-gray-800">{formatDate(request.startDate)}</span></div>
                    <div><span className="text-gray-500">To:</span> <span className="text-gray-800">{formatDate(request.endDate)}</span></div>
                    <div><span className="text-gray-500">Days:</span> <span className="text-gray-800">{request.days}</span></div>
                    <div><span className="text-gray-500">Submitted:</span> <span className="text-gray-800">{formatDate(request.submittedDate)}</span></div>
                  </div>
                  <div className="text-sm"><span className="text-gray-500">Reason:</span> <span className="text-gray-800">{request.reason}</span></div>
                  {request.rejectionReason && (
                    <div className="text-sm mt-2"><span className="text-red">Rejection:</span> <span className="text-gray-800">{request.rejectionReason}</span></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaveRequest
