import { useState, useEffect } from 'react'

function Navbar({ user, onLogout, onNavigate, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user.username)

  // Load display name from profile if exists
  useEffect(() => {
    const profileData = localStorage.getItem(`profile_${user.username}`)
    if (profileData) {
      const profile = JSON.parse(profileData)
      setDisplayName(profile.name || user.username)
    } else {
      setDisplayName(user.username)
    }
  }, [user.username, currentView])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setIsProfileOpen(false)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
    setIsMenuOpen(false)
  }

  const handleNavigate = (view) => {
    onNavigate(view)
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-teal text-white shadow-md sticky top-0 z-50">
      <div className="w-full px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4 relative">
          <div className="text-xl font-bold">HR System</div>
          <button onClick={toggleMenu} className="bg-white/15 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-white/25 transition-colors">
            <span>☰ Menu</span>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg min-w-[200px] z-50 overflow-hidden">
              <a onClick={() => handleNavigate('dashboard')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Dashboard</a>
              {(user.role === 'employee' || user.role === 'manager') && (
                <>
                  <a onClick={() => handleNavigate('attendance')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">My Attendance</a>
                  <a onClick={() => handleNavigate('time-correction')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Time Correction</a>
                  <a onClick={() => handleNavigate('leave-requests')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Leave Requests</a>
                  <a onClick={() => handleNavigate('payslips')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Payslips</a>
                </>
              )}
              <a onClick={() => handleNavigate('employee-status')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Team Status</a>
              {user.role === 'manager' && (
                <>
                  <a onClick={() => handleNavigate('leave-approval')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Leave Approval</a>
                  <a onClick={() => handleNavigate('time-correction-approval')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Time Correction Approval</a>
                  <a onClick={() => handleNavigate('employees')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Employees</a>
                  <a onClick={() => handleNavigate('reports')} className="block px-4 py-3 text-gray-800 cursor-pointer hover:bg-gray-50 hover:text-teal transition-colors">Reports</a>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <a onClick={() => handleNavigate('leave-approval')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Leave Approval</a>
                  <a onClick={() => handleNavigate('time-correction-approval')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Time Correction Approval</a>
                  <a onClick={() => handleNavigate('employees')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Employees</a>
                  <a onClick={() => handleNavigate('reports')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Reports</a>
                  <a onClick={() => handleNavigate('users')} className="block px-4 py-3 text-gray-800 cursor-pointer hover:bg-gray-50 hover:text-teal transition-colors">User Management</a>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <div onClick={toggleProfile} className="flex items-center gap-2.5 px-4 py-2 bg-white/20 rounded-md cursor-pointer hover:bg-white/30 transition-colors">
            <span className="w-8 h-8 rounded-full bg-white text-teal flex items-center justify-center font-bold">{displayName.charAt(0).toUpperCase()}</span>
            <span className="font-medium">{displayName}</span>
          </div>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg min-w-[180px] z-50 overflow-hidden">
              <a onClick={() => handleNavigate('profile')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">My Profile</a>
              {(user.role === 'manager' || user.role === 'admin') && (
                <a onClick={() => handleNavigate('settings')} className="block px-4 py-3 text-gray-800 cursor-pointer border-b border-gray-200 hover:bg-gray-50 hover:text-teal transition-colors">Settings</a>
              )}
              <button onClick={onLogout} className="w-full px-4 py-3 bg-red text-white text-left font-medium hover:bg-red/90 transition-colors">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
