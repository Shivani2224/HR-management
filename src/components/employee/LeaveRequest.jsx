import { useState, useEffect } from 'react'

function LeaveRequest({ username, userRole }) {
  const [leaveType, setLeaveType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const savedRequests = localStorage.getItem(`leaveRequests_${username}`)
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests))
    }
  }, [username])

  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem(`leaveRequests_${username}`, JSON.stringify(requests))
    }
  }, [requests, username])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date')
      return
    }
    if (!reason.trim()) {
      alert('Please provide a reason for your leave request')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    const newRequest = {
      id: Date.now(),
      username,
      userRole,
      type: leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
      submittedDate: new Date().toISOString(),
    }

    setRequests([newRequest, ...requests])

    const globalRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    globalRequests.unshift(newRequest)
    localStorage.setItem('allLeaveRequests', JSON.stringify(globalRequests))

    setLeaveType('vacation')
    setStartDate('')
    setEndDate('')
    setReason('')
    alert('Leave request submitted successfully!')
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green/10 text-green'
      case 'rejected': return 'bg-red/10 text-red'
      default: return 'bg-amber/10 text-amber'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Leave Requests</h1>
          <p className="text-gray-500">Submit and manage your leave requests</p>
        </div>

        {/* Submit New Request Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold text-teal mb-4">Submit New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-800 mb-1">Leave Type</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal"
              >
                <option value="vacation">Vacation Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-800 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-800 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-800 mb-1">Reason</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for your leave request..."
                className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal resize-none"
              />
            </div>

            <button type="submit" className="bg-teal text-white px-6 py-2.5 rounded-md font-medium hover:bg-teal-dark transition-colors">
              Submit Request
            </button>
          </form>
        </div>

        {/* Request History */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-teal mb-4">My Leave Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No leave requests submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      <span className="font-semibold text-gray-800">
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">Duration:</span>
                      <span className="text-gray-800">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        <span className="text-gray-500 ml-2">({request.days} day{request.days > 1 ? 's' : ''})</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">Submitted:</span>
                      <span className="text-gray-800">{formatDate(request.submittedDate)}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">Reason:</span>
                      <span className="text-gray-800">{request.reason}</span>
                    </div>
                  </div>
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
