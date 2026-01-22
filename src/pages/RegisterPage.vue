<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="auth-card q-pa-lg shadow-4" style="width: 100%; max-width: 400px">
      <q-card-section class="text-center">
        <q-avatar
          size="80px"
          font-size="40px"
          color="red-1"
          text-color="primary"
          icon="person_add"
        />
        <div class="text-h5 text-weight-bold q-mt-md text-primary">Create Account</div>
        <div class="text-subtitle2 text-grey-7">Join DP Education IT Campus</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            label="Email Address"
            type="email"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please enter your email']"
          />

          <q-input
            filled
            v-model="password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please enter your password',
              (val) => val.length >= 6 || 'Password must be at least 6 characters',
            ]"
          />

          <q-input
            filled
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please confirm your password',
              (val) => val === password || 'Passwords do not match',
            ]"
          />

          <div class="q-gutter-sm q-mb-md">
            <span class="text-grey-7 q-mr-sm">I am a:</span>
            <q-radio v-model="role" val="student" label="Student" />
            <q-radio v-model="role" val="teacher" label="Teacher" />
          </div>

          <div>
            <q-btn
              label="Register"
              type="submit"
              color="primary"
              unelevated
              rounded
              class="full-width q-mt-md"
              size="lg"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-7">
          Already have an account?
          <router-link to="/login" class="text-primary text-weight-bold">Login here</router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('student')
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          role: role.value,
        },
      },
    })

    if (error) throw error

    let msg = 'Registration successful!'
    if (role.value === 'teacher') {
      msg += ' Your account is pending approval.'
    }

    $q.notify({
      color: 'positive',
      message: msg,
      icon: 'check',
    })
    router.push('/login')
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.message || 'Registration failed',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  border-radius: 16px;
}
</style>
