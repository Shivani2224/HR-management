import { useState, useEffect } from 'react'

function LeaveApproval({ userRole }) {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    loadRequests()
  }, [userRole])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    let filteredRequests = []
    if (userRole === 'manager') {
      filteredRequests = allRequests.filter(req => req.userRole === 'employee')
    } else if (userRole === 'admin') {
      filteredRequests = allRequests.filter(req => req.userRole === 'employee' || req.userRole === 'manager')
    }
    setRequests(filteredRequests)
  }

  const handleApprove = (requestId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) return
    updateRequestStatus(requestId, 'approved')
  }

  const handleReject = (requestId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return
    updateRequestStatus(requestId, 'rejected', reason)
  }

  const updateRequestStatus = (requestId, status, rejectionReason = '') => {
    const allRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    const updatedRequests = allRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, status, rejectionReason, reviewedDate: new Date().toISOString(), reviewedBy: userRole }
      }
      return req
    })
    localStorage.setItem('allLeaveRequests', JSON.stringify(updatedRequests))

    const request = allRequests.find(req => req.id === requestId)
    if (request) {
      const userRequests = JSON.parse(localStorage.getItem(`leaveRequests_${request.username}`) || '[]')
      const updatedUserRequests = userRequests.map(req => {
        if (req.id === requestId) {
          return { ...req, status, rejectionReason, reviewedDate: new Date().toISOString(), reviewedBy: userRole }
        }
        return req
      })
      localStorage.setItem(`leaveRequests_${request.username}`, JSON.stringify(updatedUserRequests))
    }

    loadRequests()
    alert(`Leave request ${status} successfully!`)
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

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const pendingCount = requests.filter(req => req.status === 'pending').length
  const approvedCount = requests.filter(req => req.status === 'approved').length
  const rejectedCount = requests.filter(req => req.status === 'rejected').length

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Leave Approval</h1>
          <p className="text-gray-500">Review and approve leave requests from your team</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === 'pending' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}
          >
            Pending <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === 'approved' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}
          >
            Approved <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{approvedCount}</span>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === 'rejected' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}
          >
            Rejected <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{rejectedCount}</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${filter === 'all' ? 'bg-teal text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-teal'}`}
          >
            All <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{requests.length}</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
              <p>No {filter !== 'all' ? filter : ''} leave requests to display</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block">{request.username}</span>
                      <span className="text-xs text-gray-500 capitalize">{request.userRole}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Leave Type:</span>
                    <span className="ml-2 text-gray-800 font-medium">{request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 text-gray-800">{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Days:</span>
                    <span className="ml-2 text-gray-800">{request.days} day{request.days > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <span className="ml-2 text-gray-800">{formatDate(request.submittedDate)}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Reason:</span>
                    <span className="ml-2 text-gray-800">{request.reason}</span>
                  </div>
                  {request.rejectionReason && (
                    <div className="md:col-span-2">
                      <span className="text-red">Rejection Reason:</span>
                      <span className="ml-2 text-gray-800">{request.rejectionReason}</span>
                    </div>
                  )}
                  {request.reviewedDate && (
                    <div>
                      <span className="text-gray-500">Reviewed:</span>
                      <span className="ml-2 text-gray-800">{formatDate(request.reviewedDate)}</span>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green/90 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red/90 transition-colors"
                    >
                      ✗ Reject
                    </button>
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

export default LeaveApproval
