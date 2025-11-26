import { useState, useEffect } from 'react'

function Settings({ userRole }) {
  const [settings, setSettings] = useState({
    companyName: 'HR System',
    workingHours: { start: '09:00', end: '17:00' },
    leavePolicies: { vacation: 15, sick: 10, personal: 5 },
    holidays: [],
    autoLogoutEnabled: true,
    breakRemindersEnabled: true,
    breakReminderInterval: 240,
    emailNotifications: true,
    darkModeDefault: false
  })
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' })
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => { loadSettings() }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }

  const handleInputChange = (category, field, value) => {
    if (category) {
      setSettings(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }))
    } else {
      setSettings(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings))
    setSaveMessage('Settings saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) { alert('Please enter both holiday name and date'); return }
    setSettings(prev => ({ ...prev, holidays: [...prev.holidays, newHoliday] }))
    setNewHoliday({ name: '', date: '' })
  }

  const handleDeleteHoliday = (index) => {
    setSettings(prev => ({ ...prev, holidays: prev.holidays.filter((_, i) => i !== index) }))
  }

  const handleResetSettings = () => {
    if (!window.confirm('Are you sure you want to reset all settings to default?')) return
    const defaultSettings = {
      companyName: 'HR System',
      workingHours: { start: '09:00', end: '17:00' },
      leavePolicies: { vacation: 15, sick: 10, personal: 5 },
      holidays: [],
      autoLogoutEnabled: true,
      breakRemindersEnabled: true,
      breakReminderInterval: 240,
      emailNotifications: true,
      darkModeDefault: false
    }
    setSettings(defaultSettings)
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings))
    alert('Settings reset to default!')
  }

  const handleExportData = () => {
    const allData = {
      users: JSON.parse(localStorage.getItem('systemUsers') || '[]'),
      leaveRequests: JSON.parse(localStorage.getItem('allLeaveRequests') || '[]'),
      timeCorrectionRequests: JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]'),
      settings
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hr_system_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const isEmployee = userRole === 'employee'
  const getRemainingLeaves = () => ({
    vacation: settings.leavePolicies.vacation,
    sick: settings.leavePolicies.sick,
    personal: settings.leavePolicies.personal,
    total: settings.leavePolicies.vacation + settings.leavePolicies.sick + settings.leavePolicies.personal
  })

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal mb-1">{isEmployee ? 'My Settings' : 'System Settings'}</h1>
            <p className="text-gray-500">{isEmployee ? 'View company information and policies' : 'Configure system preferences and policies'}</p>
          </div>
          {!isEmployee && (
            <div className="flex gap-2">
              <button onClick={handleExportData} className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">Export Data</button>
              <button onClick={handleResetSettings} className="bg-gray-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-500/90 transition-colors">Reset to Default</button>
            </div>
          )}
        </div>

        {saveMessage && !isEmployee && (
          <div className="bg-green/10 text-green px-4 py-3 rounded-md mb-6 text-sm">{saveMessage}</div>
        )}

        {isEmployee && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Working Hours</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 block">Start Time</span>
                  <span className="text-xl font-bold text-gray-800">{settings.workingHours.start}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 block">End Time</span>
                  <span className="text-xl font-bold text-gray-800">{settings.workingHours.end}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Annual Leave Balance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🏖️', label: 'Vacation Days', value: getRemainingLeaves().vacation },
                  { icon: '🏥', label: 'Sick Leave', value: getRemainingLeaves().sick },
                  { icon: '👤', label: 'Personal Days', value: getRemainingLeaves().personal },
                  { icon: '📊', label: 'Total Available', value: getRemainingLeaves().total }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-lg font-bold text-teal">{item.value} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Company Holidays</h2>
              {settings.holidays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No holidays scheduled yet</div>
              ) : (
                <div className="space-y-2">
                  {settings.holidays.map((holiday, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{holiday.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isEmployee && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Company Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Company Name</label>
                <input type="text" value={settings.companyName} onChange={(e) => handleInputChange(null, 'companyName', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Working Hours</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Start Time</label>
                  <input type="time" value={settings.workingHours.start} onChange={(e) => handleInputChange('workingHours', 'start', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">End Time</label>
                  <input type="time" value={settings.workingHours.end} onChange={(e) => handleInputChange('workingHours', 'end', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Leave Policies (Days per Year)</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Vacation Days', field: 'vacation' },
                  { label: 'Sick Leave Days', field: 'sick' },
                  { label: 'Personal Days', field: 'personal' }
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{item.label}</label>
                    <input type="number" min="0" value={settings.leavePolicies[item.field]} onChange={(e) => handleInputChange('leavePolicies', item.field, parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">System Preferences</h2>
              <div className="space-y-4">
                {[
                  { field: 'autoLogoutEnabled', label: 'Enable Auto-Logout at Midnight', desc: 'Automatically log out employees at the end of the day' },
                  { field: 'breakRemindersEnabled', label: 'Enable Break Reminders', desc: 'Remind employees to take breaks' },
                  { field: 'emailNotifications', label: 'Enable Email Notifications', desc: 'Send email notifications for important events' },
                  { field: 'darkModeDefault', label: 'Dark Mode by Default', desc: 'Enable dark mode for new users by default' }
                ].map((item) => (
                  <div key={item.field} className="flex items-start gap-3">
                    <input type="checkbox" checked={settings[item.field]} onChange={(e) => handleInputChange(null, item.field, e.target.checked)} className="mt-1 w-4 h-4 accent-teal" />
                    <div>
                      <label className="font-medium text-gray-800 block">{item.label}</label>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
                {settings.breakRemindersEnabled && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Break Reminder Interval (minutes)</label>
                    <input type="number" min="30" step="30" value={settings.breakReminderInterval} onChange={(e) => handleInputChange(null, 'breakReminderInterval', parseInt(e.target.value))} className="w-32 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-teal mb-4">Company Holidays</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <input type="text" placeholder="Holiday name" value={newHoliday.name} onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))} className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                <input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-teal" />
                <button onClick={handleAddHoliday} className="bg-teal text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">+ Add Holiday</button>
              </div>
              {settings.holidays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No holidays added yet</div>
              ) : (
                <div className="space-y-2">
                  {settings.holidays.map((holiday, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{holiday.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteHoliday(index)} className="text-red hover:text-red/80 text-sm font-medium">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={handleSaveSettings} className="bg-teal text-white px-8 py-3 rounded-md font-medium hover:bg-teal-dark transition-colors">Save All Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
