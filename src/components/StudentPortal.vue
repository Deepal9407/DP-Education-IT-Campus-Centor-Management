<template>
  <div class="row q-col-gutter-md">
    <!-- Search Section -->
    <div class="col-12">
      <q-card class="no-shadow shadow-1 border-radius-lg">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">Student Lookup</div>
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input
                v-model="portalSearchId"
                label="Enter Student ID"
                outlined
                dense
                @keyup.enter="searchStudent"
                placeholder="STU165..."
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="search"
                    @click="searchStudent"
                    :loading="portalLoading"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6" v-if="portalStudent">
              <div class="row items-center q-gutter-x-md animate-pop">
                <q-avatar color="primary" text-color="white" icon="person" size="md" />
                <div>
                  <div class="text-h6">{{ portalStudent.full_name }}</div>
                  <q-chip
                    size="sm"
                    :color="isStudentActive(portalStudent) ? 'green' : 'grey'"
                    text-color="white"
                  >
                    {{ isStudentActive(portalStudent) ? 'Active' : 'Inactive' }}
                  </q-chip>
                  <span
                    class="text-caption text-grey q-ml-sm"
                    v-if="portalStudent.last_attendance_date"
                  >
                    Last seen: {{ portalStudent.last_attendance_date }}
                  </span>
                  <div class="text-grey q-mt-xs">{{ portalStudent.student_id }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Main Portal Content (Visible if student found) -->
    <template v-if="portalStudent">
      <!-- Active Session Banner -->
      <div class="col-12" v-if="currentSession">
        <q-banner rounded class="bg-green-1 text-green-9 border-green q-mb-md">
          <template v-slot:avatar>
            <q-icon name="computer" color="green" />
          </template>
          <div class="text-h6">
            Currently Checked In at
            <span class="text-weight-bold">{{ currentSession.pc_number }}</span>
          </div>
          <div class="text-subtitle2">
            Since {{ new Date(currentSession.check_in_time).toLocaleTimeString() }}
          </div>
        </q-banner>
      </div>

      <!-- Attendance Section -->
      <div class="col-12 col-md-6">
        <q-card class="no-shadow shadow-1 border-radius-lg full-height">
          <q-card-section>
            <div class="text-h6 text-orange-9">Daily Attendance</div>
            <div class="text-caption text-grey">Manage check-in/out</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-y-md">
            <div class="row items-center justify-between">
              <span class="text-weight-bold">Date:</span>
              <q-input
                v-model="portalAttendanceDate"
                dense
                outlined
                type="date"
                style="max-width: 200px"
              />
            </div>

            <!-- WhatsApp Mode Selection -->
            <div class="q-my-sm text-center bg-grey-2 q-pa-sm rounded-borders">
              <span class="text-caption q-mr-sm text-weight-bold">Message via:</span>
              <q-btn-toggle
                v-model="waMode"
                push
                glossy
                toggle-color="green"
                :options="[
                  { label: 'Web', value: 'web', icon: 'public' },
                  { label: 'App', value: 'app', icon: 'desktop_windows' },
                ]"
                size="sm"
                dense
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-btn
                  color="positive"
                  class="full-width"
                  label="Check-In"
                  icon="login"
                  size="lg"
                  @click="handlePortalCheckIn"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="negative"
                  class="full-width"
                  label="Check-Out"
                  icon="logout"
                  size="lg"
                  outline
                  @click="handlePortalCheckOut"
                />
              </div>
            </div>

            <!-- Recent History -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Recent History</div>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th class="text-left">Date</th>
                    <th class="text-center">PC</th>
                    <th class="text-center">In</th>
                    <th class="text-center">Out</th>
                    <th class="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="att in portalAttendanceList" :key="att.id">
                    <td class="text-left">{{ att.date }}</td>
                    <td class="text-center">
                      <q-badge v-if="att.pc_number" color="purple" text-color="white">
                        {{ att.pc_number }}
                      </q-badge>
                      <span v-else>-</span>
                    </td>
                    <td class="text-center">
                      {{
                        att.check_in_time
                          ? new Date(att.check_in_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'
                      }}
                    </td>
                    <td class="text-center">
                      {{
                        att.check_out_time
                          ? new Date(att.check_out_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'
                      }}
                    </td>
                    <td class="text-right">
                      <q-badge color="green" v-if="att.check_out_time">Completed</q-badge>
                      <q-badge color="orange" v-else>Active</q-badge>
                    </td>
                  </tr>
                  <tr v-if="portalAttendanceList.length === 0">
                    <td colspan="4" class="text-center text-grey">No recent records</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Financial Section -->
      <div class="col-12 col-md-6">
        <q-card class="no-shadow shadow-1 border-radius-lg full-height">
          <q-card-section>
            <div class="text-h6 text-purple-9">Financial Management</div>
            <div class="text-caption text-grey">Record fees and payments</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-y-md">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-input
                  v-model="portalPaymentForm.year"
                  label="Year"
                  outlined
                  dense
                  type="number"
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="portalPaymentForm.month"
                  :options="[
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                    'Anniversary',
                  ]"
                  label="Month"
                  outlined
                  dense
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="portalPaymentForm.amount"
                  label="Amount"
                  outlined
                  dense
                  type="number"
                  prefix="Rs."
                />
              </div>
            </div>
            <q-btn
              label="Record Payment"
              color="purple"
              class="full-width"
              unelevated
              icon="payments"
              @click="handlePortalPayment"
            />

            <!-- Payment History -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Payment History</div>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr>
                    <th class="text-left">Month/Year</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Date Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pay in portalPaymentList" :key="pay.id">
                    <td class="text-left">{{ pay.month }} {{ pay.year }}</td>
                    <td class="text-right">Rs. {{ pay.amount }}</td>
                    <td class="text-right">
                      {{ new Date(pay.paid_at).toLocaleDateString() }}
                    </td>
                  </tr>
                  <tr v-if="portalPaymentList.length === 0">
                    <td colspan="3" class="text-center text-grey">No records found</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from 'src/boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State
const portalSearchId = ref('STU165')
const portalStudent = ref(null)
const portalLoading = ref(false)
const portalAttendanceDate = ref(new Date().toLocaleDateString('en-CA'))
const portalAttendanceList = ref([])
const portalPaymentList = ref([])
const waMode = ref('web')
const portalPaymentForm = ref({
  year: new Date().getFullYear(),
  month: new Date().toLocaleString('default', { month: 'long' }),
  amount: '',
})

// Computed
const currentSession = computed(() => {
  return portalAttendanceList.value.find((a) => !a.check_out_time)
})

// Utility
const isStudentActive = (student) => {
  if (!student?.last_attendance_date) return false
  const last = new Date(student.last_attendance_date)
  const today = new Date()
  const diffTime = Math.abs(today - last)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30
}

// Actions
const searchStudent = async () => {
  if (!portalSearchId.value) return

  portalLoading.value = true
  portalStudent.value = null
  portalAttendanceList.value = []
  portalPaymentList.value = []

  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', portalSearchId.value)
      .maybeSingle()

    if (studentError || !student) {
      $q.notify({ type: 'warning', message: 'Student not found' })
      return
    }

    portalStudent.value = student

    // Fetch Attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_record_id', student.id)
      .order('date', { ascending: false })
      .limit(10)

    portalAttendanceList.value = attendance || []

    // Fetch Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('student_record_id', student.id)
      .order('paid_at', { ascending: false })
      .limit(10)

    portalPaymentList.value = payments || []
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error searching student' })
  } finally {
    portalLoading.value = false
  }
}

const handlePortalCheckIn = async () => {
  if (!portalStudent.value) return

  const studentForWa = { ...portalStudent.value }
  const waNumber = studentForWa.whatsapp_guardian || studentForWa.whatsapp_student

  if (!waNumber) console.warn('No WhatsApp number found')

  let waWindow = null

  if (waNumber) {
    waWindow = window.open('', '_blank')
    if (waWindow) {
      waWindow.document.write(
        '<html><head><title>Redirecting...</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Processing Check-in...</h2><p>Please wait while we connect to WhatsApp.</p></body></html>',
      )
    } else {
      $q.notify({
        type: 'warning',
        message: 'Popup blocked! Please allow popups.',
        timeout: 5000,
      })
    }
  }

  try {
    // Check for Active Check-ins (Capacity & Availability)
    const { data: activeCheckins, error: checkinError } = await supabase
      .from('attendance')
      .select('pc_number')
      .is('check_out_time', null)

    if (checkinError) throw checkinError

    // Check for PC Issues
    const { data: issues, error: issueError } = await supabase
      .from('pc_issues')
      .select('pc_number')
      .neq('status', 'Resolved')

    if (issueError) throw issueError

    const occupiedPCs = new Set(activeCheckins.map((r) => r.pc_number).filter(Boolean))
    const brokenPCs = new Set(issues.map((r) => r.pc_number).filter(Boolean))

    let assignedPC = null
    const maxPCs = 21

    for (let i = 1; i <= maxPCs; i++) {
      const pcId = `PC-${String(i).padStart(2, '0')}`
      if (!occupiedPCs.has(pcId) && !brokenPCs.has(pcId)) {
        assignedPC = pcId
        break
      }
    }

    if (!assignedPC) {
      if (waWindow) waWindow.close()
      $q.notify({
        type: 'negative',
        message: 'All PCs are currently occupied or unavailable.',
        timeout: 5000,
      })
      return
    }

    // Proceed with Check-in
    const { error } = await supabase.from('attendance').insert([
      {
        student_record_id: portalStudent.value.id,
        date: portalAttendanceDate.value,
        check_in_time: new Date().toISOString(),
        pc_number: assignedPC,
      },
    ])
    if (error) throw error

    $q.notify({
      type: 'positive',
      message: `Checked In Successfully! Assigned to ${assignedPC}`,
      icon: 'computer',
      timeout: 5000,
    })

    if (portalStudent.value) {
      portalStudent.value.last_attendance_date = portalAttendanceDate.value
    }

    // WhatsApp Redirect
    if (waWindow) {
      if (waNumber) {
        let phone = waNumber.replace(/\D/g, '')
        if (phone.length === 9) phone = '94' + phone
        else if (phone.length === 10 && phone.startsWith('0')) phone = '94' + phone.substring(1)

        const timeStr = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const text = `DP IT CAMPUS: Student ${studentForWa.full_name} (${studentForWa.student_id}) reached the center at ${timeStr}. Allocated PC: ${assignedPC}.`

        let url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
        if (waMode.value === 'app') {
          url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`
        }

        if (waWindow && !waWindow.closed) {
          waWindow.document.body.innerHTML = `
            <div style="font-family:sans-serif;text-align:center;padding:40px;">
              <h2>Check-in Successful!</h2>
              <p>Redirecting to WhatsApp...</p>
              <a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#25D366;color:white;text-decoration:none;border-radius:24px;font-weight:bold;margin-top:20px;">Open WhatsApp Now</a>
            </div>
          `
          setTimeout(() => {
            waWindow.location.href = url
          }, 500)
        }
      } else {
        waWindow.close()
      }
    }

    setTimeout(() => {
      searchStudent()
    }, 1000)
  } catch (err) {
    if (waWindow) waWindow.close()
    console.error(err)
    $q.notify({ type: 'negative', message: 'Check-in failed: ' + err.message })
  }
}

const handlePortalCheckOut = async () => {
  if (!portalStudent.value) return
  try {
    const { data: records } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_record_id', portalStudent.value.id)
      .eq('date', portalAttendanceDate.value)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)

    if (records && records.length > 0) {
      const { error } = await supabase
        .from('attendance')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', records[0].id)

      if (error) throw error
      $q.notify({ type: 'positive', message: 'Checked Out Successfully' })
      searchStudent()
    } else {
      $q.notify({ type: 'warning', message: 'No active check-in found for today' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Check-out failed' })
  }
}

const handlePortalPayment = async () => {
  if (!portalStudent.value || !portalPaymentForm.value.amount) return
  try {
    const { error } = await supabase.from('payments').insert([
      {
        student_record_id: portalStudent.value.id,
        year: portalPaymentForm.value.year,
        month: portalPaymentForm.value.month,
        amount: portalPaymentForm.value.amount,
        paid_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
    $q.notify({ type: 'positive', message: 'Payment recorded' })
    portalPaymentForm.value.amount = ''
    searchStudent()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Payment failed' })
  }
}
</script>

<style scoped>
.border-radius-lg {
  border-radius: 16px;
}
</style>
