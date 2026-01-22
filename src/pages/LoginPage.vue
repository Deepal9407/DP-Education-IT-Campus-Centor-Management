<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="auth-card q-pa-lg shadow-4" style="width: 100%; max-width: 400px">
      <q-card-section class="text-center">
        <q-avatar size="80px" font-size="40px" color="red-1" text-color="primary" icon="school" />
        <div class="text-h5 text-weight-bold q-mt-md text-primary">DP Education IT Campus</div>
        <div class="text-subtitle2 text-grey-7">Login to your account</div>
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
            :rules="[(val) => (val && val.length > 0) || 'Please enter your password']"
          />

          <div class="row justify-between items-center q-mt-sm">
            <q-checkbox v-model="rememberMe" label="Remember me" color="primary" />
            <a href="#" class="text-primary text-decoration-none" style="font-size: 0.9em"
              >Forgot Password?</a
            >
          </div>

          <div>
            <q-btn
              label="Login"
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
          Don't have an account?
          <router-link to="/register" class="text-primary text-weight-bold"
            >Register here</router-link
          >
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
const rememberMe = ref(false)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    // Check profile status
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'teacher' && profile?.status === 'pending') {
      await supabase.auth.signOut()
      throw new Error('Your account is pending approval by an administrator.')
    }

    if (profile?.status === 'rejected') {
      await supabase.auth.signOut()
      throw new Error('Your account has been rejected.')
    }

    $q.notify({
      color: 'positive',
      message: 'Login successful!',
      icon: 'check',
    })
    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.message || 'Login failed',
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
