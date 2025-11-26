import { useState, useEffect } from 'react'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' })

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { filterUsers() }, [users, searchTerm, roleFilter])

  const loadUsers = () => {
    setUsers(JSON.parse(localStorage.getItem('systemUsers') || '[]'))
  }

  const filterUsers = () => {
    let filtered = [...users]
    if (searchTerm) filtered = filtered.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    if (roleFilter !== 'all') filtered = filtered.filter(user => user.role === roleFilter)
    setFilteredUsers(filtered)
  }

  const handleAddUser = () => {
    setModalMode('add')
    setFormData({ name: '', email: '', password: '', role: 'employee' })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({ name: user.name, email: user.email, password: user.password, role: user.role })
    setShowModal(true)
  }

  const handleDeleteUser = (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return
    const updatedUsers = users.filter(u => u.email !== user.email)
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
    loadUsers()
    alert('User deleted successfully!')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) { alert('All fields are required!'); return }
    if (formData.password.length < 6) { alert('Password must be at least 6 characters!'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) { alert('Please enter a valid email address!'); return }

    if (modalMode === 'add') {
      if (users.some(u => u.email === formData.email)) { alert('A user with this email already exists!'); return }
      const updatedUsers = [...users, { name: formData.name, email: formData.email, password: formData.password, role: formData.role }]
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
      alert('User added successfully!')
    } else {
      const updatedUsers = users.map(u => u.email === selectedUser.email ? { name: formData.name, email: formData.email, password: formData.password, role: formData.role } : u)
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
      alert('User updated successfully!')
    }
    loadUsers()
    setShowModal(false)
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-teal/10 text-teal'
      case 'manager': return 'bg-amber/10 text-amber'
      case 'employee': return 'bg-green/10 text-green'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal mb-1">User Management</h1>
            <p className="text-gray-500">Manage system users and their roles</p>
          </div>
          <button onClick={handleAddUser} className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">+ Add New User</button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Filter by Role:</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">Showing {filteredUsers.length} of {users.length} users</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_100px_120px] gap-4 p-4 bg-teal text-white font-semibold text-sm">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Actions</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No users found</div>
          ) : (
            filteredUsers.map((user, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_100px_120px] gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <div className="text-gray-500 text-sm truncate">{user.email}</div>
                <div><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeClass(user.role)}`}>{user.role}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditUser(user)} className="text-teal hover:text-teal-dark text-sm font-medium">Edit</button>
                  <button onClick={() => handleDeleteUser(user)} className="text-red hover:text-red/80 text-sm font-medium">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-teal">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter full name" required className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Enter email address" required disabled={modalMode === 'edit'} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal disabled:bg-gray-50 disabled:text-gray-500" />
                  {modalMode === 'edit' && <small className="text-gray-500 text-xs">Email cannot be changed</small>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Min 6 characters" required className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-500/90 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-teal text-white px-4 py-2 rounded-md font-medium hover:bg-teal-dark transition-colors">{modalMode === 'add' ? 'Add User' : 'Update User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
