import fs from 'fs'
import path from 'path'
// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

const normalizeDate = (dateStr) => {
  if (!dateStr || dateStr === '?') return null
  const s = dateStr.toString().trim()
  if (/^\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}/.test(s)) {
    const parts = s.split(/[/\-.]/)
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
  }
  if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4}/.test(s)) {
    const parts = s.split(/[/\-.]/)
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    if (p0 > 12) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    else if (p1 > 12) return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
    else return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return null
}

const normalizeTime = (timeStr) => {
  if (!timeStr || timeStr === '?') return '00:00:00'
  let t = timeStr.toString().trim()
  const isPM = /pm/i.test(t)
  const isAM = /am/i.test(t)
  t = t.replace(/(am|pm)/i, '').trim()
  const parts = t.split(':')
  let hh = parseInt(parts[0] || '0', 10)
  let mm = parseInt(parts[1] || '0', 10)
  let ss = parseInt(parts[2] || '0', 10)
  if (isPM && hh < 12) hh += 12
  if (isAM && hh === 12) hh = 0
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

const getMonthName = (dateStr) => {
  if (!dateStr) return 'January'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'January'
  return d.toLocaleString('en-US', { month: 'long' })
}

try {
  const rawData = fs.readFileSync(path.resolve('payment-data.json'), 'utf8')
  const paymentData = JSON.parse(rawData)

  let sql =
    'INSERT INTO payments (student_record_id, year, month, amount, paid_at, collected_by) VALUES \n'
  const values = []

  for (const row of paymentData) {
    const sid = row.StudentID ? row.StudentID.trim() : ''
    if (!sid) continue

    let dateInput = row.Date
    let timeInput = row.Time
    let paidAt = null

    if (dateInput && dateInput !== '?') {
      const combined = timeInput && timeInput !== '?' ? `${dateInput} ${timeInput}` : dateInput
      const d = new Date(combined)
      if (!isNaN(d.getTime())) {
        paidAt = d.toISOString()
      }
    }

    if (!paidAt && dateInput && dateInput !== '?') {
      const dateStr = normalizeDate(dateInput)
      const timeStr = normalizeTime(timeInput)
      if (dateStr) {
        const d = new Date(`${dateStr}T${timeStr}`)
        if (!isNaN(d.getTime())) paidAt = d.toISOString()
      }
    }

    if (!paidAt) paidAt = new Date().toISOString()

    let amount = 0
    if (row.Amount) {
      const cleanAmt = row.Amount.toString()
        .replace(/,/g, '')
        .replace(/[^\d.]/g, '')
      const parsed = parseFloat(cleanAmt)
      if (!isNaN(parsed)) amount = parsed
    }

    let month = row.Month
    if (!month || month.trim() === '' || month === '**') {
      month = getMonthName(paidAt)
    }
    month = month.trim()

    let year = row.Year || new Date().getFullYear()
    if (year == 20224) year = 2024

    const val = `(
        (SELECT id FROM students WHERE student_id = '${sid}' LIMIT 1),
        ${year},
        '${month}',
        ${amount},
        '${paidAt}',
        'a53ca623-bd1e-43c9-8e2e-6659fb5abd54'
    )`

    values.push(val)
  }

  sql += values.join(',\n')
  sql += ';\n'

  fs.writeFileSync(path.resolve('insert_payments.sql'), sql)
  console.log(`Generated SQL for ${values.length} records.`)
} catch (e) {
  console.error('Error:', e)
}
