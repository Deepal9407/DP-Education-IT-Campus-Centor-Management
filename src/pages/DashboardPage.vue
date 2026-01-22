<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h4 class="text-weight-bold q-my-none text-primary">
          {{ profile?.role === 'admin' ? 'Super Admin Dashboard' : 'My Dashboard' }}
        </h4>
        <p class="text-grey-7 q-my-none">
          Welcome back, {{ profile?.role === 'admin' ? 'Deepal' : 'User' }}
        </p>
      </div>
      <div class="text-right">
        <q-btn
          color="white"
          text-color="primary"
          icon="event"
          :label="new Date().toLocaleDateString()"
          unelevated
          class="shadow-1"
        />
      </div>
    </div>

    <!-- Debug Info (Toggleable) -->
    <q-expansion-item
      v-if="profile?.role === 'admin'"
      dense
      dense-toggle
      expand-separator
      icon="bug_report"
      label="Dev Debug Info"
      class="q-mb-md bg-white rounded-borders shadow-1"
    >
      <div class="q-pa-md text-caption">
        <div>User ID: {{ userId }}</div>
        <div>Role: {{ profile?.role }}</div>
        <div>Status: {{ profile?.status }}</div>
      </div>
    </q-expansion-item>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else>
      <!-- Super Admin View -->
      <div v-if="profile?.role === 'admin'">
        <!-- Top Stats Cards (Real-time Analytics) -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-3">
            <q-card class="no-shadow border-radius-lg bg-blue-7 text-white">
              <q-card-section>
                <div class="text-subtitle2 text-blue-2">Today's Collection</div>
                <div class="text-h4 text-weight-bold q-mt-sm">
                  LKR {{ todaysCollection.toLocaleString() }}
                </div>
                <div class="row items-center q-mt-sm">
                  <q-icon name="trending_up" size="xs" />
                  <span class="text-caption q-ml-xs">Updated just now</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="no-shadow border-radius-lg bg-deep-purple-7 text-white">
              <q-card-section>
                <div class="text-subtitle2 text-deep-purple-2">Active Students</div>
                <div class="text-h4 text-weight-bold q-mt-sm">{{ activeStudentsCount }}</div>
                <div class="row items-center q-mt-sm">
                  <q-icon name="person_add" size="xs" />
                  <span class="text-caption q-ml-xs">Total: {{ totalStudentsCount }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="no-shadow border-radius-lg bg-orange-8 text-white">
              <q-card-section>
                <div class="text-subtitle2 text-orange-2">Total Branches</div>
                <div class="text-h4 text-weight-bold q-mt-sm">5</div>
                <div class="row items-center q-mt-sm">
                  <q-icon name="store" size="xs" />
                  <span class="text-caption q-ml-xs">All systems operational</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="no-shadow border-radius-lg bg-green-7 text-white">
              <q-card-section>
                <div class="text-subtitle2 text-green-2">Checked-in Now (Live)</div>
                <div class="text-h4 text-weight-bold q-mt-sm">{{ liveAttendanceCount }}</div>
                <div class="row items-center q-mt-sm">
                  <q-icon name="schedule" size="xs" />
                  <span class="text-caption q-ml-xs">Active sessions running</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Main Content Area -->
        <q-card class="no-shadow border-radius-lg">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="users" icon="group" label="User & Staff" />
            <q-tab name="finance" icon="payments" label="Finance" />
            <q-tab name="academic" icon="school" label="Academic" />
            <q-tab name="analytics" icon="analytics" label="Analytics & Logs" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <!-- RBAC & TEAM TAB -->
            <q-tab-panel name="users" class="q-pa-md">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-primary">Team Management & Access Control</div>
                <q-btn
                  color="primary"
                  icon="person_add"
                  label="Add New User"
                  unelevated
                  size="sm"
                  @click="newUserDialog = true"
                />
              </div>

              <!-- Team Table -->
              <q-table
                :rows="teamMembers"
                :columns="columns"
                row-key="id"
                flat
                bordered
                :loading="loadingTeam"
              >
                <!-- Role Column with Edit -->
                <template v-slot:body-cell-role="props">
                  <q-td :props="props">
                    <q-select
                      v-model="props.row.role"
                      :options="['admin', 'sub_admin', 'staff', 'teacher', 'student']"
                      dense
                      borderless
                      emit-value
                      map-options
                      @update:model-value="(val) => updateRole(props.row.id, val)"
                    >
                      <template v-slot:selected>
                        <q-chip dense :color="getRoleColor(props.row.role)" text-color="white">
                          {{ getRoleLabel(props.row.role) }}
                        </q-chip>
                      </template>
                    </q-select>
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      :color="getStatusColor(props.row.status)"
                      text-color="white"
                      size="sm"
                      class="text-weight-bold"
                    >
                      {{ props.row.status.toUpperCase() }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                      color="indigo"
                      icon="vpn_key"
                      label="Permissions"
                      size="sm"
                      unelevated
                      @click="openPermissionsDialog(props.row)"
                    />
                    <!-- Status Actions -->
                    <q-btn
                      v-if="props.row.status === 'pending'"
                      color="positive"
                      round
                      dense
                      flat
                      icon="check_circle"
                      @click="updateStatus(props.row.id, 'active')"
                    >
                      <q-tooltip>Approve</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'active'"
                      color="negative"
                      round
                      dense
                      flat
                      icon="block"
                      @click="updateStatus(props.row.id, 'rejected')"
                    >
                      <q-tooltip>Suspend</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'rejected'"
                      color="positive"
                      round
                      dense
                      flat
                      icon="restore"
                      @click="updateStatus(props.row.id, 'active')"
                    >
                      <q-tooltip>Activate</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-tab-panel>

            <!-- FINANCE TAB -->
            <q-tab-panel name="finance">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card bordered flat>
                    <q-card-section class="row justify-between items-center">
                      <div class="text-h6">Income & Payments</div>
                      <div>
                        <input
                          type="file"
                          ref="paymentFileInputRef"
                          accept=".csv"
                          class="hidden"
                          @change="handlePaymentFileUpload"
                        />
                        <q-btn
                          label="Import Payments CSV"
                          color="green"
                          icon="upload_file"
                          size="sm"
                          @click="triggerPaymentUpload"
                          :loading="loadingBulkPayments"
                        />
                      </div>
                    </q-card-section>
                    <q-card-section class="flex flex-center" style="height: 200px">
                      <div class="text-center">
                        <q-icon name="cloud_upload" size="3em" color="grey-4" />
                        <div class="text-grey q-mt-sm">Upload Payment Sheet</div>
                        <div class="text-caption text-grey-6">
                          Columns: StudentID, Year, Month, Amount, Date, Time
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card bordered flat>
                    <q-card-section>
                      <div class="text-h6">Teacher Commissions</div>
                    </q-card-section>
                    <q-list separator>
                      <q-item v-for="n in 3" :key="n">
                        <q-item-section>
                          <q-item-label>Physics Class - Grade 12</q-item-label>
                          <q-item-label caption>Commission Due: LKR 15,000</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn color="primary" flat label="Pay Now" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- ACADEMIC TAB -->
            <q-tab-panel name="academic">
              <div class="row q-gutter-md">
                <q-card
                  class="col-12 col-md-3 bg-teal-1 text-center cursor-pointer hover-card"
                  @click="adminAddStudentOpen = true"
                >
                  <q-card-section>
                    <q-icon name="person_add" size="xl" color="teal" />
                    <div class="text-h6 q-mt-sm">Register Student</div>
                    <div class="text-caption">Add new student to database</div>
                  </q-card-section>
                </q-card>
                <q-card class="col-12 col-md-3 bg-cyan-1 text-center cursor-pointer hover-card">
                  <q-card-section>
                    <q-icon name="book" size="xl" color="cyan" />
                    <div class="text-h6 q-mt-sm">Subjects</div>
                    <div class="text-caption">Add courses & syllabi</div>
                  </q-card-section>
                </q-card>
                <q-card
                  class="col-12 col-md-3 bg-indigo-1 text-center cursor-pointer hover-card"
                  @click="adminPortalOpen = true"
                >
                  <q-card-section>
                    <q-icon name="fact_check" size="xl" color="indigo" />
                    <div class="text-h6 q-mt-sm">Attendance & Portal</div>
                    <div class="text-caption">Check-in students & manage</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Admin Add Student Dialog -->
              <q-dialog v-model="adminAddStudentOpen">
                <q-card style="min-width: 600px">
                  <q-card-section>
                    <div class="text-h6">Register New Student</div>
                  </q-card-section>
                  <q-card-section>
                    <q-form @submit="handleAddStudent" class="q-gutter-md">
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.student_id"
                            label="Student ID *"
                            outlined
                            dense
                            placeholder="ST-2024-001"
                            :rules="[(val) => !!val || 'Field is required']"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.full_name"
                            label="Full Name *"
                            outlined
                            dense
                            :rules="[(val) => !!val || 'Field is required']"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="studentForm.gender"
                            :options="['Male', 'Female']"
                            label="Gender"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.dob"
                            label="Date of Birth"
                            outlined
                            dense
                            type="date"
                            stack-label
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.whatsapp_student"
                            label="WhatsApp (Student)"
                            outlined
                            dense
                            mask="##########"
                            hint="10 digits"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.guardian_name"
                            label="Guardian Name"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.whatsapp_guardian"
                            label="WhatsApp (Guardian)"
                            outlined
                            dense
                            mask="##########"
                            hint="10 digits"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.daham_pasala"
                            label="Daham Pasala"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.gn_division"
                            label="GN Division"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="studentForm.status"
                            :options="['Active', 'Inactive', 'Pending']"
                            label="Status"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="studentForm.submission_date"
                            label="Submission Date"
                            outlined
                            dense
                            type="date"
                            stack-label
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model="studentForm.address"
                            label="Address"
                            outlined
                            dense
                            type="textarea"
                            rows="3"
                          />
                        </div>
                      </div>
                      <div class="row justify-end q-mt-md">
                        <q-btn flat label="Cancel" color="primary" v-close-popup />
                        <q-btn
                          label="Register"
                          type="submit"
                          color="primary"
                          unelevated
                          :loading="loadingStudent"
                        />
                      </div>
                    </q-form>
                  </q-card-section>
                </q-card>
              </q-dialog>

              <!-- Admin Student Portal Dialog -->
              <q-dialog v-model="adminPortalOpen" full-width>
                <q-card>
                  <q-toolbar class="bg-primary text-white">
                    <q-toolbar-title>Student Check-in Portal</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                  </q-toolbar>
                  <q-card-section class="q-pa-md">
                    <StudentPortal />
                  </q-card-section>
                </q-card>
              </q-dialog>
            </q-tab-panel>

            <!-- ANALYTICS TAB -->
            <q-tab-panel name="analytics">
              <div class="text-h6 text-primary q-mb-md">System Logs (Security)</div>
              <q-list bordered class="rounded-borders">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="security" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Admin Login (Deepal)</q-item-label>
                    <q-item-label caption>IP: 192.168.1.1 - Success</q-item-label>
                  </q-item-section>
                  <q-item-section side top> 1 min ago </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="person_add" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>New Student Registration</q-item-label>
                    <q-item-label caption>ID: STU-2024-001</q-item-label>
                  </q-item-section>
                  <q-item-section side top> 15 mins ago </q-item-section>
                </q-item>
              </q-list>

              <div class="q-mt-xl">
                <div class="text-h6 text-primary q-mb-md">Branch Management</div>
                <p>Manage all 5 branches from this central console.</p>
                <q-btn color="primary" label="Manage Branches" unelevated />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <!-- Receptionist / Staff Dashboard (Cyan Theme) -->
      <div v-else-if="profile?.role === 'staff' || profile?.role === 'sub_admin'">
        <!-- Top Stats -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-4">
            <q-card class="no-shadow border-radius-lg bg-cyan-1 text-cyan-9">
              <q-card-section>
                <div class="text-subtitle2">Checked-in Now (Live)</div>
                <div class="text-h4 text-weight-bold q-mt-sm">{{ liveAttendanceCount }}</div>
                <div class="text-caption">Total Today: {{ todaysAttendanceCount }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card class="no-shadow border-radius-lg bg-teal-1 text-teal-9">
              <q-card-section>
                <div class="text-subtitle2">Daily Cash Summary</div>
                <div class="text-h4 text-weight-bold q-mt-sm">
                  LKR {{ todaysCollection.toLocaleString() }}
                </div>
                <div class="text-caption">Recorded Payments</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card class="no-shadow border-radius-lg bg-orange-1 text-orange-9">
              <q-card-section>
                <div class="text-subtitle2">New Registrations</div>
                <div class="text-h4 text-weight-bold q-mt-sm">{{ todaysNewStudents }}</div>
                <div class="text-caption">Added today</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <!-- Quick Payment Portal -->
          <div class="col-12 col-md-8">
            <q-card class="no-shadow border-radius-lg bordered">
              <q-card-section>
                <div class="text-h6 text-cyan-9">
                  <q-icon name="payments" class="q-mr-sm" />Quick Payment Portal
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-gutter-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input
                      outlined
                      dense
                      label="Student ID / Name"
                      placeholder="Search student..."
                      v-model="searchText"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select
                      outlined
                      dense
                      v-model="paymentType"
                      :options="['Monthly Fee', 'Exam Fee', 'Registration']"
                      label="Type"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      outlined
                      dense
                      v-model="amount"
                      label="Amount"
                      type="number"
                      prefix="LKR"
                    />
                  </div>
                </div>
                <div class="text-right">
                  <q-btn
                    color="cyan-8"
                    icon="print"
                    label="Process & Print Receipt"
                    unelevated
                    size="md"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Notifications -->
          <div class="col-12 col-md-4">
            <q-card class="no-shadow border-radius-lg bordered" style="height: 100%">
              <q-card-section>
                <div class="text-h6 text-grey-8">Notifications</div>
              </q-card-section>
              <q-list separator>
                <q-item clickable v-ripple>
                  <q-item-section avatar><q-icon name="cake" color="pink" /></q-item-section>
                  <q-item-section>
                    <q-item-label>Dasun's Birthday</q-item-label>
                    <q-item-label caption>Grade 11 - Today</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section avatar><q-icon name="warning" color="red" /></q-item-section>
                  <q-item-section>
                    <q-item-label>Late Fees: 5 Students</q-item-label>
                    <q-item-label caption>Physics Batch A</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Teacher Dashboard (Pro Version) -->
      <div v-else-if="profile?.role === 'teacher'">
        <div class="row">
          <!-- Sidebar -->
          <div
            class="col-auto q-pr-md"
            style="width: 250px; border-right: 1px solid #ddd; min-height: 80vh"
          >
            <q-list padding class="text-grey-8">
              <q-item
                clickable
                v-ripple
                :active="activeView === 'dashboard'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'dashboard'"
              >
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section class="text-weight-bold">Dashboard</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'add_student'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'add_student'"
              >
                <q-item-section avatar>
                  <q-icon name="person_add" />
                </q-item-section>
                <q-item-section>Add Student</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'student_portal'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'student_portal'"
              >
                <q-item-section avatar>
                  <q-icon name="search" />
                </q-item-section>
                <q-item-section>Student Portal</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'all_students'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'all_students'"
              >
                <q-item-section avatar>
                  <q-icon name="list" />
                </q-item-section>
                <q-item-section>All Students</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'checked_in'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'checked_in'"
              >
                <q-item-section avatar>
                  <q-icon name="assignment_turned_in" />
                </q-item-section>
                <q-item-section>Checked-in List</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'pc_management'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'pc_management'"
              >
                <q-item-section avatar>
                  <q-icon name="computer" />
                </q-item-section>
                <q-item-section>PC Management</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'monthly_expenses'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'monthly_expenses'"
              >
                <q-item-section avatar>
                  <q-icon name="attach_money" />
                </q-item-section>
                <q-item-section>Monthly Expenses</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                :active="activeView === 'reports'"
                active-class="bg-red-8 text-white rounded-borders"
                class="q-mb-sm rounded-borders"
                @click="activeView = 'reports'"
              >
                <q-item-section avatar>
                  <q-icon name="trending_up" />
                </q-item-section>
                <q-item-section>Reports</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Main Content Area -->
          <div class="col full-width q-pl-md">
            <!-- Custom Dashboard Header -->
            <div
              class="bg-white q-pa-sm rounded-borders shadow-1 row items-center justify-between q-mb-lg"
            >
              <div class="row items-center q-gutter-x-md">
                <q-avatar size="32px" color="primary" text-color="white" icon="person" />
                <div class="text-subtitle2 text-grey-8">
                  Logged in: {{ profile?.email }} (Teacher)
                </div>
              </div>
              <div class="row items-center q-gutter-x-lg text-grey-8 text-weight-bold">
                <div>
                  <q-icon name="event" class="q-mr-sm" />{{ new Date().toLocaleDateString() }}
                </div>
                <div>
                  <q-icon name="schedule" class="q-mr-sm" />{{
                    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }}
                </div>
              </div>
              <q-btn
                color="negative"
                label="Logout"
                size="sm"
                icon="logout"
                unelevated
                @click="handleLogout"
              />
            </div>

            <!-- VIEW: DASHBOARD (TEACHER) -->
            <div v-if="activeView === 'dashboard'">
              <div class="row q-col-gutter-md q-mb-lg">
                <!-- Action Cards: Register, Attendance, Reports (Top) -->
                <div class="col-12 col-md-4">
                  <q-card
                    class="bg-teal-1 text-center cursor-pointer hover-card full-height"
                    @click="activeView = 'add_student'"
                  >
                    <q-card-section>
                      <q-icon name="person_add" size="xl" color="teal" />
                      <div class="text-h6 q-mt-sm">Register Student</div>
                      <div class="text-caption">Add new student to database</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card
                    class="bg-indigo-1 text-center cursor-pointer hover-card full-height"
                    @click="activeView = 'checked_in'"
                  >
                    <q-card-section>
                      <q-icon name="fact_check" size="xl" color="indigo" />
                      <div class="text-h6 q-mt-sm">Attendance List</div>
                      <div class="text-caption">View checked-in students</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card
                    class="bg-orange-1 text-center cursor-pointer hover-card full-height"
                    @click="activeView = 'reports'"
                  >
                    <q-card-section>
                      <q-icon name="assessment" size="xl" color="orange" />
                      <div class="text-h6 q-mt-sm">Reports</div>
                      <div class="text-caption">View financial reports</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Stats Cards (Bottom) -->
              <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-3">
                  <q-card class="no-shadow border-radius-lg bg-blue-1 text-blue-9 full-height">
                    <q-card-section>
                      <div class="text-subtitle2 text-uppercase">Total Students</div>
                      <div class="text-h4 text-weight-bold q-mt-sm">{{ totalStudentsCount }}</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card class="no-shadow border-radius-lg bg-green-1 text-green-9 full-height">
                    <q-card-section>
                      <div class="text-subtitle2 text-uppercase">Active Students</div>
                      <div class="text-h4 text-weight-bold q-mt-sm">{{ activeStudentsCount }}</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card class="no-shadow border-radius-lg bg-pink-1 text-red full-height">
                    <q-card-section>
                      <div class="text-subtitle2 text-uppercase">Checked-in Now (Live)</div>
                      <div
                        class="text-h4 text-weight-bold q-mt-sm truncate-text"
                        :title="liveAttendanceCount"
                      >
                        {{ liveAttendanceCount }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card class="no-shadow border-radius-lg bg-grey-1 text-grey-8 full-height">
                    <q-card-section>
                      <div class="text-subtitle2 text-uppercase">Today's Attendance</div>
                      <div class="text-h4 text-weight-bold q-mt-sm">
                        {{ todaysAttendanceCount }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- VIEW: ADD STUDENT -->
            <div v-if="activeView === 'add_student'">
              <q-card class="no-shadow shadow-1 border-radius-lg">
                <q-card-section class="row items-center justify-between">
                  <div>
                    <div class="text-h6 text-primary">Student Registration</div>
                    <div class="text-caption text-grey">
                      Add a new student manually or import from CSV
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref="fileInputRef"
                      accept=".csv"
                      class="hidden"
                      @change="handleFileUpload"
                    />
                    <q-btn
                      label="Import from CSV"
                      color="green"
                      icon="upload_file"
                      outline
                      :loading="loadingBulk"
                      @click="triggerFileUpload"
                    />
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-form @submit="handleAddStudent" class="q-gutter-md">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.student_id"
                          label="Student ID *"
                          outlined
                          dense
                          placeholder="ST-2024-001"
                          :rules="[(val) => !!val || 'Field is required']"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.full_name"
                          label="Full Name *"
                          outlined
                          dense
                          :rules="[(val) => !!val || 'Field is required']"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="studentForm.gender"
                          :options="['Male', 'Female']"
                          label="Gender"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.dob"
                          label="Date of Birth"
                          outlined
                          dense
                          type="date"
                          stack-label
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.whatsapp_student"
                          label="WhatsApp (Student)"
                          outlined
                          dense
                          mask="##########"
                          hint="10 digits"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.guardian_name"
                          label="Guardian Name"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.whatsapp_guardian"
                          label="WhatsApp (Guardian)"
                          outlined
                          dense
                          mask="##########"
                          hint="10 digits"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.daham_pasala"
                          label="Daham Pasala"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.gn_division"
                          label="GN Division"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="studentForm.status"
                          :options="['Active', 'Inactive', 'Pending']"
                          label="Status"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="studentForm.submission_date"
                          label="Submission Date"
                          outlined
                          dense
                          type="date"
                          stack-label
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="studentForm.address"
                          label="Address"
                          outlined
                          dense
                          type="textarea"
                          rows="3"
                        />
                      </div>
                    </div>
                    <div class="row justify-end q-mt-md">
                      <q-btn
                        label="Register Student"
                        type="submit"
                        color="primary"
                        unelevated
                        :loading="loadingStudent"
                      />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>
            </div>

            <!-- VIEW: PLACEHOLDERS -->
            <!-- VIEW: STUDENT PORTAL -->
            <div v-if="activeView === 'student_portal'">
              <StudentPortal />
            </div>
            <div v-if="activeView === 'all_students'">
              <q-card class="no-shadow shadow-1 border-radius-lg">
                <q-card-section class="row items-center justify-between">
                  <div class="text-h6 text-primary">Student Directory</div>
                  <q-btn
                    icon="refresh"
                    flat
                    round
                    dense
                    color="primary"
                    @click="fetchStudents"
                    :loading="loadingStudents"
                  />
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="studentsList"
                    :columns="studentColumns"
                    row-key="id"
                    flat
                    bordered
                    :filter="studentSearch"
                    :loading="loadingStudents"
                  >
                    <template v-slot:top-right>
                      <q-input
                        borderless
                        dense
                        debounce="300"
                        v-model="studentSearch"
                        placeholder="Search"
                      >
                        <template v-slot:append>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </template>

                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-badge
                          :color="props.value === 'Active' ? 'green' : 'grey'"
                          :label="props.value"
                        />
                      </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn icon="visibility" color="blue" flat round dense size="sm" />
                        <q-btn icon="edit" color="orange" flat round dense size="sm" />
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
            <!-- VIEW: CHECKED-IN LIST -->
            <div v-if="activeView === 'checked_in'">
              <q-card class="no-shadow shadow-1 border-radius-lg">
                <q-card-section class="row justify-between items-center q-pb-none">
                  <div class="text-h6 text-primary">Checked-in List</div>
                  <div class="row q-gutter-sm">
                    <input
                      type="file"
                      ref="attendanceFileInputRef"
                      accept=".csv"
                      class="hidden"
                      @change="handleAttendanceFileUpload"
                    />
                    <q-btn
                      label="Import CSV"
                      color="green"
                      icon="upload_file"
                      size="sm"
                      @click="triggerAttendanceUpload"
                      :loading="loadingBulkAttendance"
                    />
                    <q-btn
                      label="Check-Out All"
                      color="negative"
                      icon="logout"
                      size="sm"
                      @click="confirmCheckOutAll"
                      :disable="checkedInStudents.length === 0"
                    />
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="checkedInStudents"
                    :columns="checkedInColumns"
                    row-key="id"
                    :loading="checkedInLoading"
                    class="no-shadow"
                    flat
                    bordered
                  >
                    <template v-slot:no-data>
                      <div class="full-width row flex-center text-grey q-pa-md">
                        <q-icon name="assignment_turned_in" size="2em" class="q-mr-sm" />
                        <span>No students currently checked in</span>
                      </div>
                    </template>
                    <template v-slot:body-cell-action="props">
                      <q-td :props="props">
                        <q-btn
                          label="Check Out"
                          size="sm"
                          color="warning"
                          text-color="black"
                          unelevated
                          @click="handleCheckOut(props.row)"
                        />
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>

              <!-- Today's Activity Log -->
              <q-card class="no-shadow shadow-1 border-radius-lg q-mt-md">
                <q-card-section>
                  <div class="text-h6 text-purple-9">Today's Activity Log</div>
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="dailyHistory"
                    :columns="dailyHistoryColumns"
                    row-key="id"
                    :loading="checkedInLoading"
                    class="no-shadow"
                    flat
                    bordered
                    dense
                  >
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-badge v-if="props.row.check_out_time" color="green" label="Completed" />
                        <q-badge v-else color="orange" label="Active" />
                      </q-td>
                    </template>
                    <template v-slot:no-data>
                      <div class="full-width row flex-center text-grey q-pa-md">
                        <span>No activity recorded today</span>
                      </div>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>

              <!-- Check Out All Confirmation Dialog -->
              <q-dialog v-model="checkOutAllDialog">
                <q-card style="min-width: 350px">
                  <q-card-section>
                    <div class="text-h6">Confirm Check-Out All</div>
                    <div class="q-mt-md">
                      Area you sure you want to check out all
                      {{ checkedInStudents.length }} students?
                    </div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                    <q-btn flat label="Check Out All" color="negative" @click="handleCheckOutAll" />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </div>
            <!-- VIEW: PC MANAGEMENT -->
            <div v-if="activeView === 'pc_management'">
              <div class="row q-col-gutter-sm">
                <div
                  class="col-12 col-sm-6 col-md-4 col-lg-3"
                  v-for="pc in pcStatuses"
                  :key="pc.id"
                >
                  <q-card
                    :class="`no-shadow shadow-1 border-radius-lg bg-${pc.color} text-${pc.textColor}`"
                    style="min-height: 120px"
                  >
                    <q-card-section>
                      <div class="row items-center justify-between no-wrap">
                        <div class="text-h6 text-weight-bold">{{ pc.id }}</div>
                        <q-icon :name="pc.icon" size="sm" />
                      </div>
                      <div class="q-mt-md">
                        <div
                          v-if="pc.status === 'Occupied'"
                          class="text-subtitle2 text-weight-bold truncate-text"
                        >
                          {{ pc.student_name }}
                        </div>
                        <div
                          v-else-if="pc.status === 'Issue'"
                          class="text-subtitle2 text-weight-bold truncate-text"
                        >
                          {{ pc.student_name }}
                        </div>
                        <div v-else class="text-subtitle2 text-grey-8">Available</div>
                        <div v-if="pc.status === 'Occupied'" class="text-caption">
                          ID: {{ pc.student_id }}
                        </div>
                        <div v-if="pc.status === 'Issue'" class="text-caption truncate-text">
                          {{ pc.record.description }}
                        </div>
                      </div>
                    </q-card-section>

                    <q-separator :color="pc.textColor" />

                    <q-card-actions align="right" class="q-pt-xs q-pb-xs">
                      <q-btn
                        v-if="pc.status !== 'Issue'"
                        flat
                        dense
                        label="Report"
                        size="sm"
                        icon="report_problem"
                        :color="pc.textColor"
                        @click="openIssueDialog(pc.id)"
                      />
                      <q-btn
                        v-if="pc.status === 'Issue'"
                        flat
                        dense
                        label="Resolve"
                        size="sm"
                        icon="check_circle"
                        color="positive"
                        @click="resolveIssue(pc.id)"
                      />
                      <q-btn
                        v-if="pc.status === 'Occupied'"
                        flat
                        dense
                        label="Release"
                        size="sm"
                        :color="pc.textColor"
                        @click="handleCheckOut(pc.record)"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>

              <!-- Report Issue Dialog -->
              <q-dialog v-model="issueDialog">
                <q-card style="min-width: 350px">
                  <q-card-section>
                    <div class="text-h6">Report Issue for {{ reportingPC }}</div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-select
                      v-model="issueForm.type"
                      :options="['Hardware', 'Software', 'Network', 'Other']"
                      label="Issue Type"
                      filled
                      class="q-mb-sm"
                    />
                    <q-input
                      v-model="issueForm.description"
                      label="Description"
                      filled
                      type="textarea"
                      rows="3"
                    />
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                    <q-btn flat label="Submit Issue" color="negative" @click="submitIssue" />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </div>
            <!-- VIEW: MONTHLY FEES (was Expenses) -->
            <div v-if="activeView === 'monthly_expenses'">
              <q-card class="no-shadow shadow-1 border-radius-lg q-mb-md">
                <q-card-section class="row justify-between items-center">
                  <div class="row items-center q-gutter-x-md">
                    <div class="text-h6 text-primary">Monthly Fees (Collection)</div>
                    <q-input
                      v-model="expenseMonth"
                      type="month"
                      dense
                      outlined
                      class="q-ml-md"
                      style="min-width: 150px"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref="paymentFileInputRef"
                      accept=".csv"
                      class="hidden"
                      @change="handlePaymentFileUpload"
                    />
                    <q-btn
                      label="Import CSV"
                      icon="upload_file"
                      color="green"
                      unelevated
                      class="q-mr-sm"
                      @click="triggerPaymentUpload"
                      :loading="loadingBulkPayments"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Summary Cards -->
              <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-4">
                  <q-card class="no-shadow border-radius-lg bg-green-1 text-green-9">
                    <q-card-section>
                      <div class="text-subtitle2 text-uppercase">Total Collections</div>
                      <div class="text-h4 text-weight-bold q-mt-sm">
                        LKR {{ totalMonthlyExpenses.toLocaleString() }}
                      </div>
                      <div class="text-caption">For {{ expenseMonth }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Payments Table -->
              <q-card class="no-shadow shadow-1 border-radius-lg">
                <q-card-section>
                  <q-table
                    :rows="expensesList"
                    :columns="expenseColumns"
                    row-key="id"
                    :loading="expensesLoading"
                    flat
                    bordered
                  >
                    <template v-slot:no-data>
                      <div class="full-width row flex-center text-grey q-pa-md">
                        <q-icon name="payments" size="2em" class="q-mr-sm" />
                        <span>No payments recorded for this month</span>
                      </div>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
              <!-- Info Dialog -->
            </div>
            <!-- VIEW: REPORTS -->
            <div v-if="activeView === 'reports'">
              <div class="row q-col-gutter-md q-mb-lg">
                <!-- Report Selection -->
                <div class="col-12 col-md-5">
                  <q-card class="no-shadow shadow-1 border-radius-lg full-height">
                    <q-card-section>
                      <div class="text-h6 text-primary">Generate Report</div>
                      <div class="text-caption text-grey">Select report type and period</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-gutter-y-md">
                      <q-btn-toggle
                        v-model="reportType"
                        spread
                        no-caps
                        rounded
                        unelevated
                        toggle-color="primary"
                        color="white"
                        text-color="primary"
                        :options="[
                          { label: 'Daily Report', value: 'daily' },
                          { label: 'Monthly Report', value: 'monthly' },
                        ]"
                        class="border-primary"
                      />

                      <!-- Daily Input -->
                      <div v-if="reportType === 'daily'" class="animate-pop">
                        <q-input
                          v-model="reportDate"
                          type="date"
                          outlined
                          dense
                          label="Select Date"
                        />
                        <q-btn
                          label="Get Daily Report"
                          class="full-width q-mt-md"
                          color="primary"
                          icon="assessment"
                          @click="generateReport"
                          :loading="reportLoading"
                        />
                      </div>

                      <!-- Monthly Input -->
                      <div v-if="reportType === 'monthly'" class="animate-pop row q-col-gutter-sm">
                        <div class="col-6">
                          <q-select
                            v-model="reportYear"
                            :options="[2024, 2025, 2026, 2027]"
                            label="Year"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-6">
                          <q-select
                            v-model="reportMonth"
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
                            ]"
                            label="Month"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-12">
                          <q-btn
                            label="Get Monthly Report"
                            class="full-width q-mt-md"
                            color="purple"
                            icon="Summarize"
                            @click="generateReport"
                            :loading="reportLoading"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Instructions / Placeholder -->
                <div class="col-12 col-md-7 flex flex-center" v-if="!reportResult">
                  <div class="text-center text-grey">
                    <q-icon name="analytics" size="5em" color="grey-4" />
                    <div class="text-h6 q-mt-md">Analytics Center</div>
                    <div>Select a period to view financial and operational snapshots.</div>
                  </div>
                </div>

                <!-- Report Results -->
                <div class="col-12 col-md-7" v-if="reportResult">
                  <q-card class="no-shadow shadow-1 border-radius-lg bg-grey-1">
                    <q-card-section>
                      <div class="text-h6">
                        Report for: <span class="text-primary">{{ reportResult.period }}</span>
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                      <div class="row q-col-gutter-md">
                        <!-- Income -->
                        <div class="col-6">
                          <q-card class="no-shadow bg-white text-green border-radius-lg">
                            <q-card-section>
                              <div class="text-caption text-uppercase">Total Income</div>
                              <div class="text-h5 text-weight-bold">
                                LKR {{ reportResult.income }}
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                        <!-- Expenses -->
                        <div class="col-6">
                          <q-card class="no-shadow bg-white text-red border-radius-lg">
                            <q-card-section>
                              <div class="text-caption text-uppercase">Total Expenses</div>
                              <div class="text-h5 text-weight-bold">
                                LKR {{ reportResult.expenses }}
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                        <!-- Net Profit -->
                        <div class="col-6">
                          <q-card class="no-shadow bg-white text-blue border-radius-lg">
                            <q-card-section>
                              <div class="text-caption text-uppercase">Net Profit/Loss</div>
                              <div class="text-h5 text-weight-bold">LKR {{ reportResult.net }}</div>
                            </q-card-section>
                          </q-card>
                        </div>
                        <!-- Attendance -->
                        <div class="col-6">
                          <q-card class="no-shadow bg-white text-orange border-radius-lg">
                            <q-card-section>
                              <div class="text-caption text-uppercase">Total Attendance</div>
                              <div class="text-h5 text-weight-bold">
                                {{ reportResult.attendance }}
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>

                      <!-- Daily Time Slot Breakdown -->
                      <div v-if="reportType === 'daily' && reportResult.slots" class="q-mt-lg">
                        <div class="text-subtitle1 text-weight-bold q-mb-sm text-grey-8">
                          Time Slot Breakdown (1hr+ Overlap)
                        </div>
                        <div class="row q-col-gutter-sm">
                          <div
                            class="col-6 col-sm-4 col-md-2"
                            v-for="slot in reportResult.slots"
                            :key="slot.label"
                          >
                            <q-card class="no-shadow border-primary text-center">
                              <q-card-section class="q-pa-sm">
                                <div class="text-caption text-weight-bold">{{ slot.label }}</div>
                                <div class="text-h6 text-primary">{{ slot.count }}</div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>
                      </div>

                      <!-- PC Performance Stats -->
                      <div
                        v-if="reportResult.pcUsage && reportResult.pcUsage.length > 0"
                        class="q-mt-lg"
                      >
                        <div class="text-subtitle1 text-weight-bold q-mb-sm text-grey-8">
                          PC Performance Analysis
                        </div>
                        <q-markup-table flat bordered dense>
                          <thead class="bg-grey-2">
                            <tr>
                              <th class="text-left">PC Number</th>
                              <th class="text-center">Total Sessions</th>
                              <th class="text-right">Total Usage (Hours)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="pc in reportResult.pcUsage" :key="pc.id">
                              <td class="text-left text-weight-bold">{{ pc.id }}</td>
                              <td class="text-center">{{ pc.sessions }}</td>
                              <td class="text-right">{{ (pc.minutes / 60).toFixed(1) }} hrs</td>
                            </tr>
                          </tbody>
                        </q-markup-table>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <div v-if="activeView === 'dashboard'" class="row q-col-gutter-lg">
              <!-- Left Column: Analytics & Graph (Full Width) -->
              <div class="col-12">
                <q-card class="no-shadow shadow-1 border-radius-lg q-mb-md">
                  <q-card-section>
                    <div class="text-h6 text-red-7 text-weight-bold">
                      Last 30 Days Attendance Trend
                    </div>
                    <div class="text-caption text-grey">
                      Analysis of student presence fluctuations
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <!-- Custom High-Fidelity Chart Reproduction -->
                    <div
                      style="
                        height: 350px;
                        width: 100%;
                        position: relative;
                        padding: 20px 0 40px 40px;
                      "
                    >
                      <!-- Y Axis Label -->
                      <div
                        style="
                          position: absolute;
                          left: -25px;
                          top: 50%;
                          transform: rotate(-90deg) translateX(50%);
                          font-size: 10px;
                          color: #666;
                        "
                      >
                        Student Count
                      </div>

                      <svg
                        viewBox="0 0 800 300"
                        style="width: 100%; height: 100%; overflow: visible"
                        preserveAspectRatio="none"
                      >
                        <!-- Grid & Background -->
                        <defs>
                          <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color: #ef9a9a; stop-opacity: 0.5" />
                            <stop offset="100%" style="stop-color: #ef9a9a; stop-opacity: 0.1" />
                          </linearGradient>
                        </defs>

                        <!-- Horizontal Grid Lines (0.0 to 4.0) -->
                        <g stroke="#e0e0e0" stroke-width="1" stroke-dasharray="0">
                          <line x1="0" y1="250" x2="800" y2="250" />
                          <line x1="0" y1="218.75" x2="800" y2="218.75" />
                          <line x1="0" y1="187.5" x2="800" y2="187.5" />
                          <line x1="0" y1="156.25" x2="800" y2="156.25" />
                          <line x1="0" y1="125" x2="800" y2="125" />
                          <line x1="0" y1="93.75" x2="800" y2="93.75" />
                          <line x1="0" y1="62.5" x2="800" y2="62.5" />
                          <line x1="0" y1="31.25" x2="800" y2="31.25" />
                          <line x1="0" y1="0" x2="800" y2="0" />
                        </g>

                        <!-- Vertical Grid Lines (Dates) -->
                        <g stroke="#f5f5f5" stroke-width="1">
                          <line
                            v-for="n in 30"
                            :key="n"
                            :x1="(n - 1) * (800 / 29)"
                            y1="0"
                            :x2="(n - 1) * (800 / 29)"
                            y2="250"
                          />
                        </g>

                        <!-- Y Axis Text -->
                        <g font-size="10" fill="#666" text-anchor="end">
                          <text x="-10" y="253">0</text>
                          <text x="-10" y="190">1.0</text>
                          <text x="-10" y="128">2.0</text>
                          <text x="-10" y="65">3.0</text>
                          <text x="-10" y="3">4.0</text>
                        </g>

                        <!-- X Axis Text (Rotated) -->
                        <g font-size="9" fill="#666" text-anchor="end">
                          <text
                            v-for="(date, i) in [
                              'Dec-20',
                              'Dec-21',
                              'Dec-22',
                              'Dec-23',
                              'Dec-24',
                              'Dec-25',
                              'Dec-26',
                              'Dec-27',
                              'Dec-28',
                              'Dec-29',
                              'Dec-30',
                              'Dec-31',
                              'Jan-01',
                              'Jan-02',
                              'Jan-03',
                              'Jan-04',
                              'Jan-05',
                              'Jan-06',
                              'Jan-07',
                              'Jan-08',
                              'Jan-09',
                              'Jan-10',
                              'Jan-11',
                              'Jan-12',
                              'Jan-13',
                              'Jan-14',
                              'Jan-15',
                              'Jan-16',
                              'Jan-17',
                              'Jan-18',
                            ]"
                            :key="i"
                            :x="i * (800 / 29) - 5"
                            y="265"
                            transform="rotate(-45)"
                            style="transform-box: fill-box; transform-origin: center"
                          >
                            {{ date }}
                          </text>
                        </g>

                        <!-- Chart Area & Line -->
                        <path
                          d="M0,250
                                 L165,250
                                 Q193,0 220,250
                                 L275,250
                                 Q303,187 330,250
                                 L630,250
                                 Q660,187 690,250
                                 L800,250"
                          fill="none"
                          stroke="#d32f2f"
                          stroke-width="2"
                        />

                        <path
                          d="M0,250
                                 L165,250
                                 Q193,0 220,250
                                 L275,250
                                 Q303,187 330,250
                                 L630,250
                                 Q660,187 690,250
                                 L800,250 v0 h-800 z"
                          fill="url(#chartFill)"
                          stroke="none"
                        />

                        <!-- Data Points (Circles) -->
                        <circle
                          cx="193"
                          cy="0"
                          r="3"
                          fill="white"
                          stroke="#d32f2f"
                          stroke-width="2"
                        />
                        <circle
                          cx="303"
                          cy="187.5"
                          r="3"
                          fill="white"
                          stroke="#d32f2f"
                          stroke-width="2"
                        />
                        <circle
                          cx="660"
                          cy="187.5"
                          r="3"
                          fill="white"
                          stroke="#d32f2f"
                          stroke-width="2"
                        />
                        <!-- Baseline dots -->
                        <g fill="#d32f2f">
                          <circle
                            v-for="n in 30"
                            :key="n"
                            :cx="(n - 1) * (800 / 29)"
                            cy="250"
                            r="2"
                          />
                        </g>

                        <!-- Legend -->
                        <g transform="translate(350, -20)">
                          <rect
                            x="0"
                            y="0"
                            width="20"
                            height="10"
                            fill="#ef9a9a"
                            stroke="#d32f2f"
                          />
                          <text x="25" y="8" font-size="10" fill="#666">Total Students</text>
                        </g>
                      </svg>
                      <!-- X Axis Label -->
                      <div class="text-center text-caption text-grey q-mt-sm">Date</div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Low Attendance Alert -->
                <q-card class="no-shadow shadow-1 border-radius-lg border-red-left">
                  <q-card-section class="row items-center">
                    <q-icon name="warning" color="negative" size="md" class="q-mr-md" />
                    <div>
                      <div class="text-subtitle1 text-weight-bold">Low Attendance Alert</div>
                      <div class="text-caption text-grey-8">
                        15 Students have missed more than 3 consecutive classes.
                      </div>
                    </div>
                    <q-space />
                    <q-btn flat color="negative" label="View List" icon-right="arrow_forward" />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Dashboard (Purple Theme) -->
      <div v-else-if="profile?.role === 'student'">
        <div class="row q-col-gutter-md">
          <!-- Mobile Friendly Quick Stats -->
          <div class="col-6 col-md-3">
            <q-card class="bg-purple-1 text-purple-9 text-center no-shadow border-radius-lg">
              <q-card-section>
                <q-icon name="check_circle" size="lg" />
                <div class="text-weight-bold q-mt-sm">Attendance</div>
                <div class="text-h5">92%</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6 col-md-3">
            <q-card class="bg-indigo-1 text-indigo-9 text-center no-shadow border-radius-lg">
              <q-card-section>
                <q-icon name="payments" size="lg" />
                <div class="text-weight-bold q-mt-sm">Payments</div>
                <div class="text-subtitle2 text-green-7">Up to date</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <!-- LMS Quick Access -->
            <q-card class="bg-deep-purple-7 text-white no-shadow border-radius-lg">
              <q-card-section class="row items-center justify-between">
                <div>
                  <div class="text-h6">My Courses</div>
                  <div class="text-caption">Access notes and videos</div>
                </div>
                <q-btn
                  icon="school"
                  color="white"
                  text-color="deep-purple"
                  flat
                  label="Go to LMS"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Content Area -->
          <div class="col-12 col-md-8">
            <q-card class="no-shadow border-radius-lg bordered">
              <q-card-section>
                <div class="text-h6 text-purple-9">Notice Board</div>
              </q-card-section>
              <q-list separator>
                <q-item v-for="n in 3" :key="n">
                  <q-item-section avatar>
                    <q-icon name="campaign" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Important Exam Notice</q-item-label>
                    <q-item-label caption
                      >The final exam for Term 1 has been rescheduled to...</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side top>
                    <q-chip size="sm" color="purple-1" text-color="purple">New</q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card class="no-shadow border-radius-lg bordered">
              <div class="q-pa-md">
                <div class="text-subtitle1 text-weight-bold q-mb-sm text-center">
                  Class Calendar
                </div>
                <q-date v-model="today" minimal flat class="full-width" color="purple" readonly />
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Fallback / Unknown Role -->
      <div v-else class="text-center q-pa-xl">
        <q-icon name="lock" size="4em" color="grey" />
        <div class="text-h5 q-mt-md">Access Restricted</div>
        <p class="text-grey">Please contact the administrator to assign a valid role.</p>
      </div>
    </div>

    <!-- Permissions Dialog -->
    <q-dialog v-model="permissionsDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Manage Permissions</div>
          <div class="text-caption text-grey">
            User: {{ selectedUser?.email }}
            <br />
            Role: {{ selectedUser?.role }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <div class="q-pa-md">
            <div class="text-weight-bold q-mb-sm">Financial Control</div>
            <q-toggle
              v-model="permissionForm.delete_payments"
              label="Delete Payments"
              color="red"
            />
            <q-toggle
              v-model="permissionForm.change_salary"
              label="Change Staff Salary"
              color="orange"
            />
            <q-toggle
              v-model="permissionForm.view_profit_loss"
              label="View Profit/Loss Reports"
              color="green"
            />

            <div class="text-weight-bold q-mb-sm q-mt-md">Operational Control</div>
            <q-toggle
              v-model="permissionForm.edit_student_profile"
              label="Edit Student Profiles"
              color="blue"
            />
            <q-toggle
              v-model="permissionForm.manage_database"
              label="Manage Database (Advanced)"
              color="purple"
            />

            <div class="text-weight-bold q-mb-sm q-mt-md">Default Permissions</div>
            <p class="text-caption text-grey-6">
              {{ getRoleDescription(selectedUser?.role) }}
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save Changes" @click="savePermissions" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from 'src/boot/supabase'
import { useQuasar } from 'quasar'
import Papa from 'papaparse'
import StudentPortal from 'src/components/StudentPortal.vue'

const $q = useQuasar()
const profile = ref(null)
const loading = ref(true)
const teamMembers = ref([])
const loadingTeam = ref(false)
const userId = ref(null)
const fetchError = ref(null)
const tab = ref('users') // Default tab

// Permissions Management
const permissionsDialog = ref(false)
const adminAddStudentOpen = ref(false)
const adminPortalOpen = ref(false)
const selectedUser = ref(null)
const permissionForm = ref({
  delete_payments: false,
  change_salary: false,
  edit_student_profile: false,
  view_profit_loss: false,
  manage_database: false,
})

// Dashboard Specific Refs
const searchText = ref('')
const paymentType = ref('Monthly Fee')
const amount = ref('')

// Teacher Dashboard Refs
const activeView = ref('dashboard')
const studentForm = ref({
  student_id: '',
  full_name: '',
  gender: 'Male',
  dob: '',
  whatsapp_student: '',
  guardian_name: '',
  whatsapp_guardian: '',
  daham_pasala: '',
  gn_division: '',
  address: '',
  status: 'Active',
  submission_date: new Date().toLocaleDateString('en-CA'),
})
const loadingStudent = ref(false)

const generateStudentId = async () => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('student_id')
      .ilike('student_id', 'STU165%')
      .order('student_id', { ascending: false })
      .limit(1)

    if (error) throw error

    let nextId = 'STU1650001'
    if (data && data.length > 0) {
      const lastId = data[0].student_id
      const numericPart = lastId.replace(/\D/g, '')
      if (numericPart) {
        const nextNum = parseInt(numericPart) + 1
        nextId = `STU${nextNum}`
      }
    }
    studentForm.value.student_id = nextId
  } catch (err) {
    console.error('Auto-ID Error:', err)
  }
}

watch(activeView, (newView) => {
  if (newView === 'add_student') {
    generateStudentId()
  } else if (newView === 'all_students') {
    fetchStudents()
  } else if (newView === 'checked_in' || newView === 'pc_management') {
    fetchCheckedInStudents()
    fetchPCIssues()
  } else if (newView === 'dashboard') {
    fetchDashboardStats()
  }
})
const fileInputRef = ref(null)
const loadingBulk = ref(false)

const triggerFileUpload = () => {
  fileInputRef.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  loadingBulk.value = true
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data
      const validStudents = []

      // Basic mapping - assumes CSV has headers matching DB or close to it
      // Expected CSV Headers: student_id, full_name, gender, dob, whatsapp_student

      for (const row of rows) {
        // Mapping based on user provided headers:
        // StudentID, Student Name, Gender, DOB, WhatsApp, Address, Guardian Name, Guardian WhatsApp, Daham Pasala, GN Division
        const sid = row['StudentID'] || row.student_id
        const name = row['Student Name'] || row.full_name

        if (sid && name) {
          // Normalize gender to Capitalized format (Male/Female) to satisfy check constraint
          let rawGender = (row['Gender'] || row.gender || 'Male').trim().toLowerCase()
          let gender = 'Male'
          if (rawGender === 'female' || rawGender === 'f') gender = 'Female'

          validStudents.push({
            student_id: sid,
            full_name: name,
            gender: gender,
            dob: row['DOB'] || null,
            whatsapp_student: row['WhatsApp'] || '',
            whatsapp_guardian: row['Guardian WhatsApp'] || '',
            guardian_name: row['Guardian Name'] || '',
            daham_pasala: row['Daham Pasala'] || '',
            gn_division: row['GN Division'] || '',
            address: row['Address'] || '',
            submission_date: row['Submission Date'] || null,
            status: row['Status'] || 'Active',
          })
        }
      }

      // Deduplicate students based on student_id to prevent "affect row a second time" error
      const uniqueStudentsMap = new Map()
      validStudents.forEach((student) => {
        uniqueStudentsMap.set(student.student_id, student)
      })
      const finalStudents = Array.from(uniqueStudentsMap.values())

      if (finalStudents.length > 0) {
        try {
          // Supabase allows bulk upsert. Using upsert to handle duplicates by updating them.
          const { error } = await supabase
            .from('students')
            .upsert(finalStudents, { onConflict: 'student_id' })
          if (error) throw error
          $q.notify({
            type: 'positive',
            message: `Successfully imported/updated ${finalStudents.length} students!`,
          })
          if (validStudents.length > finalStudents.length) {
            $q.notify({
              type: 'warning',
              message: `Skipped ${validStudents.length - finalStudents.length} duplicate IDs in CSV`,
            })
          }
        } catch (err) {
          console.error(err)
          $q.notify({ type: 'negative', message: 'Import failed: ' + err.message })
        }
      } else {
        $q.notify({
          type: 'warning',
          message: 'No valid rows found in CSV (Check headers: student_id, full_name)',
        })
      }
      loadingBulk.value = false
      event.target.value = '' // Clear input
    },
    error: (err) => {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error parsing CSV' })
      loadingBulk.value = false
    },
  })
}

// Checked-in List Logic
const checkedInStudents = ref([])
const checkedInLoading = ref(false)
const checkOutAllDialog = ref(false)

const checkedInColumns = [
  {
    name: 'student_id',
    label: 'Student ID',
    field: (row) => row.students?.student_id,
    align: 'left',
    sortable: true,
  },
  {
    name: 'full_name',
    label: 'Student Name',
    field: (row) => row.students?.full_name,
    align: 'left',
    sortable: true,
  },
  { name: 'pc_number', label: 'Allocated PC', field: 'pc_number', align: 'center', sortable: true },
  {
    name: 'check_in_time',
    label: 'Check-in Time',
    field: (row) => new Date(row.check_in_time).toLocaleTimeString(),
    align: 'center',
    sortable: true,
  },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
]

const dailyHistory = ref([])
const dailyHistoryColumns = [
  {
    name: 'student_id',
    label: 'Student ID',
    field: (row) => row.students?.student_id,
    align: 'left',
    sortable: true,
  },
  {
    name: 'full_name',
    label: 'Name',
    field: (row) => row.students?.full_name,
    align: 'left',
    sortable: true,
  },
  { name: 'pc_number', label: 'PC', field: 'pc_number', align: 'center', sortable: true },
  {
    name: 'check_in_time',
    label: 'Check-in',
    field: (row) => new Date(row.check_in_time).toLocaleTimeString(),
    align: 'center',
    sortable: true,
  },
  {
    name: 'check_out_time',
    label: 'Check-out',
    field: (row) => (row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString() : '-'),
    align: 'center',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
]

const attendanceFileInputRef = ref(null)
const loadingBulkAttendance = ref(false)

const triggerAttendanceUpload = () => {
  attendanceFileInputRef.value.click()
}

const handleAttendanceFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  loadingBulkAttendance.value = true
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data
      if (rows.length === 0) {
        $q.notify({ type: 'warning', message: 'CSV is empty or invalid' })
        loadingBulkAttendance.value = false
        return
      }

      // Extract unique Student IDs - Handle both 'student_id' and 'StudentID'
      const csvStudentIds = [
        ...new Set(rows.map((r) => r.student_id || r.StudentID || r['Student ID']).filter(Boolean)),
      ]

      try {
        // Fetch UUIDs
        const { data: studentsMap, error: mapError } = await supabase
          .from('students')
          .select('id, student_id')
          .in('student_id', csvStudentIds)

        if (mapError) throw mapError

        const idMap = {}
        studentsMap.forEach((s) => {
          idMap[s.student_id] = s.id
        })

        const attendancePayload = []
        const studentUpdates = {} // Map to track latest date per student

        // Helper to normalize date to YYYY-MM-DD
        const normalizeDate = (d) => {
          if (!d) return null
          let clean = d.trim()
          // Check if DD/MM/YYYY or DD-MM-YYYY
          if (clean.includes('/') || clean.includes('-')) {
            const parts = clean.split(/[/-]/)
            // If year is last (DD/MM/YYYY) e.g. 21/01/2026
            if (parts[2] && parts[2].length === 4) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            }
          }
          return clean // Return as is if already likely YYYY-MM-DD
        }

        // Helper to normalize time to HH:MM:SS
        const normalizeTime = (t) => {
          if (!t) return null
          let clean = t.trim().toLowerCase()
          // Replace dots with colons (8.30 -> 8:30)
          clean = clean.replace(/\./g, ':')

          // Handle AM/PM
          let hours = 0
          let minutes = 0
          let seconds = 0

          if (clean.includes('pm') || clean.includes('am')) {
            const isPM = clean.includes('pm')
            clean = clean.replace(/(pm|am)/g, '').trim()
            const parts = clean.split(':')
            if (parts[0]) hours = parseInt(parts[0])
            if (parts[1]) minutes = parseInt(parts[1])

            if (isPM && hours < 12) hours += 12
            if (!isPM && hours === 12) hours = 0
          } else {
            const parts = clean.split(':')
            if (parts[0]) hours = parseInt(parts[0])
            if (parts[1]) minutes = parseInt(parts[1])
            if (parts[2]) seconds = parseInt(parts[2])
          }

          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        }

        rows.forEach((row) => {
          try {
            // Map Custom Headers
            const sid = row.student_id || row.StudentID || row['Student ID']
            const rawDate = row.date || row.Date
            const rawCheckIn = row.check_in_time || row.CheckIn || row['Check In']
            const rawCheckOut =
              row.check_out_time || row.CheckOut || row.checkOut || row['Check Out']
            const pcNum = row.pc_number || row.PC_Number || row['PC Number']

            const uuid = idMap[sid]
            const dateStr = normalizeDate(rawDate)

            // Ensure we have a valid date string YYYY-MM-DD
            if (uuid && dateStr && dateStr.length >= 10 && rawCheckIn) {
              const timeStr = normalizeTime(rawCheckIn)
              // Safety: Ensure timeStr is valid
              if (!timeStr.includes('NaN')) {
                const fullCheckIn = `${dateStr}T${timeStr}`

                let fullCheckOut = null
                if (rawCheckOut) {
                  const outTimeStr = normalizeTime(rawCheckOut)
                  if (!outTimeStr.includes('NaN')) {
                    fullCheckOut = `${dateStr}T${outTimeStr}`
                  }
                }

                // Final Valid Check
                const dIn = new Date(fullCheckIn)
                if (!isNaN(dIn.getTime())) {
                  const payload = {
                    student_record_id: uuid,
                    date: dateStr,
                    check_in_time: dIn.toISOString(),
                    pc_number: pcNum || null,
                  }

                  if (fullCheckOut) {
                    const dOut = new Date(fullCheckOut)
                    if (!isNaN(dOut.getTime())) {
                      payload.check_out_time = dOut.toISOString()
                    }
                  } else {
                    payload.check_out_time = null
                  }

                  attendancePayload.push(payload)

                  // Track latest date for student update
                  if (!studentUpdates[sid] || new Date(dateStr) > new Date(studentUpdates[sid])) {
                    studentUpdates[sid] = dateStr
                  }
                } else {
                  console.warn('Skipping invalid timestamp:', fullCheckIn, row)
                }
              }
            }
          } catch (e) {
            console.error('Row parse error:', e, row)
          }
        })

        if (attendancePayload.length > 0) {
          const { error: insertError } = await supabase.from('attendance').insert(attendancePayload)

          if (insertError) throw insertError

          $q.notify({
            type: 'positive',
            message: `Successfully imported ${attendancePayload.length} attendance records!`,
          })

          // Update students' last_attendance_date
          // Note: This is loop-heavy. For thousands of students, use RPC or smarter batching.
          // For now, doing it sequentially as it's likely a one-time migration or small batch.
          for (const [sid, lastDate] of Object.entries(studentUpdates)) {
            await supabase
              .from('students')
              .update({ last_attendance_date: lastDate })
              .eq('student_id', sid)
          }

          fetchCheckedInStudents()
          fetchDashboardStats() // Refresh stats
        } else {
          $q.notify({ type: 'warning', message: 'No matching students found for import' })
        }
      } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Import failed: ' + err.message })
      } finally {
        loadingBulkAttendance.value = false
        event.target.value = ''
      }
    },
    error: (err) => {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error parsing CSV' })
      loadingBulkAttendance.value = false
    },
  })
}

const fetchCheckedInStudents = async () => {
  checkedInLoading.value = true
  try {
    const today = new Date().toLocaleDateString('en-CA')
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(student_id, full_name)')
      .eq('date', today)
      .order('check_in_time', { ascending: false })

    if (error) throw error

    // Separate Active vs History
    dailyHistory.value = data
    checkedInStudents.value = data.filter((r) => !r.check_out_time)
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error fetching checked-in list' })
  } finally {
    checkedInLoading.value = false
  }
}

const handleCheckOut = async (row) => {
  try {
    const { error } = await supabase
      .from('attendance')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', row.id)

    if (error) throw error
    $q.notify({
      type: 'positive',
      message: `Student ${row.students?.student_id} checked out successfully`,
    })
    fetchCheckedInStudents()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Check-out failed' })
  }
}

const confirmCheckOutAll = () => {
  checkOutAllDialog.value = true
}

const handleCheckOutAll = async () => {
  try {
    const ids = checkedInStudents.value.map((s) => s.id)
    if (ids.length === 0) return

    const { error } = await supabase
      .from('attendance')
      .update({ check_out_time: new Date().toISOString() })
      .in('id', ids)

    if (error) throw error
    $q.notify({ type: 'positive', message: 'All students checked out successfully' })
    fetchCheckedInStudents()
    checkOutAllDialog.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Check-out all failed' })
  }
}

const handleAddStudent = async () => {
  if (!studentForm.value.student_id || !studentForm.value.full_name) {
    $q.notify({ type: 'negative', message: 'Please fill in required fields (ID, Name)' })
    return
  }

  loadingStudent.value = true
  try {
    const { error } = await supabase.from('students').insert([studentForm.value])
    if (error) throw error

    $q.notify({ type: 'positive', message: 'Student registered successfully!' })
    // Reset form but keep simple defaults if needed
    studentForm.value = {
      student_id: '',
      full_name: '',
      gender: 'Male',
      dob: '',
      whatsapp_student: '',
      guardian_name: '',
      whatsapp_guardian: '',
      daham_pasala: '',
      gn_division: '',
      address: '',
      status: 'Active',
      submission_date: new Date().toLocaleDateString('en-CA'),
    }
    adminAddStudentOpen.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error adding student: ' + err.message })
  } finally {
    loadingStudent.value = false
  }
}

// Student Directory Refs & Logic
const studentsList = ref([])
const loadingStudents = ref(false)
const studentSearch = ref('')

const isStudentActive = (student) => {
  if (!student?.last_attendance_date) return false
  const last = new Date(student.last_attendance_date)
  const today = new Date()
  const diffTime = Math.abs(today - last)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30
}

const studentColumns = [
  { name: 'student_id', label: 'ID', field: 'student_id', sortable: true, align: 'left' },
  { name: 'full_name', label: 'Full Name', field: 'full_name', sortable: true, align: 'left' },
  { name: 'gender', label: 'Gender', field: 'gender', sortable: true, align: 'left' },
  { name: 'dob', label: 'DOB', field: 'dob', sortable: true, align: 'left' },
  { name: 'address', label: 'Address', field: 'address', align: 'left' },
  {
    name: 'status',
    label: 'Status',
    field: (row) => (isStudentActive(row) ? 'Active' : 'Inactive'),
    align: 'center',
    sortable: true,
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const fetchStudents = async () => {
  loadingStudents.value = true
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    studentsList.value = students
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error fetching students' })
  } finally {
    loadingStudents.value = false
  }
}

// --- PC MANAGEMENT LOGIC ---
const totalPCs = ref(21)
const pcIssues = ref([])
const issueDialog = ref(false)
const reportingPC = ref('')
const issueForm = ref({ type: 'Hardware', description: '' })

const fetchPCIssues = async () => {
  const { data, error } = await supabase.from('pc_issues').select('*').neq('status', 'Resolved')

  if (!error) pcIssues.value = data || []
}

const openIssueDialog = (pcId) => {
  reportingPC.value = pcId
  issueForm.value = { type: 'Hardware', description: '' }
  issueDialog.value = true
}

const submitIssue = async () => {
  if (!issueForm.value.description) {
    $q.notify({ type: 'warning', message: 'Please describe the issue' })
    return
  }
  try {
    const { error } = await supabase.from('pc_issues').insert([
      {
        pc_number: reportingPC.value,
        issue_type: issueForm.value.type,
        description: issueForm.value.description,
        reported_by: userId.value, // Assuming userId is available from onMounted
      },
    ])
    if (error) throw error
    $q.notify({ type: 'positive', message: 'Issue reported successfully' })
    issueDialog.value = false
    fetchPCIssues()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to report issue' })
  }
}

const resolveIssue = async (pcId) => {
  try {
    const issue = pcIssues.value.find((i) => i.pc_number === pcId)
    if (!issue) return

    const { error } = await supabase
      .from('pc_issues')
      .update({ status: 'Resolved', resolved_at: new Date().toISOString() })
      .eq('id', issue.id)

    if (error) throw error
    $q.notify({ type: 'positive', message: 'Issue marked as resolved' })
    fetchPCIssues()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to resolve issue' })
  }
}

const pcStatuses = computed(() => {
  const statusList = []
  for (let i = 1; i <= totalPCs.value; i++) {
    const pcId = `PC-${String(i).padStart(2, '0')}`
    const occupant = checkedInStudents.value.find((s) => s.pc_number === pcId)
    const issue = pcIssues.value.find((i) => i.pc_number === pcId)

    if (issue) {
      statusList.push({
        id: pcId,
        status: 'Issue',
        student_id: null,
        student_name: issue.issue_type,
        color: 'orange-1',
        textColor: 'orange-9',
        icon: 'build',
        record: issue,
      })
    } else if (occupant) {
      statusList.push({
        id: pcId,
        status: 'Occupied',
        student_id: occupant.students?.student_id,
        student_name: occupant.students?.full_name,
        color: 'red-1',
        textColor: 'red-9',
        icon: 'person',
        record: occupant,
      })
    } else {
      statusList.push({
        id: pcId,
        status: 'Available',
        student_id: null,
        student_name: null,
        color: 'green-1',
        textColor: 'green-9',
        icon: 'computer',
        record: null,
      })
    }
  }
  return statusList
})

// --- DASHBOARD STATS LOGIC ---
const totalStudentsCount = ref(0)
const activeStudentsCount = ref(0)
const loadingStats = ref(false)

const todaysCollection = ref(0)
const todaysAttendanceCount = ref(0)
const liveAttendanceCount = ref(0)
const todaysNewStudents = ref(0)

const fetchDashboardStats = async () => {
  loadingStats.value = true
  try {
    const todayStr = new Date().toLocaleDateString('en-CA')

    // 1. Total Students
    const { count: total, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError
    totalStudentsCount.value = total || 0

    // 2. Active Students (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: active, error: activeError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .gte('last_attendance_date', thirtyDaysAgo.toISOString().split('T')[0])

    if (activeError) throw activeError
    activeStudentsCount.value = active || 0

    // 3. Today's Attendance (Total Check-ins)
    const { count: attendanceCount, error: attError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', todayStr)

    if (attError) throw attError
    todaysAttendanceCount.value = attendanceCount || 0

    // 3b. Checked-in Now (Live)
    const { count: liveCount, error: liveError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', todayStr)
      .is('check_out_time', null)

    if (liveError) throw liveError
    liveAttendanceCount.value = liveCount || 0

    // 4. Today's Collection
    // Note: This fetches all rows for today and sums locally. Optimize with RPC for large scale.
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('amount')
      .gte('paid_at', dayStart.toISOString())

    if (payError) throw payError
    todaysCollection.value = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // 5. New Students Today
    const { count: newStudents, error: newAttError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('submission_date', todayStr) // Assuming submission_date is used for registration date

    if (newAttError) throw newAttError
    todaysNewStudents.value = newStudents || 0
  } catch (err) {
    console.error('Stats Error:', err)
  } finally {
    loadingStats.value = false
  }
}

// --- REPROTS LOGIC ---
const reportType = ref('daily')
const reportDate = ref(new Date().toLocaleDateString('en-CA'))
const reportMonth = ref(new Date().toLocaleString('default', { month: 'long' }))
const reportYear = ref(new Date().getFullYear())
const reportLoading = ref(false)
const reportResult = ref(null)

const generateReport = async () => {
  reportLoading.value = true
  reportResult.value = null

  try {
    let income = 0
    let expenses = 0
    let attendanceCount = 0
    let slotCounts = []
    let pcUsageStats = []

    if (reportType.value === 'daily') {
      // 1. Daily Income
      // We need to cast paid_at to date. Since supabase-js doesn't support complex SQL directly comfortably,
      // we might fetch range or use a stored procedure. For simplicity/MVP, we fetch records and sum.
      // Ideally, use an RPC. Assuming low volume for now.
      const dayStart = new Date(reportDate.value)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(reportDate.value)
      dayEnd.setHours(23, 59, 59, 999)

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('paid_at', dayStart.toISOString())
        .lte('paid_at', dayEnd.toISOString())

      if (payments) income = payments.reduce((sum, p) => sum + Number(p.amount), 0)

      // 2. Daily Expenses
      const { data: expenseRows } = await supabase
        .from('expenses')
        .select('amount')
        .eq('expense_date', reportDate.value)

      if (expenseRows) expenses = expenseRows.reduce((sum, e) => sum + Number(e.amount), 0)

      // 3. Daily Attendance & Time Slots
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', reportDate.value)

      attendanceCount = attendanceRecords?.length || 0

      // Calculate PC Usage (Daily)
      const pcMap = {}
      if (attendanceRecords) {
        attendanceRecords.forEach((r) => {
          if (r.pc_number) {
            if (!pcMap[r.pc_number])
              pcMap[r.pc_number] = { id: r.pc_number, sessions: 0, minutes: 0 }
            pcMap[r.pc_number].sessions++

            if (r.check_in_time && r.check_out_time) {
              const start = new Date(r.check_in_time)
              const end = new Date(r.check_out_time)
              const diff = (end - start) / 1000 / 60 // minutes
              if (diff > 0) pcMap[r.pc_number].minutes += diff
            }
          }
        })
      }
      pcUsageStats = Object.values(pcMap).sort((a, b) => a.id.localeCompare(b.id))

      // Calculate Time Slots
      const slots = [
        { label: '08:30 - 10:30', start: '08:30', end: '10:30' },
        { label: '10:30 - 12:30', start: '10:30', end: '12:30' },
        { label: '12:30 - 14:30', start: '12:30', end: '14:30' },
        { label: '14:30 - 16:30', start: '14:30', end: '16:30' },
        { label: '16:30 - 18:30', start: '16:30', end: '18:30' },
        { label: '18:30 - 20:30', start: '18:30', end: '20:30' },
      ]

      slotCounts = slots.map((slot) => {
        // Construct dates in local time context of the report date
        const slotStart = new Date(`${reportDate.value}T${slot.start}:00`)
        const slotEnd = new Date(`${reportDate.value}T${slot.end}:00`)

        const count = attendanceRecords
          ? attendanceRecords.filter((r) => {
              const checkIn = new Date(r.check_in_time)
              // If check_out is null, assume they are still there (until end of day for calculation)
              const checkOut = r.check_out_time
                ? new Date(r.check_out_time)
                : new Date(`${reportDate.value}T23:59:59`)

              // Calculate overlap
              const overlapStart = checkIn > slotStart ? checkIn : slotStart
              const overlapEnd = checkOut < slotEnd ? checkOut : slotEnd

              const overlapDuration = overlapEnd - overlapStart

              // Only count if overlap is at least 1 hour (3600000 ms) and valid
              return overlapDuration >= 3600000
            }).length
          : 0

        return { ...slot, count }
      })
    } else {
      // MONTHLY REPORT
      // 1. Monthly Income (Using year/month columns)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('year', reportYear.value)
        .eq('month', reportMonth.value)

      if (payments) income = payments.reduce((sum, p) => sum + Number(p.amount), 0)

      // 2. Monthly Expenses
      // Need to filter by date range for the month
      const monthIndex = new Date(`${reportMonth.value} 1, 2000`).getMonth()
      const startOfMonth = new Date(reportYear.value, monthIndex, 1)
      const endOfMonth = new Date(reportYear.value, monthIndex + 1, 0)

      const { data: expenseRows } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', startOfMonth.toISOString().split('T')[0])
        .lte('expense_date', endOfMonth.toISOString().split('T')[0])

      if (expenseRows) expenses = expenseRows.reduce((sum, e) => sum + Number(e.amount), 0)

      // 3. Monthly Attendance
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      attendanceCount = attendanceRecords?.length || 0

      // Calculate PC Usage (Monthly)
      const pcMap = {}
      if (attendanceRecords) {
        attendanceRecords.forEach((r) => {
          if (r.pc_number) {
            if (!pcMap[r.pc_number])
              pcMap[r.pc_number] = { id: r.pc_number, sessions: 0, minutes: 0 }
            pcMap[r.pc_number].sessions++

            if (r.check_in_time && r.check_out_time) {
              const start = new Date(r.check_in_time)
              const end = new Date(r.check_out_time)
              const diff = (end - start) / 1000 / 60 // minutes
              if (diff > 0) pcMap[r.pc_number].minutes += diff
            }
          }
        })
      }
      pcUsageStats = Object.values(pcMap).sort((a, b) => a.id.localeCompare(b.id))
    }

    reportResult.value = {
      income,
      expenses,
      net: income - expenses,
      attendance: attendanceCount,
      slots: slotCounts,
      pcUsage: pcUsageStats,
      period:
        reportType.value === 'daily'
          ? reportDate.value
          : `${reportMonth.value} ${reportYear.value}`,
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to generate report' })
  } finally {
    reportLoading.value = false
  }
}

// --- MONTHLY EXPENSES LOGIC ---
const expensesList = ref([])
const expensesLoading = ref(false)
const expenseMonth = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
// (Removed unused form refs and upload logic)

const expenseColumns = [
  {
    name: 'date',
    label: 'Paid At',
    field: 'paid_at',
    align: 'left',
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
  },
  {
    name: 'student_id',
    label: 'Student ID',
    field: (row) => row.students?.student_id || '-',
    align: 'left',
    sortable: true,
  },
  { name: 'year', label: 'Year', field: 'year', align: 'center', sortable: true },
  { name: 'month', label: 'Month', field: 'month', align: 'center', sortable: true },
  {
    name: 'amount',
    label: 'Amount (LKR)',
    field: 'amount',
    align: 'right',
    sortable: true,
    format: (val) => (val ? val.toLocaleString() : '0'),
  },
]

const totalMonthlyExpenses = computed(() => {
  return expensesList.value.reduce((sum, item) => sum + Number(item.amount), 0)
})

const fetchExpenses = async () => {
  expensesLoading.value = true
  try {
    const [year, month] = expenseMonth.value.split('-')
    const startDate = `${expenseMonth.value}-01`
    // Calculate last day of month
    const endDate = new Date(year, month, 0).toLocaleDateString('en-CA')

    const { data, error } = await supabase
      .from('payments')
      .select('*, students(student_id)')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate)
      .order('paid_at', { ascending: false })

    if (error) throw error
    expensesList.value = data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to fetch payments' })
  } finally {
    expensesLoading.value = false
  }
}

// (Removed unused handlers)

// Watch for month changes
watch(expenseMonth, () => {
  if (activeView.value === 'monthly_expenses') {
    fetchExpenses()
  }
})

watch(activeView, (val) => {
  if (val === 'monthly_expenses') {
    fetchExpenses()
  }
})

// --- FINANCE / PAYMENT UPLOAD LOGIC ---
const paymentFileInputRef = ref(null)
const loadingBulkPayments = ref(false)

const triggerPaymentUpload = () => {
  paymentFileInputRef.value.click()
}

const handlePaymentFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  loadingBulkPayments.value = true
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    complete: async (results) => {
      const rows = results.data
      if (rows.length === 0) {
        $q.notify({ type: 'warning', message: 'CSV is empty or invalid' })
        loadingBulkPayments.value = false
        return
      }

      // 1. Extract Student IDs
      const csvStudentIds = [
        ...new Set(rows.map((r) => r.StudentID || r['Student ID'] || r.student_id).filter(Boolean)),
      ]

      try {
        // 2. Fetch UUIDs
        const { data: studentsMap, error: mapError } = await supabase
          .from('students')
          .select('id, student_id')
          .in('student_id', csvStudentIds)

        if (mapError) throw mapError

        const idMap = {}
        studentsMap.forEach((s) => {
          idMap[s.student_id] = s.id
        })

        // 3. Prepare Payload
        const paymentPayload = []

        // Helper date/time normalizers
        const normalizeDate = (d) => {
          if (!d) return null
          let clean = d.trim()
          // Support / - . separators
          const parts = clean.split(/[/\-.]/)

          if (parts.length >= 3) {
            // Case 1: YYYY start (YYYY-MM-DD)
            if (parts[0].length === 4) {
              return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
            }
            // Case 2: YYYY end
            if (parts[2].length === 4) {
              const p1 = parseInt(parts[1])
              // Check for MM/DD/YYYY (US Format, often defaults in Excel) where 2nd part > 12 is Day
              if (p1 > 12) {
                return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
              }
              // Else Assume DD/MM/YYYY
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            }
          }
          return clean
        }

        const normalizeTime = (t) => {
          if (!t) return '00:00:00'
          let clean = t.trim().toLowerCase().replace(/\./g, ':')
          // Simplified AM/PM handling
          if (clean.includes('pm') || clean.includes('am')) {
            const isPM = clean.includes('pm')
            clean = clean.replace(/[a-z]/g, '').trim()
            const parts = clean.split(':')
            let h = parseInt(parts[0] || '0')
            let m = parseInt(parts[1] || '0')
            if (isPM && h < 12) h += 12
            if (!isPM && h === 12) h = 0
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
          }
          // Default H:M:S
          const parts = clean.split(':')
          if (parts.length >= 2) {
            const h = parts[0].padStart(2, '0')
            const m = parts[1].padStart(2, '0')
            const s = (parts[2] || '0').padStart(2, '0')
            return `${h}:${m}:${s}`
          }
          return clean
        }

        // Helper to find key case-insensitive
        const findKey = (obj, keywords) => {
          const keys = Object.keys(obj)
          for (const k of keys) {
            const low = k.toLowerCase().trim()
            if (keywords.some((kw) => low.includes(kw))) return obj[k]
          }
          return undefined
        }

        let fallbackCount = 0

        rows.forEach((row) => {
          const sid = row.StudentID || row['Student ID'] || row.student_id
          const uuid = idMap[sid]

          if (uuid) {
            // explicit lookup first
            let dateInput =
              row.Date || row.date || row['Paid At'] || row['paid_at'] || row['Payment Date']
            let timeInput = row.Time || row.time || row['Paid Time'] || row['paid_time']

            // If explicit keys failed for time, try smart lookup
            if (!timeInput) timeInput = findKey(row, ['time'])

            let paidAt = null

            // Strategy 1: Combine and Standard Parse (Works for "1/23/2025" + "11:51:00 AM")
            if (dateInput) {
              const combined = timeInput ? `${dateInput} ${timeInput}` : dateInput
              const d = new Date(combined)
              if (!isNaN(d.getTime())) {
                paidAt = d.toISOString()
              }
            }

            // Strategy 2: Normalize if Strategy 1 failed
            if (!paidAt && dateInput) {
              const dateStr = normalizeDate(dateInput)
              const timeStr = normalizeTime(timeInput)
              if (dateStr) {
                const d = new Date(`${dateStr}T${timeStr}`)
                if (!isNaN(d.getTime())) paidAt = d.toISOString()
              }
            }

            // Default fallback
            if (!paidAt) {
              paidAt = new Date().toISOString()
              if (dateInput) fallbackCount++
            }

            // Clean amount: remove commas, currency symbols
            const rawAmount = row.Amount || row.amount || '0'
            const cleanAmountStr = String(rawAmount).replace(/[^0-9.-]+/g, '')
            let amt = parseFloat(cleanAmountStr)
            if (isNaN(amt)) amt = 0

            // Determine Month
            let monthVal = row.Month || row.month
            if (!monthVal) {
              try {
                const d = new Date(paidAt)
                if (!isNaN(d.getTime())) {
                  monthVal = d.toLocaleString('default', { month: 'long' })
                }
              } catch {
                // ignore
              }
            }
            if (!monthVal) monthVal = 'January'

            paymentPayload.push({
              student_record_id: uuid,
              year: parseInt(row.Year || row.year || new Date().getFullYear()),
              month: monthVal,
              amount: amt,
              paid_at: paidAt,
              collected_by: profile.value?.id || userId.value,
            })
          }
        })

        if (paymentPayload.length > 0) {
          const { error: insertError } = await supabase.from('payments').insert(paymentPayload)
          if (insertError) throw insertError

          let msg = `Imported ${paymentPayload.length} payments successfully!`
          if (fallbackCount > 0) {
            msg += ` Warning: ${fallbackCount} records had invalid dates and used Today's date.`
            $q.notify({ type: 'warning', message: msg, timeout: 5000 })
          } else {
            $q.notify({ type: 'positive', message: msg })
          }
        } else {
          $q.notify({ type: 'warning', message: 'No valid payment records found to import' })
        }
      } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Payment import failed: ' + err.message })
      } finally {
        loadingBulkPayments.value = false
        event.target.value = ''
      }
    },
    error: (err) => {
      console.error(err)
      loadingBulkPayments.value = false
      $q.notify({ type: 'negative', message: 'Error parsing CSV' })
    },
  })
}

// End handlePortalCheckIn

const today = ref(new Date().toLocaleDateString('en-CA')) // YYYY-MM-DD format for q-date

const columns = [
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  {
    name: 'role',
    label: 'Role',
    field: 'role',
    align: 'left',
    sortable: true,
    style: 'width: 200px',
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
]

onMounted(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    userId.value = user?.id

    if (user) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (error) {
        fetchError.value = error.message
        console.error('Profile Load Error:', error)
      } else {
        profile.value = data
      }

      if (profile.value?.role === 'admin') {
        fetchTeam()
      }

      // Load Dashboard Stats for Teachers/Admins
      if (['admin', 'teacher', 'sub_admin', 'staff'].includes(profile.value?.role)) {
        fetchDashboardStats()
      }
    }
  } catch (e) {
    console.error(e)
    fetchError.value = e.message
  } finally {
    loading.value = false
  }
})

const fetchTeam = async () => {
  loadingTeam.value = true
  // Fetch all profiles for now (Super Admin view)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) {
    teamMembers.value = data
  }
  loadingTeam.value = false
}

const updateStatus = async (id, status) => {
  try {
    const { error } = await supabase.from('profiles').update({ status: status }).eq('id', id)

    if (error) throw error

    $q.notify({
      color: 'positive',
      message: `Status updated to ${status}`,
      icon: 'check',
    })
    fetchTeam()
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update status',
      icon: 'error',
    })
  }
}

const updateRole = async (id, role) => {
  try {
    const { error } = await supabase.from('profiles').update({ role: role }).eq('id', id)

    if (error) throw error

    $q.notify({
      color: 'positive',
      message: `Role updated to ${role}`,
      icon: 'check',
    })
    fetchTeam()
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update role',
      icon: 'error',
    })
  }
}

const openPermissionsDialog = (user) => {
  selectedUser.value = user
  // Parse existing permissions or default to false
  const defaults = {
    delete_payments: false,
    change_salary: false,
    edit_student_profile: false,
    view_profit_loss: false,
    manage_database: false,
  }
  // If user has permissions in DB, merge them
  permissionForm.value = { ...defaults, ...(user.permissions || {}) }
  permissionsDialog.value = true
}

const savePermissions = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ permissions: permissionForm.value })
      .eq('id', selectedUser.value.id)

    if (error) throw error

    $q.notify({ color: 'positive', message: 'Permissions saved successfully', icon: 'check' })
    permissionsDialog.value = false
    fetchTeam()
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Failed to save permissions', icon: 'error' })
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'green'
    case 'pending':
      return 'orange'
    case 'rejected':
      return 'red'
    default:
      return 'grey'
  }
}

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'red-9'
    case 'sub_admin':
      return 'deep-purple'
    case 'teacher':
      return 'blue'
    case 'staff':
      return 'teal'
    case 'student':
      return 'grey-7'
    default:
      return 'grey'
  }
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Super Admin'
    case 'sub_admin':
      return 'Sub-Admin'
    case 'teacher':
      return 'Teacher'
    case 'staff':
      return 'Staff/Reception'
    case 'student':
      return 'Student'
    default:
      return role
  }
}

const getRoleDescription = (role) => {
  switch (role) {
    case 'sub_admin':
      return 'Can check attendance, daily reports, and schedules.'
    case 'staff':
      return 'Can register students, collect fees, mark attendance.'
    case 'teacher':
      return 'Can view class lists, upload materials, add marks.'
    case 'student':
      return 'Can view own profile and results.'
    default:
      return ''
  }
}
</script>

<style scoped>
.border-radius-lg {
  border-radius: 16px;
}
.hover-card {
  transition: transform 0.2s;
}
.hover-card:hover {
  transform: translateY(-5px);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.border-red-left {
  border-left: 5px solid #d32f2f;
}
</style>
