import jsPDF from 'jspdf'
import type { FormDefinition, CollectedData } from '../types'

export function generateSummaryPDF(
  selectedForms: FormDefinition[],
  collectedData: CollectedData
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Header
  doc.setFillColor(30, 41, 59) // slate-800
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Steuererklärung 2025', margin, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Zusammenfassung der gesammelten Informationen', margin, 28)
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, 35)

  y = 55

  // Loop through selected forms
  for (const form of selectedForms) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    // Form section header
    doc.setFillColor(241, 245, 249) // slate-100
    doc.rect(margin - 3, y - 5, contentWidth + 6, 12, 'F')

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(form.name, margin, y + 3)
    y += 14

    doc.setFontSize(10)

    for (const field of form.fields) {
      if (y > 270) {
        doc.addPage()
        y = margin
      }

      const rawValue = collectedData[field.id]
      const value = rawValue === undefined || rawValue === null ? '—' : formatValue(rawValue, field.type)

      // Label
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(field.label + ':', margin, y)

      // Value
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 23, 42) // slate-900
      const labelWidth = doc.getTextWidth(field.label + ': ')
      doc.text(value, margin + labelWidth + 2, y)

      // Separator line
      doc.setDrawColor(226, 232, 240)
      doc.line(margin, y + 2, margin + contentWidth, y + 2)

      y += 9
    }

    y += 6
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Diese Zusammenfassung wurde mit dem Steuer-Assistenten erstellt. Bitte prüfen Sie alle Angaben sorgfältig.',
      margin,
      doc.internal.pageSize.getHeight() - 10
    )
    doc.text(
      `Seite ${i} von ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }

  doc.save('Steuererklarung_2025_Zusammenfassung.pdf')
}

function formatValue(value: string | number | boolean, type: string): string {
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein'
  }
  if (type === 'number' && typeof value === 'number') {
    return value.toLocaleString('de-DE') + ' €'
  }
  return String(value)
}
