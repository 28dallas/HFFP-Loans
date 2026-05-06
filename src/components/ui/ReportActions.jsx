import { FileText, Download, Printer } from 'lucide-react'
import { Button } from './Button'
import { generateMemberCVC, generateMemberReport, downloadDocument, downloadPDF, printDocument } from '../lib/reportGenerator'

export function ReportActions({ user, loans, variant = 'default' }) {
  function handlePrintCVC() {
    const html = generateMemberCVC(user, loans)
    printDocument(html)
  }

  function handleDownloadCVC() {
    const html = generateMemberCVC(user, loans)
    downloadDocument(html, `${user.full_name}-CVC-${new Date().toISOString().split('T')[0]}.html`)
  }

  function handleDownloadCVCPDF() {
    const html = generateMemberCVC(user, loans)
    downloadPDF(html, `${user.full_name}-CVC-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  function handlePrintReport() {
    const html = generateMemberReport(user, loans)
    printDocument(html)
  }

  function handleDownloadReport() {
    const html = generateMemberReport(user, loans)
    downloadDocument(html, `${user.full_name}-Report-${new Date().toISOString().split('T')[0]}.html`)
  }

  function handleDownloadReportPDF() {
    const html = generateMemberReport(user, loans)
    downloadPDF(html, `${user.full_name}-Report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={handlePrintCVC}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
        >
          <Printer size={13} />
          Print CVC
        </button>
        <button
          onClick={handleDownloadCVC}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
        >
          <Download size={13} />
          Download CVC
        </button>
        <button
          onClick={handleDownloadCVCPDF}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
        >
          <FileText size={13} />
          Download CVC PDF
        </button>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
        >
          <Printer size={13} />
          Print Report
        </button>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
        >
          <Download size={13} />
          Download Report
        </button>
        <button
          onClick={handleDownloadReportPDF}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
        >
          <FileText size={13} />
          Download Report PDF
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrintCVC}
        className="gap-2"
      >
        <Printer size={13} />
        Print CVC
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadCVC}
        className="gap-2"
      >
        <Download size={13} />
        Download CVC
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadCVCPDF}
        className="gap-2"
      >
        <FileText size={13} />
        Download CVC PDF
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrintReport}
        className="gap-2"
      >
        <FileText size={13} />
        Print Report
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadReport}
        className="gap-2"
      >
        <Download size={13} />
        Download Report
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadReportPDF}
        className="gap-2"
      >
        <FileText size={13} />
        Download Report PDF
      </Button>
    </div>
  )
}
