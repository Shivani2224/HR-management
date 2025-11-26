import { useState, useEffect } from 'react'

function Profile({ username, userRole }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: username,
    email: '',
    phone: '',
    address: '',
    department: '',
    joinDate: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [leaveBalance, setLeaveBalance] = useState({
    vacation: 15,
    sick: 10,
    personal: 5,
    total: 30
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    loadProfileData()
    calculateLeaveBalance()
  }, [username])

  const loadProfileData = () => {
    const saved = localStorage.getItem(`profile_${username}`)
    if (saved) {
      setProfileData(JSON.parse(saved))
    } else {
      const defaultData = {
        name: username,
        email: `${username.toLowerCase().replace(' ', '.')}@company.com`,
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
        department: userRole === 'employee' ? 'Operations' : userRole === 'manager' ? 'Management' : 'Administration',
        joinDate: '2023-01-15',
        emergencyContact: 'Emergency Contact',
        emergencyPhone: '+1 (555) 987-6543'
      }
      setProfileData(defaultData)
      localStorage.setItem(`profile_${username}`, JSON.stringify(defaultData))
    }
  }

  const calculateLeaveBalance = () => {
    const leaveRequests = JSON.parse(localStorage.getItem(`leaveRequests_${username}`) || '[]')
    const usedLeave = { vacation: 0, sick: 0, personal: 0 }
    leaveRequests.forEach(request => {
      if (request.status === 'approved' && usedLeave[request.type] !== undefined) {
        usedLeave[request.type] += request.days
      }
    })
    const balance = {
      vacation: 15 - usedLeave.vacation,
      sick: 10 - usedLeave.sick,
      personal: 5 - usedLeave.personal
    }
    balance.total = balance.vacation + balance.sick + balance.personal
    setLeaveBalance(balance)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    localStorage.setItem(`profile_${username}`, JSON.stringify(profileData))
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const handleCancel = () => {
    loadProfileData()
    setIsEditing(false)
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const userIndex = users.findIndex(u => u.name === username)

    if (userIndex === -1) {
      setPasswordError('User not found')
      return
    }
    if (users[userIndex].password !== passwordData.currentPassword) {
      setPasswordError('Current password is incorrect')
      return
    }

    users[userIndex].password = passwordData.newPassword
    localStorage.setItem('systemUsers', JSON.stringify(users))

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordSuccess('Password changed successfully!')
    setTimeout(() => setPasswordSuccess(''), 3000)
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">My Profile</h1>
          <p className="text-gray-500">Manage your personal information and view leave balance</p>
        </div>

        <div className="space-y-6">
          {/* Leave Balance Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-teal mb-4">Leave Balance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">🏖️</div>
                <div>
                  <div className="text-xs text-gray-500">Vacation</div>
                  <div className="text-lg font-bold text-teal">{leaveBalance.vacation} days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">🤒</div>
                <div>
                  <div className="text-xs text-gray-500">Sick Leave</div>
                  <div className="text-lg font-bold text-teal">{leaveBalance.sick} days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">📅</div>
                <div>
                  <div className="text-xs text-gray-500">Personal</div>
                  <div className="text-lg font-bold text-teal">{leaveBalance.personal} days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg font-bold text-teal">{leaveBalance.total} days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-teal">Personal Information</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="bg-green text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green/90 transition-colors">
                    ✓ Save
                  </button>
                  <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-500/90 transition-colors">
                    ✗ Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.name}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={profileData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.email}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" value={profileData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.phone}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                {isEditing ? (
                  <input type="text" name="department" value={profileData.department} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.department}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Join Date</label>
                {isEditing ? (
                  <input type="date" name="joinDate" value={profileData.joinDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{new Date(profileData.joinDate).toLocaleDateString()}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <div className="capitalize text-gray-800">{userRole}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                {isEditing ? (
                  <textarea name="address" value={profileData.address} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal resize-none" />
                ) : (
                  <div className="text-gray-800">{profileData.address}</div>
                )}
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-800 mt-6 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Name</label>
                {isEditing ? (
                  <input type="text" name="emergencyContact" value={profileData.emergencyContact} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.emergencyContact}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Phone</label>
                {isEditing ? (
                  <input type="tel" name="emergencyPhone" value={profileData.emergencyPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                ) : (
                  <div className="text-gray-800">{profileData.emergencyPhone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-teal mb-4">Change Password</h2>

            {passwordError && (
              <div className="bg-red/10 text-red px-4 py-3 rounded-md mb-4 text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="bg-green/10 text-green px-4 py-3 rounded-md mb-4 text-sm">{passwordSuccess}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Min 6 characters" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Re-enter new password" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
            </div>

            <button onClick={handleChangePassword} className="bg-teal text-white px-6 py-2.5 rounded-md font-medium hover:bg-teal-dark transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
