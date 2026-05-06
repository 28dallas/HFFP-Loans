import { FileText, Download, Printer } from 'lucide-react'
import { Button } from './Button'
import { generateSystemReport, downloadDocument, downloadPDF, printDocument } from '../lib/reportGenerator'

export function SystemReportActions({ users = [], loans = [] }) {
  function handlePrintSystemReport() {
    const html = generateSystemReport(users, loans)
    printDocument(html)
  }

  function handleDownloadSystemReport() {
    const html = generateSystemReport(users, loans)
    downloadDocument(html, `HFFP-System-Report-${new Date().toISOString().split('T')[0]}.html`)
  }

  function handleDownloadSystemReportPDF() {
    const html = generateSystemReport(users, loans)
    downloadPDF(html, `HFFP-System-Report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={handlePrintSystemReport} className="gap-2">
        <Printer size={13} />
        Print System Report
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownloadSystemReport} className="gap-2">
        <Download size={13} />
        Download System Report
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownloadSystemReportPDF} className="gap-2">
        <FileText size={13} />
        Download PDF
      </Button>
    </div>
  )
}
