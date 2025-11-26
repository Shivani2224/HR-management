import { useState, useEffect } from 'react'
import Login from './components/Login'
import Navbar from './components/Navbar'
import EmployeeDashboard from './components/EmployeeDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import AdminDashboard from './components/AdminDashboard'
import UserManagement from './components/UserManagement'
import EmployeeDirectory from './components/EmployeeDirectory'
import Reports from './components/Reports'
import Settings from './components/Settings'
import LeaveRequest from './components/LeaveRequest'
import LeaveApproval from './components/LeaveApproval'
import AttendanceHistory from './components/AttendanceHistory'
import Payslips from './components/Payslips'
import Profile from './components/Profile'
import TimeCorrection from './components/TimeCorrection'
import TimeCorrectionApproval from './components/TimeCorrectionApproval'
import EmployeeStatus from './components/EmployeeStatus'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')


  const handleLogin = (username, role) => {
    setUser({ username, role })
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('dashboard')
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            currentView={currentView}
          />
          <div>
            {user.role === 'employee' && (
              <>
                {currentView === 'dashboard' && <EmployeeDashboard user={user} />}
                {currentView === 'leave-requests' && <LeaveRequest username={user.username} userRole={user.role} />}
                {currentView === 'attendance' && <AttendanceHistory username={user.username} />}
                {currentView === 'time-correction' && <TimeCorrection username={user.username} userRole={user.role} />}
                {currentView === 'payslips' && <Payslips username={user.username} userRole={user.role} />}
                {currentView === 'profile' && <Profile username={user.username} userRole={user.role} />}
                {currentView === 'employee-status' && <EmployeeStatus />}
              </>
            )}
            {user.role === 'manager' && (
              <>
                {currentView === 'dashboard' && <ManagerDashboard user={user} onNavigate={handleNavigate} />}
                {currentView === 'leave-requests' && <LeaveRequest username={user.username} userRole={user.role} />}
                {currentView === 'leave-approval' && <LeaveApproval userRole={user.role} />}
                {currentView === 'attendance' && <AttendanceHistory username={user.username} />}
                {currentView === 'time-correction' && <TimeCorrection username={user.username} userRole={user.role} />}
                {currentView === 'time-correction-approval' && <TimeCorrectionApproval userRole={user.role} />}
                {currentView === 'payslips' && <Payslips username={user.username} userRole={user.role} />}
                {currentView === 'profile' && <Profile username={user.username} userRole={user.role} />}
                {currentView === 'employees' && <EmployeeDirectory />}
                {currentView === 'reports' && <Reports />}
                {currentView === 'settings' && <Settings userRole={user.role} />}
                {currentView === 'employee-status' && <EmployeeStatus />}
              </>
            )}
            {user.role === 'admin' && (
              <>
                {currentView === 'dashboard' && <AdminDashboard user={user} onNavigate={handleNavigate} />}
                {currentView === 'leave-approval' && <LeaveApproval userRole={user.role} />}
                {currentView === 'time-correction-approval' && <TimeCorrectionApproval userRole={user.role} />}
                {currentView === 'employees' && <EmployeeDirectory />}
                {currentView === 'reports' && <Reports />}
                {currentView === 'settings' && <Settings userRole={user.role} />}
                {currentView === 'users' && <UserManagement />}
                {currentView === 'employee-status' && <EmployeeStatus />}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
