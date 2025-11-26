import { useState, useEffect } from 'react'

function Payslips({ username, userRole }) {
  const [payslips, setPayslips] = useState([])
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  useEffect(() => { generateDemoPayslips() }, [username])

  const generateDemoPayslips = () => {
    const demoPayslips = []
    const currentDate = new Date()
    const baseSalaries = { employee: 50000, manager: 75000, admin: 100000 }
    const baseSalary = baseSalaries[userRole] || 50000

    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStr = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      const basic = baseSalary
      const hra = Math.round(basic * 0.4)
      const transport = 2000
      const medical = 1500
      const bonus = i === 0 ? Math.round(basic * 0.1) : 0
      const grossSalary = basic + hra + transport + medical + bonus
      const tax = Math.round(grossSalary * 0.1)
      const providentFund = Math.round(basic * 0.12)
      const insurance = 500
      const totalDeductions = tax + providentFund + insurance
      const netSalary = grossSalary - totalDeductions

      demoPayslips.push({ id: `pay-${i}`, month: monthStr, date: month.toISOString().split('T')[0], employeeName: username, employeeRole: userRole, basic, hra, transport, medical, bonus, grossSalary, tax, providentFund, insurance, totalDeductions, netSalary, status: i === 0 ? 'pending' : 'paid' })
    }
    setPayslips(demoPayslips)
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  const downloadPayslip = (payslip) => {
    const content = `
PAYSLIP - ${payslip.month}
===============================================

Employee: ${payslip.employeeName}
Role: ${payslip.employeeRole}
Payment Date: ${payslip.date}

EARNINGS:
--------------
Basic Salary:         ${formatCurrency(payslip.basic)}
House Rent Allowance: ${formatCurrency(payslip.hra)}
Transport Allowance:  ${formatCurrency(payslip.transport)}
Medical Allowance:    ${formatCurrency(payslip.medical)}
${payslip.bonus > 0 ? `Bonus:                ${formatCurrency(payslip.bonus)}` : ''}

Gross Salary:         ${formatCurrency(payslip.grossSalary)}

DEDUCTIONS:
--------------
Income Tax:           ${formatCurrency(payslip.tax)}
Provident Fund:       ${formatCurrency(payslip.providentFund)}
Insurance:            ${formatCurrency(payslip.insurance)}

Total Deductions:     ${formatCurrency(payslip.totalDeductions)}

===============================================
NET SALARY:           ${formatCurrency(payslip.netSalary)}
===============================================

Generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip_${payslip.month.replace(' ', '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50 p-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal mb-1">Payslips</h1>
          <p className="text-gray-500">View and download your salary payslips</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payslips.map((payslip) => (
            <div key={payslip.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <span className="font-semibold text-gray-800">{payslip.month}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payslip.status === 'paid' ? 'bg-green/10 text-green' : 'bg-amber/10 text-amber'}`}>
                  {payslip.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gross Salary:</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(payslip.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deductions:</span>
                  <span className="text-red">-{formatCurrency(payslip.totalDeductions)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-800 font-semibold">Net Salary:</span>
                  <span className="text-teal font-bold">{formatCurrency(payslip.netSalary)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setSelectedPayslip(payslip)} className="flex-1 bg-teal text-white py-2 rounded-md font-medium text-sm hover:bg-teal-dark transition-colors">View Details</button>
                <button onClick={() => downloadPayslip(payslip)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-medium text-sm hover:bg-gray-200/80 transition-colors">Download</button>
              </div>
            </div>
          ))}
        </div>

        {selectedPayslip && (
          <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50" onClick={() => setSelectedPayslip(null)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-teal">Payslip Details</h2>
                  <p className="text-sm text-gray-500">{selectedPayslip.month}</p>
                </div>
                <button onClick={() => setSelectedPayslip(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Employee:</span><span className="text-gray-800 font-medium">{selectedPayslip.employeeName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Role:</span><span className="text-gray-800 capitalize">{selectedPayslip.employeeRole}</span></div>
                    <div className="flex justify-between col-span-2"><span className="text-gray-500">Payment Date:</span><span className="text-gray-800">{selectedPayslip.date}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><span>💰</span> Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span className="text-gray-800">{formatCurrency(selectedPayslip.basic)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">House Rent Allowance</span><span className="text-gray-800">{formatCurrency(selectedPayslip.hra)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Transport Allowance</span><span className="text-gray-800">{formatCurrency(selectedPayslip.transport)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Medical Allowance</span><span className="text-gray-800">{formatCurrency(selectedPayslip.medical)}</span></div>
                    {selectedPayslip.bonus > 0 && <div className="flex justify-between"><span className="text-gray-500">Bonus</span><span className="text-green">{formatCurrency(selectedPayslip.bonus)}</span></div>}
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><span className="text-gray-800">Gross Salary</span><span className="text-teal">{formatCurrency(selectedPayslip.grossSalary)}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><span>📉</span> Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Income Tax</span><span className="text-red">{formatCurrency(selectedPayslip.tax)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Provident Fund</span><span className="text-red">{formatCurrency(selectedPayslip.providentFund)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="text-red">{formatCurrency(selectedPayslip.insurance)}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><span className="text-gray-800">Total Deductions</span><span className="text-red">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                  </div>
                </div>

                <div className="bg-teal/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">NET SALARY</span>
                    <span className="text-2xl font-bold text-teal">{formatCurrency(selectedPayslip.netSalary)}</span>
                  </div>
                </div>

                <button onClick={() => downloadPayslip(selectedPayslip)} className="w-full bg-teal text-white py-3 rounded-md font-medium hover:bg-teal-dark transition-colors">Download Payslip</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payslips
