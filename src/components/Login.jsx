import { useState, useEffect } from 'react'

// Predefined users - in a real app, this would be in a backend database
const defaultUsers = [
  { email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'manager@company.com', password: 'manager123', role: 'manager', name: 'Manager User' },
  { email: 'employee@company.com', password: 'employee123', role: 'employee', name: 'Employee User' },
  { email: 'john@company.com', password: 'john123', role: 'employee', name: 'John Doe' },
  { email: 'sarah@company.com', password: 'sarah123', role: 'manager', name: 'Sarah Smith' }
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Initialize users in localStorage on first load
  useEffect(() => {
    const existingUsers = localStorage.getItem('systemUsers')
    if (!existingUsers) {
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')

    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      // Store current user for password change functionality
      localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.name, role: user.role }))
      onLogin(user.name, user.role)
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal to-teal-dark p-5">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-center text-teal text-3xl font-bold mb-8">
          HR System Login
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red/10 text-red px-4 py-3 rounded-lg border-l-4 border-red text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-gray-800 text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-gray-800 text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10"
            />
          </div>

          <button
            type="submit"
            className="bg-teal text-white py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all mt-2 hover:bg-teal-dark hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-teal text-sm font-bold mb-3">
            Demo Credentials:
          </p>
          <p className="text-sm text-gray-500 my-1.5">Admin: admin@company.com / admin123</p>
          <p className="text-sm text-gray-500 my-1.5">Manager: manager@company.com / manager123</p>
          <p className="text-sm text-gray-500 my-1.5">Employee: employee@company.com / employee123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
