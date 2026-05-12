import { formatDate, formatCurrency, getOutstandingBalance } from './utils'
import { jsPDF } from 'jspdf'
import { showToast } from './toast'

function sanitizeFilename(filename) {
  return Array.from(filename, (char) => {
    const code = char.charCodeAt(0)
    if (code < 32 || '<>:"/\\|?*'.includes(char)) return '-'
    return char
  }).join('')
}

function createDetachedDocument(html) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '210mm'
  wrapper.style.backgroundColor = '#ffffff'
  wrapper.innerHTML = html
  document.body.appendChild(wrapper)
  return wrapper
}

/**
 * Generate a professional member CVC (Certificate of Verification/Credit)
 */
export function generateMemberCVC(user, loans) {
  const totalBorrowed = loans.reduce((s, l) => s + Number(l.amount), 0)
  const totalPaid = loans.reduce((s, l) => s + Number(l.amount_paid), 0)
  const totalOutstanding = loans.reduce((s, l) => s + getOutstandingBalance(l), 0)

  const activeLoanCount = loans.filter(l => l.status === 'Active' || l.status === 'Overdue').length
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Member Verification Certificate - ${user.full_name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 850px;
          margin: 0 auto;
          background: white;
          padding: 60px 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .header h1 {
          color: #1e293b;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .header p {
          color: #64748b;
          font-size: 14px;
        }
        .cert-number {
          text-align: right;
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 30px;
          font-family: 'Courier New', monospace;
        }
        .section {
          margin-bottom: 35px;
        }
        .section-title {
          background: #f1f5f9;
          color: #1e293b;
          padding: 12px 16px;
          border-left: 4px solid #2563eb;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .member-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-label {
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
        }
        .info-value {
          color: #1e293b;
          font-size: 14px;
        }
        .info-value.highlight {
          font-weight: 600;
          color: #2563eb;
        }
        .financial-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-label {
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .stat-value {
          color: #1e293b;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }
        .stat-card.borrowed .stat-value {
          color: #0ea5e9;
        }
        .stat-card.paid .stat-value {
          color: #10b981;
        }
        .stat-card.outstanding .stat-value {
          color: #f43f5e;
        }
        .stat-card.active .stat-value {
          color: #f59e0b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        tr:hover {
          background: #f8fafc;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-active {
          background: #dbeafe;
          color: #0c63e4;
        }
        .status-overdue {
          background: #fed7aa;
          color: #b45309;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 11px;
          text-align: center;
        }
        .footer-item {
          display: inline-block;
          margin: 0 20px;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            max-width: 100%;
            padding: 40px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="cert-number">CERT-${user.id.toUpperCase()}-${new Date().toISOString().split('T')[0]}</div>
        
        <div class="header">
          <h1>Member Verification Certificate</h1>
          <p>HFFP Loan Management System</p>
        </div>

        <div class="section">
          <div class="section-title">Member Information</div>
          <div class="member-info">
            <div>
              <div class="info-row">
                <div class="info-label">Member Name</div>
                <div class="info-value highlight">${user.full_name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Member ID</div>
                <div class="info-value">${user.unique_no}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone</div>
                <div class="info-value">${user.phone_number}</div>
              </div>
            </div>
            <div>
              <div class="info-row">
                <div class="info-label">Ground</div>
                <div class="info-value">${user.ground}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Total Shares</div>
                <div class="info-value">${formatCurrency(user.total_shares)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Verified On</div>
                <div class="info-value">${formatDate(new Date())}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Financial Summary</div>
          <div class="financial-summary">
            <div class="stat-card borrowed">
              <div class="stat-label">Total Borrowed</div>
              <div class="stat-value">${formatCurrency(totalBorrowed)}</div>
            </div>
            <div class="stat-card paid">
              <div class="stat-label">Total Paid</div>
              <div class="stat-value">${formatCurrency(totalPaid)}</div>
            </div>
            <div class="stat-card outstanding">
              <div class="stat-label">Outstanding</div>
              <div class="stat-value">${formatCurrency(totalOutstanding)}</div>
            </div>
            <div class="stat-card active">
              <div class="stat-label">Active Loans</div>
              <div class="stat-value">${activeLoanCount}</div>
            </div>
          </div>
        </div>

        ${loans.length > 0 ? `
        <div class="section">
          <div class="section-title">Loan History</div>
          <table>
            <thead>
              <tr>
                <th>Loan Number</th>
                <th>Amount</th>
                <th>Interest</th>
                <th>Amount Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loans.map(loan => `
                <tr>
                  <td>${loan.loan_number}</td>
                  <td>${formatCurrency(loan.amount)}</td>
                  <td>${loan.interest_rate}%</td>
                  <td>${formatCurrency(loan.amount_paid)}</td>
                  <td>${formatCurrency(getOutstandingBalance(loan))}</td>
                  <td>
                    <span class="status-badge status-${loan.status.toLowerCase()}">
                      ${loan.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <div class="footer-item">📄 Document ID: CERT-${user.id.toUpperCase()}</div>
          <div class="footer-item">📅 Generated: ${new Date().toLocaleString()}</div>
          <div class="footer-item">✓ Official Record</div>
        </div>
      </div>
    </body>
    </html>
  `
  return html
}

/**
 * Generate a professional member report
 */
export function generateMemberReport(user, loans) {
  const totalBorrowed = loans.reduce((s, l) => s + Number(l.amount), 0)
  const totalPaid = loans.reduce((s, l) => s + Number(l.amount_paid), 0)
  const totalOutstanding = loans.reduce((s, l) => s + getOutstandingBalance(l), 0)

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Member Report - ${user.full_name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #1e293b;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 50px 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .company-info h1 {
          font-size: 24px;
          margin-bottom: 5px;
          color: #2563eb;
        }
        .company-info p {
          color: #64748b;
          font-size: 13px;
        }
        .report-date {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 3px;
        }
        .member-header {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #2563eb;
        }
        .member-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #2563eb;
        }
        .member-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          font-size: 12px;
        }
        .detail {
          display: flex;
          flex-direction: column;
        }
        .detail-label {
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .detail-value {
          color: #1e293b;
          font-weight: 500;
        }
        .summary-section {
          background: #f0f9ff;
          border-left: 4px solid #0284c7;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        .summary-title {
          font-weight: 600;
          color: #0c63e4;
          margin-bottom: 15px;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .summary-item {
          background: white;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #bfdbfe;
        }
        .summary-label {
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .summary-value {
          color: #0c63e4;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }
        .loans-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
          background: #f8fafc;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-active {
          background: #dbeafe;
          color: #0c63e4;
        }
        .status-overdue {
          background: #fed7aa;
          color: #b45309;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            max-width: 100%;
            padding: 40px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>HFFP</h1>
            <p>Home Finance & Fellowship Program</p>
          </div>
          <div class="report-date">
            <div class="report-title">Member Report</div>
            <div>${formatDate(new Date())}</div>
          </div>
        </div>

        <div class="member-header">
          <div class="member-name">${user.full_name}</div>
          <div class="member-details">
            <div class="detail">
              <span class="detail-label">Member ID</span>
              <span class="detail-value">${user.unique_no}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Ground</span>
              <span class="detail-value">${user.ground}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Total Shares</span>
              <span class="detail-value">${formatCurrency(user.total_shares)}</span>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-title">Financial Overview</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Borrowed</div>
              <div class="summary-value">${formatCurrency(totalBorrowed)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Paid</div>
              <div class="summary-value" style="color: #10b981;">${formatCurrency(totalPaid)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Outstanding</div>
              <div class="summary-value" style="color: #f43f5e;">${formatCurrency(totalOutstanding)}</div>
            </div>
          </div>
        </div>

        ${loans.length > 0 ? `
        <div class="loans-section">
          <div class="section-title">Loan Details</div>
          <table>
            <thead>
              <tr>
                <th>Loan #</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loans.map(loan => `
                <tr>
                  <td><strong>${loan.loan_number}</strong></td>
                  <td>${formatCurrency(loan.amount)}</td>
                  <td>${loan.interest_rate}%</td>
                  <td>${formatCurrency(loan.amount_paid)}</td>
                  <td><strong>${formatCurrency(getOutstandingBalance(loan))}</strong></td>
                  <td>
                    <span class="status-badge status-${loan.status.toLowerCase()}">
                      ${loan.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : '<p style="color: #94a3b8; font-size: 12px; margin: 20px 0;">No loans on record.</p>'}

        <div class="footer">
          <p>This is an official report generated from the HFFP Loan Management System.</p>
          <p style="margin-top: 8px;">Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
  return html
}

/**
 * Generate a professional system-wide report
 */
export function generateSystemReport(users, loans) {
  const totalMembers = users.length
  const totalLoans = loans.length
  const totalDisbursed = loans.reduce((sum, loan) => sum + Number(loan.amount), 0)
  const totalPaid = loans.reduce((sum, loan) => sum + Number(loan.amount_paid), 0)
  const totalOutstanding = loans.reduce((sum, loan) => sum + getOutstandingBalance(loan), 0)
  const statusCounts = loans.reduce(
    (acc, loan) => {
      const status = loan.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    { Active: 0, Overdue: 0, Paid: 0 }
  )

  const userSummaries = users.map((user) => {
    const userLoans = loans.filter((loan) => loan.user_id === user.id)
    const borrowed = userLoans.reduce((sum, loan) => sum + Number(loan.amount), 0)
    const paid = userLoans.reduce((sum, loan) => sum + Number(loan.amount_paid), 0)
    const outstanding = userLoans.reduce((sum, loan) => sum + getOutstandingBalance(loan), 0)
    const active = userLoans.filter((loan) => loan.status === 'Active' || loan.status === 'Overdue').length
    return {
      name: user.full_name,
      memberId: user.unique_no,
      ground: user.ground,
      borrowed,
      paid,
      outstanding,
      active,
      loanCount: userLoans.length,
    }
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HFFP System Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          color: #1e293b;
          padding: 20px;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 2px 14px rgba(15, 23, 42, 0.08);
          padding: 40px;
          border-radius: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .brand h1 {
          font-size: 28px;
          color: #2563eb;
        }
        .brand p {
          font-size: 14px;
          color: #475569;
        }
        .report-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: right;
          min-width: 180px;
        }
        .report-meta .label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        .report-meta .value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .stat-card .label {
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .stat-card .value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }
        .stat-card .value.accent {
          color: #2563eb;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-table, .detail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .summary-table th,
        .detail-table th {
          background: #f8fafc;
          color: #475569;
          text-align: left;
          padding: 14px 12px;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-table td,
        .detail-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
        }
        .summary-table tbody tr:hover,
        .detail-table tbody tr:hover {
          background: #f8fafc;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-active {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .status-overdue {
          background: #fed7aa;
          color: #92400e;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            border-radius: 0;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">
            <h1>HFFP System Report</h1>
            <p>Complete loan and member summary for the Home Finance & Fellowship Program.</p>
          </div>
          <div class="report-meta">
            <div>
              <div class="label">Generated</div>
              <div class="value">${formatDate(new Date())}</div>
            </div>
            <div>
              <div class="label">Total Members</div>
              <div class="value">${totalMembers}</div>
            </div>
            <div>
              <div class="label">Total Loans</div>
              <div class="value">${totalLoans}</div>
            </div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div class="label">Total Disbursed</div>
            <div class="value accent">${formatCurrency(totalDisbursed)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Paid</div>
            <div class="value">${formatCurrency(totalPaid)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Outstanding Balance</div>
            <div class="value">${formatCurrency(totalOutstanding)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Active / Overdue</div>
            <div class="value">${statusCounts.Active + statusCounts.Overdue}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Loan Status Breakdown</div>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="status-badge status-active">Active</span></td>
                <td>${statusCounts.Active}</td>
              </tr>
              <tr>
                <td><span class="status-badge status-overdue">Overdue</span></td>
                <td>${statusCounts.Overdue}</td>
              </tr>
              <tr>
                <td><span class="status-badge status-paid">Paid</span></td>
                <td>${statusCounts.Paid}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Top Members</div>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Ground</th>
                <th>Loans</th>
                <th>Borrowed</th>
                <th>Paid</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              ${userSummaries
                .sort((a, b) => b.borrowed - a.borrowed)
                .slice(0, 12)
                .map(
                  (summary) => `
                <tr>
                  <td>${summary.name} (${summary.memberId})</td>
                  <td>${summary.ground || '—'}</td>
                  <td>${summary.loanCount}</td>
                  <td>${formatCurrency(summary.borrowed)}</td>
                  <td>${formatCurrency(summary.paid)}</td>
                  <td>${formatCurrency(summary.outstanding)}</td>
                </tr>
              `)
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report includes all active members and loan records from the HFFP system.</p>
          <p>Generated on ${new Date().toLocaleString()}.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Download HTML content as PDF/Document
 */
export async function downloadPDF(html, filename) {
  const safeFilename = sanitizeFilename(filename)
  const wrapper = createDetachedDocument(html)
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })

  try {
    await pdf.html(wrapper, {
      callback: (doc) => {
        doc.save(safeFilename)
      },
      x: 10,
      y: 10,
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
    })
    showToast(`PDF downloaded: ${safeFilename}`)
  } catch (error) {
    console.error('PDF download failed', error)
    showToast('PDF download failed. Please try again.')
  } finally {
    document.body.removeChild(wrapper)
  }
}

export function downloadDocument(html, filename) {
  const safeFilename = sanitizeFilename(filename)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showToast(`Document downloaded: ${safeFilename}`)
}

/**
 * Open document in print preview
 */
export function printDocument(html) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')

  if (!printWindow) {
    showToast('Print preview was blocked by the browser. Allow pop-ups and try again.')
    return
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  const triggerPrint = () => {
    printWindow.focus()
    printWindow.print()
  }

  if (printWindow.document.readyState === 'complete') {
    setTimeout(triggerPrint, 150)
  } else {
    printWindow.addEventListener('load', () => setTimeout(triggerPrint, 150), { once: true })
  }
}
