import { useState, useEffect } from "react";

function AdminDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    pendingLeaves: 0,
    pendingTimeCorrections: 0,
    totalLeaveRequests: 0,
    totalAttendanceRecords: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const users = JSON.parse(localStorage.getItem("systemUsers") || "[]");
    const employees = users.filter(
      (u) => u.role === "employee" || u.role === "manager"
    );
    const leaveRequests = JSON.parse(
      localStorage.getItem("allLeaveRequests") || "[]"
    );
    const pendingLeaves = leaveRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const timeCorrectionRequests = JSON.parse(
      localStorage.getItem("timeCorrectionRequests") || "[]"
    );
    const pendingTimeCorrections = timeCorrectionRequests.filter(
      (r) => r.status === "pending"
    ).length;

    let activeToday = 0;
    employees.forEach((emp) => {
      const activeSession = localStorage.getItem(`activeSession_${emp.name}`);
      if (activeSession) {
        const session = JSON.parse(activeSession);
        if (session.isLoggedIn) activeToday++;
      }
    });

    let totalAttendanceRecords = 0;
    employees.forEach((emp) => {
      const attendance = JSON.parse(
        localStorage.getItem(`attendance_${emp.name}`) || "[]"
      );
      totalAttendanceRecords += attendance.length;
    });

    setStats({
      totalEmployees: employees.length,
      activeToday,
      pendingLeaves,
      pendingTimeCorrections,
      totalLeaveRequests: leaveRequests.length,
      totalAttendanceRecords,
    });

    loadRecentActivity(leaveRequests, timeCorrectionRequests);
    loadTopEmployees(employees);
  };

  const loadRecentActivity = (leaveRequests, timeCorrectionRequests) => {
    const activities = [];
    leaveRequests.slice(0, 5).forEach((req) => {
      activities.push({
        id: `leave-${req.id}`,
        type: "leave",
        user: req.username,
        action: `Requested ${req.type} leave`,
        time: req.submittedDate,
        status: req.status,
      });
    });
    timeCorrectionRequests.slice(0, 5).forEach((req) => {
      activities.push({
        id: `time-${req.id}`,
        type: "timeCorrection",
        user: req.username,
        action: "Requested time correction",
        time: req.submittedDate,
        status: req.status,
      });
    });
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivity(activities.slice(0, 10));
  };

  const loadTopEmployees = (employees) => {
    const employeeStats = [];
    employees.forEach((emp) => {
      const attendance = JSON.parse(
        localStorage.getItem(`attendance_${emp.name}`) || "[]"
      );
      let totalHours = 0;
      attendance.forEach((record) => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60);
      });
      if (attendance.length > 0) {
        employeeStats.push({
          name: emp.name,
          role: emp.role,
          totalHours: totalHours.toFixed(1),
          sessions: attendance.length,
          avgHours: (totalHours / attendance.length).toFixed(1),
        });
      }
    });
    employeeStats.sort(
      (a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours)
    );
    setTopEmployees(employeeStats.slice(0, 5));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber/10 text-amber";
      case "approved":
        return "bg-green/10 text-green";
      case "rejected":
        return "bg-red/10 text-red";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Admin Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {user.username}! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-500">Total Employees</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.activeToday}</div>
            <div className="text-sm text-gray-500">Active Today</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.pendingLeaves}</div>
            <div className="text-sm text-gray-500">Pending Leaves</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.pendingTimeCorrections}</div>
            <div className="text-sm text-gray-500">Pending Corrections</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.totalLeaveRequests}</div>
            <div className="text-sm text-gray-500">Total Leave Requests</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-teal">{stats.totalAttendanceRecords}</div>
            <div className="text-sm text-gray-500">Attendance Records</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-teal mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => onNavigate("leave-approval")}
              className="relative bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Review Leaves
              </div>
              <div className="text-xs text-gray-500">
                Approve or reject leave requests
              </div>
              {stats.pendingLeaves > 0 && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {stats.pendingLeaves}
                </div>
              )}
            </button>

            <button
              onClick={() => onNavigate("time-correction-approval")}
              className="relative bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Time Corrections
              </div>
              <div className="text-xs text-gray-500">
                Review time correction requests
              </div>
              {stats.pendingTimeCorrections > 0 && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {stats.pendingTimeCorrections}
                </div>
              )}
            </button>

            <button
              onClick={() => onNavigate("users")}
              className="bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Manage Users
              </div>
              <div className="text-xs text-gray-500">
                Add, edit, or remove users
              </div>
            </button>

            <button
              onClick={() => onNavigate("employees")}
              className="bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Employee Directory
              </div>
              <div className="text-xs text-gray-500">
                View all employee records
              </div>
            </button>

            <button
              onClick={() => onNavigate("reports")}
              className="bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Reports
              </div>
              <div className="text-xs text-gray-500">
                View analytics and reports
              </div>
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className="bg-white p-5 rounded-lg shadow-sm border-2 border-transparent hover:border-teal hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
            >
              <div className="font-bold text-gray-800 text-sm mb-1">
                Settings
              </div>
              <div className="text-xs text-gray-500">
                Configure system settings
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-teal mb-4">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold">
                      {activity.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">
                        {activity.user}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {activity.action}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(activity.time)}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Employees */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-teal mb-4">
              Top Employees by Hours
            </h2>
            <div className="flex flex-col gap-3">
              {topEmployees.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No attendance data available
                </div>
              ) : (
                topEmployees.map((emp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">
                        {emp.name}
                      </div>
                      <div className="text-gray-500 text-xs">{emp.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal">
                        {emp.totalHours}h
                      </div>
                      <div className="text-gray-500 text-xs">
                        {emp.sessions} sessions
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
