import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename) // Unused

const supabaseUrl = 'https://filnbuefeauaygyepltg.supabase.co'
// Service Role Key to bypass RLS
// Service Role Key to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
// Note: The previously hardcoded key appeared valid in format but failed authentication.
// Please add SUPABASE_SERVICE_ROLE_KEY to your .env file or paste the correct key above.

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Please check your .env or script.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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

const getMonthName = (date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'January'
  return d.toLocaleString('en-US', { month: 'long' })
}

async function uploadPayments() {
  console.log('Starting upload...')

  // 1. Fetch ALL Students to map IDs
  const idMap = {}
  let from = 0
  const limit = 1000
  let more = true

  while (more) {
    const { data: students, error: sErr } = await supabase
      .from('students')
      .select('*')
      .range(from, from + limit - 1)

    if (sErr) {
      console.error('Error fetching students:', sErr)
      return
    }

    if (!students || students.length === 0) {
      more = false
      break
    }

    students.forEach((s) => {
      if (s.student_id) idMap[s.student_id.trim()] = s.id
    })

    from += limit
    console.log(`Fetched batch ending at ${from}, total so far: ${Object.keys(idMap).length}`)
  }
  console.log(`Loaded total ${Object.keys(idMap).length} students.`)

  // 2. Read JSON Data
  const jsonPath = path.resolve('payment-data.json')
  let rawData
  try {
    rawData = fs.readFileSync(jsonPath, 'utf8')
  } catch (e) {
    console.error('Could not read payment-data.json', e)
    return
  }
  const paymentData = JSON.parse(rawData)
  console.log(`Parsed ${paymentData.length} records from JSON.`)

  const paymentPayload = []
  let skipped = 0

  for (const row of paymentData) {
    const sid = row.StudentID ? row.StudentID.trim() : ''
    const uuid = idMap[sid]

    if (uuid) {
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

      let year = row.Year || new Date().getFullYear()
      if (year == 20224) year = 2024 // Fix typo

      paymentPayload.push({
        student_record_id: uuid,
        year: year,
        month: month,
        amount: amount,
        paid_at: paidAt,
        collected_by: 'a53ca623-bd1e-43c9-8e2e-6659fb5abd54', // Admin ID
      })
    } else {
      console.log(`Skipping unknown StudentID: ${sid}`)
      skipped++
    }
  }

  console.log(`Prepared ${paymentPayload.length} records. Skipped ${skipped}.`)

  // 3. Batch Insert
  const batchSize = 100
  for (let i = 0; i < paymentPayload.length; i += batchSize) {
    const batch = paymentPayload.slice(i, i + batchSize)
    const { error } = await supabase.from('payments').insert(batch)
    if (error) console.error(`Error inserting batch ${i}:`, error)
    else console.log(`Inserted batch ${i} - ${i + batch.length}`)
  }
  console.log('Done!')
}

uploadPayments()
